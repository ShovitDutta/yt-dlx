import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import M3u8 from "../../utils/M3u8";
import Agent from "../../utils/Agent";
import progbar from "../../utils/ProgBar";
import { locator } from "../../utils/Locator";
import { Readable, PassThrough } from "stream";
import { EngineOutput, CleanedAudioFormat, CleanedVideoFormat } from "../../interfaces/EngineOutput";

const ZodSchema = z.object({
    Query: z.string().min(2),
    Output: z.string().optional(),
    UseTor: z.boolean().optional(),
    Stream: z.boolean().optional(),
    Verbose: z.boolean().optional(),
    VideoFPS: z.number().optional(),
    MetaData: z.boolean().optional(),
    ShowProgress: z.boolean().optional(),
    AudioLanguage: z.string().optional(),
    AudioFormatId: z.string().optional(),
    AudioBitrate: z.number().optional(),
    VideoFormatId: z.string().optional(),
    VideoResolution: z.string().optional(),
    Filter: z.enum(["invert", "rotate90", "rotate270", "grayscale", "rotate180", "flipVertical", "flipHorizontal"]).optional(),
});
type AudioVideoCustomOptions = z.infer<typeof ZodSchema>;

export default async function AudioVideoCustom({
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
    VideoFormatId,
    VideoResolution,
    VideoFPS,
}: AudioVideoCustomOptions): Promise<{ MetaData: object } | { OutputPath: string } | { Stream: Readable; FileName: string }> {
    try {
        ZodSchema.parse({ Query, Output, UseTor, Stream, Filter, MetaData, Verbose, ShowProgress, AudioLanguage, AudioFormatId, AudioBitrate, VideoFormatId, VideoResolution, VideoFPS });

        if (MetaData && (Stream || Output || Filter || ShowProgress || AudioLanguage || AudioFormatId || AudioBitrate || VideoFormatId || VideoResolution || VideoFPS)) {
            throw new Error(`${colors.red("@error:")} The 'MetaData' parameter cannot be used with other processing parameters.`);
        }
        if (Stream && Output) throw new Error(`${colors.red("@error:")} The 'Stream' parameter cannot be used with 'Output'.`);
        if (AudioFormatId && AudioBitrate) {
            throw new Error(`${colors.red("@error:")} The 'AudioFormatId' and 'AudioBitrate' parameters cannot be used together. Please specify only one audio custom parameter.`);
        }
        if ((VideoFormatId && VideoResolution) || (VideoFormatId && VideoFPS) || (VideoResolution && VideoFPS)) {
            throw new Error(`${colors.red("@error:")} Please specify only one of 'VideoFormatId', 'VideoResolution', or 'VideoFPS'.`);
        }

        if (MetaData) {
            const EngineMeta: EngineOutput | null = await Agent({ Query: Query, Verbose: Verbose, UseTor: UseTor });
            if (!EngineMeta) throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
            if (!EngineMeta.MetaData) throw new Error(`${colors.red("@error:")} Metadata was not found in the engine response.`);
            return {
                MetaData: {
                    MetaData: EngineMeta.MetaData,
                    FileName: `yt-dlx_AudioVideoCustom_${Filter ? Filter + "_" : ""}${EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "video"}.mkv`,
                    Links: {
                        Audio: EngineMeta.AudioOnly.Standard[AudioLanguage || "Unknown"]?.Combined,
                        AudioDRC: EngineMeta.AudioOnly.Dynamic_Range_Compression[AudioLanguage || "Unknown"]?.Combined,
                        VideoSDR: EngineMeta.VideoOnly.Standard_Dynamic_Range.Combined,
                        VideoHDR: EngineMeta.VideoOnly.High_Dynamic_Range.Combined,
                    },
                },
            };
        }

        const EngineMeta: EngineOutput | null = await Agent({ Query: Query, Verbose: Verbose, UseTor: UseTor });
        if (!EngineMeta) throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        if (!EngineMeta.MetaData) throw new Error(`${colors.red("@error:")} Metadata was not found in the engine response.`);

        const title = EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "video";
        const folder = Output ? Output : process.cwd();
        if (!Stream && !fs.existsSync(folder)) {
            try {
                fs.mkdirSync(folder, { recursive: true });
            } catch (mkdirError: any) {
                throw new Error(`${colors.red("@error:")} Failed to create the output directory: ${mkdirError.message}`);
            }
        }

        let selectedAudioFormat: CleanedAudioFormat | undefined;
        let selectedVideoFormat: CleanedVideoFormat | undefined;
        const availableAudioFormats = [
            ...(EngineMeta.AudioOnly.Standard[AudioLanguage || "Unknown"]?.Combined || []),
            ...(EngineMeta.AudioOnly.Dynamic_Range_Compression[AudioLanguage || "Unknown"]?.Combined || []),
        ];
        if (AudioFormatId) {
            selectedAudioFormat = availableAudioFormats.find(format => format.format_id === AudioFormatId);
            if (!selectedAudioFormat) throw new Error(`${colors.red("@error:")} Audio format with ID '${AudioFormatId}' not found for language '${AudioLanguage || "Unknown"}'.`);
        } else if (AudioBitrate) {
            selectedAudioFormat = availableAudioFormats.reduce((prev: CleanedAudioFormat | undefined, curr: CleanedAudioFormat) => {
                if (curr.tbr === undefined || curr.tbr === null) return prev;
                if (prev === undefined || prev.tbr === undefined || prev.tbr === null) return curr;
                return Math.abs(curr.tbr - AudioBitrate) < Math.abs(prev.tbr - AudioBitrate) ? curr : prev;
            }, undefined);
            if (!selectedAudioFormat || selectedAudioFormat.tbr === undefined || selectedAudioFormat.tbr === null) {
                throw new Error(`${colors.red("@error:")} No audio format found with a valid bitrate close to ${AudioBitrate} for language '${AudioLanguage || "Unknown"}'.`);
            }
        } else {
            selectedAudioFormat = EngineMeta.AudioOnly.Standard[AudioLanguage || "Unknown"]?.Highest || availableAudioFormats.find(format => format.url !== undefined);
            if (!selectedAudioFormat || !selectedAudioFormat.url) throw new Error(`${colors.red("@error:")} No suitable audio formats found for language '${AudioLanguage || "Unknown"}'.`);
        }
        const availableVideoFormats = [...(EngineMeta.VideoOnly.Standard_Dynamic_Range.Combined || []), ...(EngineMeta.VideoOnly.High_Dynamic_Range.Combined || [])];
        if (VideoFormatId) {
            selectedVideoFormat = availableVideoFormats.find(format => format.format_id === VideoFormatId);
            if (!selectedVideoFormat) throw new Error(`${colors.red("@error:")} Video format with ID '${VideoFormatId}' not found.`);
        } else if (VideoResolution) {
            selectedVideoFormat = availableVideoFormats.find(format => format.resolution === VideoResolution);
            if (!selectedVideoFormat) throw new Error(`${colors.red("@error:")} Video format with resolution '${VideoResolution}' not found.`);
        } else if (VideoFPS) {
            selectedVideoFormat = availableVideoFormats.find(format => format.fps === VideoFPS);
            if (!selectedVideoFormat) throw new Error(`${colors.red("@error:")} Video format with FPS '${VideoFPS}' not found.`);
        } else {
            selectedVideoFormat = EngineMeta.VideoOnly.Standard_Dynamic_Range.Highest || availableVideoFormats.find(format => format.url !== undefined);
            if (!selectedVideoFormat || !selectedVideoFormat.url) throw new Error(`${colors.red("@error:")} No suitable video formats found.`);
        }
        if (!selectedAudioFormat?.url) throw new Error(`${colors.red("@error:")} Selected audio format URL was not found.`);
        if (!selectedVideoFormat?.url) throw new Error(`${colors.red("@error:")} Selected video format URL was not found.`);

        const paths = await locator();
        if (!paths.ffmpeg) throw new Error(`${colors.red("@error:")} ffmpeg executable not found.`);
        if (!paths.ffprobe) throw new Error(`${colors.red("@error:")} ffprobe executable not found.`);

        const main = new M3u8({
            Video_M3u8_URL: selectedVideoFormat.url,
            Audio_M3u8_URL: selectedAudioFormat.url,
            Verbose: Verbose,
            FFmpegPath: paths.ffmpeg,
            FFprobePath: paths.ffprobe,
            configure: instance => {
                if (EngineMeta.Thumbnails.Highest?.url) instance.addInput(EngineMeta.Thumbnails.Highest.url);

                instance.withOutputFormat("matroska");

                const filterMap: Record<string, string[]> = {
                    invert: ["negate"],
                    flipVertical: ["vflip"],
                    rotate180: ["rotate=PI"],
                    rotate90: ["rotate=PI/2"],
                    flipHorizontal: ["hflip"],
                    rotate270: ["rotate=3*PI/2"],
                    grayscale: ["colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3"],
                };
                if (Filter && filterMap[Filter]) {
                    instance.withVideoFilter(filterMap[Filter]);
                }
                instance.inputOptions(["-protocol_whitelist file,http,https,tcp,tls,crypto", "-reconnect 1", "-reconnect_streamed 1", "-reconnect_delay_max 5"]);

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
                    const FileNameBase = `yt-dlx_AudioVideoCustom_`;
                    let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.mkv`;
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
                    const FileNameBase = `yt-dlx_AudioVideoCustom_`;
                    let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.mkv`;
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
            const FileNameBase = `yt-dlx_AudioVideoCustom_`;
            let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.mkv`;
            (passthroughStream as any).FileName = FileName;

            ffmpegCommand.pipe(passthroughStream, { end: true });

            return { Stream: passthroughStream, FileName: FileName };
        } else {
            const FileNameBase = `yt-dlx_AudioVideoCustom_`;
            let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.mkv`;
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
