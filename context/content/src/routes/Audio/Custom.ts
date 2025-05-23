import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import Agent from "../../utils/Agent";
import progbar from "../../utils/ProgBar";
import { locator } from "../../utils/Locator";
import { Readable, PassThrough } from "stream";
import { EngineOutput, CleanedAudioFormat } from "../../interfaces/EngineOutput";

const ZodSchema = z.object({
    query: z.string().min(2),
    output: z.string().optional(),
    useTor: z.boolean().optional(),
    stream: z.boolean().optional(),
    verbose: z.boolean().optional(),
    MetaData: z.boolean().optional(),
    ShowProgress: z.boolean().optional(),
    resolution: z.enum(["high", "medium", "low", "ultralow"]), // Assuming these map to format_note or similar
    filter: z
        .enum(["echo", "slow", "speed", "phaser", "flanger", "panning", "reverse", "vibrato", "subboost", "surround", "bassboost", "nightcore", "superslow", "vaporwave", "superspeed"])
        .optional(),
});

type AudioCustomOptions = z.infer<typeof ZodSchema>;

export default async function AudioCustom({
    query,
    output,
    useTor,
    stream,
    filter,
    verbose,
    MetaData,
    resolution,
    ShowProgress,
}: AudioCustomOptions): Promise<{ MetaData: object } | { outputPath: string } | { stream: Readable; FileName: string }> {
    try {
        ZodSchema.parse({ query, output, useTor, stream, filter, verbose, MetaData, resolution, ShowProgress });

        if (MetaData && (stream || output || filter || ShowProgress)) {
            throw new Error(`${colors.red("@error:")} The 'MetaData' parameter cannot be used with 'stream', 'output', 'filter', or 'ShowProgress'.`);
        }
        if (stream && output) {
            throw new Error(`${colors.red("@error:")} The 'stream' parameter cannot be used with 'output'.`);
        }

        const EngineMeta: EngineOutput | null = await Agent({ query, verbose, useTor });

        if (!EngineMeta) {
            throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        }
        // Access MetaData correctly from the new structure
        if (!EngineMeta.MetaData) {
            throw new Error(`${colors.red("@error:")} Metadata was not found in the engine's response.`);
        }

        if (MetaData) {
            return {
                MetaData: {
                    MetaData: EngineMeta.MetaData,
                    FileName: `yt-dlx_AudioCustom_${resolution}_${filter ? filter + "_" : ""}${EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "audio"}.avi`,
                    Links: {
                        Standard: EngineMeta.AudioOnly.Standard,
                        Dynamic_Range_Compression: EngineMeta.AudioOnly.Dynamic_Range_Compression,
                    },
                },
            };
        }
        const title = EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "audio";
        const folder = output ? output : process.cwd();

        if (!stream && !fs.existsSync(folder)) {
            try {
                fs.mkdirSync(folder, { recursive: true });
            } catch (mkdirError: any) {
                throw new Error(`${colors.red("@error:")} Failed to create the output directory: ${mkdirError.message}`);
            }
        }

        const instance: ffmpeg.FfmpegCommand = ffmpeg();

        try {
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
        } catch (locatorError: any) {
            throw new Error(`${colors.red("@error:")} Failed to locate ffmpeg or ffprobe: ${locatorError.message}`);
        }

        // Find the custom audio format based on resolution
        // Note: The 'resolution' enum values ("high", "medium", "low", "ultralow")
        // might need to map to specific 'format_note' or 'tbr' values in your CleanedAudioFormat.
        // I'm assuming 'resolution' as provided maps to some string within 'format_note'.
        let AudioMeta: CleanedAudioFormat | undefined;
        for (const language in EngineMeta.AudioOnly.Standard) {
            AudioMeta = EngineMeta.AudioOnly.Standard[language].Combined.find(i => i.format_note?.toLowerCase().includes(resolution));
            if (AudioMeta) break;
        }
        if (!AudioMeta) {
             for (const language in EngineMeta.AudioOnly.Dynamic_Range_Compression) {
                AudioMeta = EngineMeta.AudioOnly.Dynamic_Range_Compression[language].Combined.find(i => i.format_note?.toLowerCase().includes(resolution));
                if (AudioMeta) break;
            }
        }


        if (!AudioMeta) {
            throw new Error(`${colors.red("@error:")} No Audio data found for the specified resolution: ${resolution}. Please use the 'Misc.Video.Extract()' command to see available formats.`);
        }
        if (!AudioMeta.url) {
            throw new Error(`${colors.red("@error:")} The audio URL was not found.`);
        }

        instance.addInput(AudioMeta.url);
        instance.withOutputFormat("avi");

        const filterMap: { [key: string]: string[] } = {
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

        if (filter && filterMap[filter]) {
            instance.withAudioFilter(filterMap[filter]);
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

        if (stream) {
            const passthroughStream = new PassThrough();
            const FileNameBase = `yt-dlx_AudioCustom_${resolution}_`;
            let FileName = `${FileNameBase}${filter ? filter + "_" : ""}${title}.avi`;
            (passthroughStream as any).FileName = FileName;

            instance.on("start", command => {
                if (verbose) console.log(colors.green("@info:"), "FFmpeg stream started:", command);
            });

            instance.pipe(passthroughStream, { end: true });

            instance.on("end", () => {
                if (verbose) console.log(colors.green("@info:"), "FFmpeg streaming finished.");
                if (ShowProgress) process.stdout.write("\n");
            });

            instance.on("error", (error, stdout, stderr) => {
                const errorMessage = `${colors.red("@error:")} FFmpeg stream error: ${error?.message}`;
                console.error(errorMessage, "\nstdout:", stdout, "\nstderr:", stderr);
                passthroughStream.emit("error", new Error(errorMessage));
                passthroughStream.destroy(new Error(errorMessage));
                if (ShowProgress) process.stdout.write("\n");
            });

            instance.run();
            return { stream: passthroughStream, FileName: FileName };
        } else {
            const FileNameBase = `yt-dlx_AudioCustom_${resolution}_`;
            let FileName = `${FileNameBase}${filter ? filter + "_" : ""}${title}.avi`;
            const outputPath = path.join(folder, FileName);

            instance.output(outputPath);

            await new Promise<void>((resolve, reject) => {
                instance.on("start", command => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg download started:", command);
                    if (ShowProgress) processStartTime = new Date();
                });

                instance.on("progress", progress => {
                    if (ShowProgress && processStartTime) {
                        progbar({ ...progress, percent: progress.percent !== undefined ? progress.percent : 0, startTime: processStartTime });
                    }
                });

                instance.on("end", () => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg download finished.");
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
        if (verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
