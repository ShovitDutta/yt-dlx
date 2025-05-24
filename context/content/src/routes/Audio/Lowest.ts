import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import Agent from "../../utils/Agent";
import progbar from "../../utils/ProgBar";
import { locator } from "../../utils/Locator";
import { Readable, PassThrough } from "stream";
import { EngineOutput } from "../../interfaces/EngineOutput";

const ZodSchema = z.object({
    Query: z.string().min(2),
    Output: z.string().optional(),
    UseTor: z.boolean().optional(),
    Stream: z.boolean().optional(),
    Verbose: z.boolean().optional(),
    MetaData: z.boolean().optional(),
    ShowProgress: z.boolean().optional(),
    Language: z.string().optional(),
    Filter: z
        .enum(["echo", "slow", "speed", "phaser", "flanger", "panning", "reverse", "vibrato", "subboost", "surround", "bassboost", "nightcore", "superslow", "vaporwave", "superspeed"])
        .optional(),
});

type AudioLowestOptions = z.infer<typeof ZodSchema>;

export default async function AudioLowest({
    Query,
    Output,
    UseTor,
    Stream,
    Filter,
    MetaData,
    Verbose,
    ShowProgress,
    Language,
}: AudioLowestOptions): Promise<{ MetaData: object } | { outputPath: string } | { Stream: Readable; FileName: string }> {
    try {
        ZodSchema.parse({ Query, Output, UseTor, Stream, Filter, MetaData, Verbose, ShowProgress, Language });
        if (MetaData && (Stream || Output || Filter || ShowProgress)) {
            throw new Error(`${colors.red("@error:")} The 'MetaData' parameter cannot be used with 'Stream', 'output', 'Filter', or 'ShowProgress'.`);
        }
        if (Stream && Output) throw new Error(`${colors.red("@error:")} The 'Stream' parameter cannot be used with 'output'.`);
        const EngineMeta: EngineOutput | null = await Agent({ Query: Query, Verbose: Verbose, UseTor: UseTor });
        if (!EngineMeta) throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        if (!EngineMeta.MetaData) throw new Error(`${colors.red("@error:")} Metadata was not found in the engine response.`);
        if (MetaData) {
            return {
                MetaData: {
                    MetaData: EngineMeta.MetaData,
                    FileName: `yt-dlx_AudioLowest_${Filter ? Filter + "_" : ""}${EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "audio"}.avi`,
                    Links: {
                        Standard_Lowest: EngineMeta.AudioOnly.Standard[Language || "Unknown"]?.Lowest,
                        DRC_Lowest: EngineMeta.AudioOnly.Dynamic_Range_Compression[Language || "Unknown"]?.Lowest,
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
        const instance: ffmpeg.FfmpegCommand = ffmpeg();
        const paths = await locator();
        if (!paths.ffmpeg) {
            throw new Error(`${colors.red("@error:")} ffmpeg executable not found.`);
        }
        if (!paths.ffprobe) {
            throw new Error(`${colors.red("@error:")} ffprobe executable not found.`);
        }
        instance.setFfmpegPath(paths.ffmpeg);
        instance.setFfprobePath(paths.ffprobe);
        if (EngineMeta.Thumbnails.Highest?.url) {
            instance.addInput(EngineMeta.Thumbnails.Highest.url);
        }

        // Use the Lowest quality audio from the Standard category for the specified language
        const lowestQualityAudio = EngineMeta.AudioOnly.Standard[Language || "Unknown"]?.Lowest;
        // Use Language parameter

        if (!lowestQualityAudio?.url) {
            throw new Error(`${colors.red("@error:")} Lowest quality audio URL was not found for language: ${Language || "Unknown"}.`);
            // Updated error message
        }

        instance.addInput(lowestQualityAudio.url!);

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

        if (Filter && filterMap[Filter]) {
            // Changed Filter
            instance.withAudioFilter(filterMap[Filter]);
            // Changed Filter
        } else {
            instance.outputOptions("-c copy");
        }

        let processStartTime: Date;

        if (ShowProgress) {
            instance.on("start", () => {
                processStartTime = new Date();
            });
            instance.on("progress", progress => {
                if (processStartTime) {
                    progbar({ ...progress, percent: progress.percent !== undefined ? progress.percent : 0, startTime: processStartTime });
                }
            });
        }

        if (Stream) {
            // Changed Stream
            const passthroughStream = new PassThrough();
            const FileNameBase = `yt-dlx_AudioLowest_`;
            let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.avi`;
            // Changed Filter
            (passthroughStream as any).FileName = FileName;

            instance.on("start", command => {
                if (Verbose) console.log(colors.green("@info:"), "FFmpeg Stream started:", command);
                // Changed Verbose
            });

            instance.pipe(passthroughStream, { end: true });

            instance.on("end", () => {
                if (Verbose) console.log(colors.green("@info:"), "FFmpeg streaming finished.");
                // Changed Verbose
                if (ShowProgress) process.stdout.write("\n");
            });

            instance.on("error", (error, stdout, stderr) => {
                const errorMessage = `${colors.red("@error:")} FFmpeg Stream error: ${error?.message}`;
                console.error(errorMessage, "\nstdout:", stdout, "\nstderr:", stderr);
                passthroughStream.emit("error", new Error(errorMessage));
                passthroughStream.destroy(new Error(errorMessage));
                if (ShowProgress) process.stdout.write("\n");
            });

            instance.run();
            return { Stream: passthroughStream, FileName: FileName };
        } else {
            const FileNameBase = `yt-dlx_AudioLowest_`;
            let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.avi`;
            // Changed Filter
            const outputPath = path.join(folder, FileName);

            instance.output(outputPath);

            await new Promise<void>((resolve, reject) => {
                instance.on("start", command => {
                    if (Verbose) console.log(colors.green("@info:"), "FFmpeg download started:", command);
                    // Changed Verbose
                    if (ShowProgress) processStartTime = new Date();
                });

                instance.on("progress", progress => {
                    if (ShowProgress && processStartTime) {
                        progbar({ ...progress, percent: progress.percent !== undefined ? progress.percent : 0, startTime: processStartTime });
                    }
                });

                instance.on("end", () => {
                    if (Verbose) console.log(colors.green("@info:"), "FFmpeg download finished.");
                    // Changed Verbose
                    if (ShowProgress) process.stdout.write("\n");
                    resolve();
                });

                instance.on("error", (error, stdout, stderr) => {
                    const errorMessage = `${colors.red("@error:")} FFmpeg download error: ${error?.message}`;
                    console.error(errorMessage, "\nstdout:", stdout, "\nstderr:", stderr);
                    if (ShowProgress) process.stdout.write("\n");
                    reject(new Error(errorMessage));
                });

                instance.run();
            });
            return { outputPath };
        }
    } catch (error: any) {
        if (error instanceof ZodError) {
            const errorMessage = `${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        } else if (error instanceof Error) {
            console.error(error.message);
            throw error;
        } else {
            const unexpectedError = `${colors.red("@error:")} An unexpected error occurred: ${String(error)}`;
            console.error(unexpectedError);
            throw new Error(unexpectedError);
        }
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
        // Changed Verbose
    }
}
