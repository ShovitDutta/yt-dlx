import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import M3u8 from "../../utils/M3u8";
import Agent from "../../utils/Agent";
import progbar from "../../utils/ProgBar";
import { locator } from "../../utils/Locator";
import { Readable, PassThrough } from "stream";
import { EngineOutput, CleanedAudioFormat } from "../../interfaces/EngineOutput";
import ffmpeg from "fluent-ffmpeg"; // Keep import for type hinting in configure

const ZodSchema = z.object({
    Query: z.string().min(2),
    Output: z.string().optional(),
    UseTor: z.boolean().optional(),
    Stream: z.boolean().optional(),
    Verbose: z.boolean().optional(),
    MetaData: z.boolean().optional(),
    ShowProgress: z.boolean().optional(),
    AudioLanguage: z.string().optional(),
    Filter: z
        .enum(["echo", "slow", "speed", "phaser", "flanger", "panning", "reverse", "vibrato", "subboost", "surround", "bassboost", "nightcore", "superslow", "vaporwave", "superspeed"])
        .optional(),
    AudioFormatId: z.string().optional(),
    AudioBitrate: z.number().optional(),
});
type AudioCustomOptions = z.infer<typeof ZodSchema>;

export default async function AudioCustom({
    Query,
    Output,
    UseTor,
    Stream,
    Filter,
    MetaData,
    Verbose,
    ShowProgress,
    AudioLanguage,
    AudioFormatId,
    AudioBitrate,
}: AudioCustomOptions): Promise<{ MetaData: object } | { OutputPath: string } | { Stream: Readable; FileName: string }> {
    try {
        ZodSchema.parse({ Query, Output, UseTor, Stream, Filter, MetaData, Verbose, ShowProgress, AudioLanguage, AudioFormatId, AudioBitrate });

        if (MetaData && (Stream || Output || Filter || ShowProgress || AudioFormatId || AudioBitrate)) {
            throw new Error(`${colors.red("@error:")} The 'MetaData' parameter cannot be used with other processing parameters.`);
        }
        if (Stream && Output) throw new Error(`${colors.red("@error:")} The 'Stream' parameter cannot be used with 'Output'.`);
        if (AudioFormatId && AudioBitrate) throw new Error(`${colors.red("@error:")} The 'AudioFormatId' and 'AudioBitrate' parameters cannot be used together. Please specify only one.`);

        const EngineMeta: EngineOutput | null = await Agent({ Query: Query, Verbose: Verbose, UseTor: UseTor });
        if (!EngineMeta) throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        if (!EngineMeta.MetaData) throw new Error(`${colors.red("@error:")} Metadata was not found in the engine response.`);

        if (MetaData) {
            return {
                MetaData: {
                    MetaData: EngineMeta.MetaData,
                    FileName: `yt-dlx_AudioCustom_${Filter ? Filter + "_" : ""}${EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "audio"}.avi`,
                    Links: {
                        Audio: EngineMeta.AudioOnly.Standard[AudioLanguage || "Default"]?.Combined,
                        AudioDRC: EngineMeta.AudioOnly.Dynamic_Range_Compression[AudioLanguage || "Default"]?.Combined,
                    },
                },
            };
        }

        const title = EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "audio";
        const folder = Output ? Output : process.cwd();

        if (!Stream && !fs.existsSync(folder)) {
            try {
                fs.mkdirSync(folder, { recursive: true });
            } catch (mkdirError: any) {
                throw new Error(`${colors.red("@error:")} Failed to create the output directory: ${mkdirError.message}`);
            }
        }

        let selectedAudioFormat: CleanedAudioFormat | undefined;
        const availableAudioFormats = [
            ...(EngineMeta.AudioOnly.Standard[AudioLanguage || "Default"]?.Combined || []),
            ...(EngineMeta.AudioOnly.Dynamic_Range_Compression[AudioLanguage || "Default"]?.Combined || []),
        ];
        if (AudioFormatId) {
            selectedAudioFormat = availableAudioFormats.find(format => format.format_id === AudioFormatId);
            if (!selectedAudioFormat) throw new Error(`${colors.red("@error:")} Audio format with ID '${AudioFormatId}' not found for language '${AudioLanguage || "Default"}'.`);
        } else if (AudioBitrate) {
            selectedAudioFormat = availableAudioFormats.reduce((prev: CleanedAudioFormat | undefined, curr: CleanedAudioFormat) => {
                if (curr.tbr === undefined || curr.tbr === null) return prev;
                if (prev === undefined || prev.tbr === undefined || prev.tbr === null) return curr;
                return Math.abs(curr.tbr - AudioBitrate) < Math.abs(prev.tbr - AudioBitrate) ? curr : prev;
            }, undefined);
            if (!selectedAudioFormat || selectedAudioFormat.tbr === undefined || selectedAudioFormat.tbr === null) {
                throw new Error(`${colors.red("@error:")} No audio format found with a valid bitrate close to ${AudioBitrate} for language '${AudioLanguage || "Default"}'.`);
            }
        } else {
            selectedAudioFormat = EngineMeta.AudioOnly.Standard[AudioLanguage || "Default"]?.Highest || availableAudioFormats.find(format => format.url !== undefined);
            if (!selectedAudioFormat || !selectedAudioFormat.url) throw new Error(`${colors.red("@error:")} No suitable audio formats found for language '${AudioLanguage || "Default"}'.`);
        }
        if (!selectedAudioFormat.url) throw new Error(`${colors.red("@error:")} Selected audio format URL was not found.`);

        const paths = await locator();
        if (!paths.ffmpeg) throw new Error(`${colors.red("@error:")} ffmpeg executable not found.`);
        if (!paths.ffprobe) throw new Error(`${colors.red("@error:")} ffprobe executable not found.`);

        const main = new M3u8({
            Audio_M3u8_URL: selectedAudioFormat.url,
            Verbose: Verbose,
            FFmpegPath: paths.ffmpeg,
            FFprobePath: paths.ffprobe,
            configure: instance => {
                if (EngineMeta.Thumbnails.Highest?.url) instance.addInput(EngineMeta.Thumbnails.Highest.url);

                instance.withOutputFormat("avi");

                const filterMap: Record<string, string[]> = {
                    speed: ["atempo=2"],
                    flanger: ["flanger"],
                    slow: ["atempo=0.8"],
                    reverse: ["areverse"],
                    surround: ["surround"],
                    subboost: ["asubboost"],
                    superspeed: ["atempo=3"],
                    superslow: ["atempo=0.5"],
                    vibrato: ["vibrato=f=6.5"],
                    panning: ["apulsator=hz=0.08"],
                    phaser: ["aphaser=in_gain=0.4"],
                    echo: ["aecho=0.8:0.9:1000:0.3"],
                    bassboost: ["bass=g=10,dynaudnorm=f=150"],
                    vaporwave: ["aresample=48000,asetrate=48000*0.8"],
                    nightcore: ["aresample=48000,asetrate=48000*1.25"],
                };
                if (Filter && filterMap[Filter]) instance.withAudioFilter(filterMap[Filter]);
                else instance.outputOptions("-c copy");

                let processStartTime: Date;
                if (ShowProgress) {
                    instance.on("start", () => {
                        processStartTime = new Date();
                    });
                    instance.on("progress", progress => {
                        if (processStartTime) progbar({ ...progress, percent: progress.percent !== undefined ? progress.percent : 0, startTime: processStartTime });
                    });
                }

                if (Stream) {
                    const passthroughStream = new PassThrough();
                    const FileNameBase = `yt-dlx_AudioCustom_`;
                    let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.avi`;
                    (passthroughStream as any).FileName = FileName;

                    instance.on("start", command => {
                        if (Verbose) console.log(colors.green("@info:"), "FFmpeg Stream started:", command);
                    });
                    instance.pipe(passthroughStream, { end: true });
                    instance.on("end", () => {
                        if (Verbose) console.log(colors.green("@info:"), "FFmpeg streaming finished.");
                        if (ShowProgress) process.stdout.write("\n");
                    });
                    instance.on("error", (error, stdout, stderr) => {
                        const errorMessage = `${colors.red("@error:")} FFmpeg Stream error: ${error?.message}`;
                        console.error(errorMessage, "\nstdout:", stdout, "\nstderr:", stderr);
                        passthroughStream.emit("error", new Error(errorMessage));
                        passthroughStream.destroy(new Error(errorMessage));
                        if (ShowProgress) process.stdout.write("\n");
                    });

                } else {
                    const FileNameBase = `yt-dlx_AudioCustom_`;
                    let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.avi`;
                    const OutputPath = path.join(folder, FileName);
                    instance.output(OutputPath);

                    instance.on("start", command => {
                        if (Verbose) console.log(colors.green("@info:"), "FFmpeg download started:", command);
                        if (ShowProgress) processStartTime = new Date();
                    });
                    instance.on("progress", progress => {
                        if (ShowProgress && processStartTime) {
                            progbar({ ...progress, percent: progress.percent !== undefined ? progress.percent : 0, startTime: processStartTime });
                        }
                    });
                    instance.on("end", () => {
                        if (Verbose) console.log(colors.green("@info:"), "FFmpeg download finished.");
                        if (ShowProgress) process.stdout.write("\n");
                    });
                    instance.on("error", (error, stdout, stderr) => {
                        const errorMessage = `${colors.red("@error:")} FFmpeg download error: ${error?.message}`;
                        console.error(errorMessage, "\nstdout:", stdout, "\nstderr:", stderr);
                        if (ShowProgress) process.stdout.write("\n");
                    });
                }
            },
        });

        const ffmpegCommand = await main.getFfmpegCommand();

        if (Stream) {
            const passthroughStream = new PassThrough();
            const FileNameBase = `yt-dlx_AudioCustom_`;
            let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.avi`;
            (passthroughStream as any).FileName = FileName;

            ffmpegCommand.pipe(passthroughStream, { end: true });

            return { Stream: passthroughStream, FileName: FileName };
        } else {
            const FileNameBase = `yt-dlx_AudioCustom_`;
            let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.avi`;
            const OutputPath = path.join(folder, FileName);

            await new Promise<void>((resolve, reject) => {
                ffmpegCommand.on("end", () => resolve());
                ffmpegCommand.on("error", (error, stdout, stderr) => {
                     const errorMessage = `${colors.red("@error:")} FFmpeg download error: ${error?.message}`;
                     console.error(errorMessage, "\nstdout:", stdout, "\nstderr:", stderr);
                     if (ShowProgress) process.stdout.write("\n");
                     reject(new Error(errorMessage));
                });
                ffmpegCommand.run();
            });

            return { OutputPath };
        }

    } catch (error) {
        if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw error;
        else throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
