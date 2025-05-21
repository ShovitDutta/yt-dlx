import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import Agent from "../../utils/Agent";
import progbar from "../../utils/ProgBar";
import { locator } from "../../utils/Locator";
import { Readable, PassThrough } from "stream";

const ZodSchema = z.object({
    query: z.string().min(2),
    output: z.string().optional(),
    useTor: z.boolean().optional(),
    stream: z.boolean().optional(),
    verbose: z.boolean().optional(),
    MetaData: z.boolean().optional(),
    ShowProgress: z.boolean().optional(),
    filter: z.enum(["invert", "rotate90", "rotate270", "grayscale", "rotate180", "flipVertical", "flipHorizontal"]).optional(),
});

type VideoHighestOptions = z.infer<typeof ZodSchema>;

export default async function VideoHighest({
    query,
    output,
    useTor,
    stream,
    filter,
    MetaData,
    verbose,
    ShowProgress,
}: VideoHighestOptions): Promise<{ MetaData: object } | { outputPath: string } | { stream: Readable; FileName: string }> {
    try {
        ZodSchema.parse({ query, output, useTor, stream, filter, MetaData, verbose, ShowProgress });

        if (MetaData && (stream || output || filter || ShowProgress)) {
            throw new Error(`${colors.red("@error:")} The 'MetaData' parameter cannot be used with 'stream', 'output', 'filter', or 'ShowProgress'.`);
        }
        if (stream && output) {
            throw new Error(`${colors.red("@error:")} The 'stream' parameter cannot be used with 'output'.`);
        }

        const EngineMeta = await Agent({ query, verbose, useTor });

        if (!EngineMeta) {
            throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        }
        // Access MetaData correctly from the new structure
        if (!EngineMeta.MetaData) {
            throw new Error(`${colors.red("@error:")} Metadata not found in the engine response.`);
        }

        if (MetaData) {
            return {
                MetaData: {
                    MetaData: EngineMeta.MetaData,
                    FileName: `yt-dlx_VideoHighest_${filter ? filter + "_" : ""}${EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "video"}.mkv`,
                    Links: {
                        HDR_Highest: EngineMeta.Video.HasHDR.Highest,
                        Highest: EngineMeta.Video.SingleQuality.Highest,
                        BestHighest: EngineMeta.Video.SingleQuality.Highest,
                    },
                },
            };
        }

        const title = EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "video";
        const folder = output ? output : process.cwd();

        if (!stream && !fs.existsSync(folder)) {
            try {
                fs.mkdirSync(folder, { recursive: true });
            } catch (mkdirError: any) {
                throw new Error(`${colors.red("@error:")} Failed to create output directory: ${mkdirError.message}`);
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
            if (EngineMeta.MetaData.thumbnails.Highest) {
                instance.addInput(EngineMeta.MetaData.thumbnails.Highest.url);
            }
        } catch (locatorError: any) {
            throw new Error(`${colors.red("@error:")} Failed to locate ffmpeg or ffprobe: ${locatorError.message}`);
        }

        // Get the highest quality manifest/video format
        const highestVideoManifest = EngineMeta.Manifest.SingleQuality.Highest;
        if (!highestVideoManifest || !highestVideoManifest.url) {
            throw new Error(`${colors.red("@error:")} Highest quality video URL not found.`);
        }
        instance.addInput(highestVideoManifest.url);

        instance.withOutputFormat("matroska");

        const filterMap: Record<string, string[]> = {
            grayscale: ["colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3"],
            invert: ["negate"],
            rotate90: ["rotate=PI/2"],
            rotate180: ["rotate=PI"],
            rotate270: ["rotate=3*PI/2"],
            flipHorizontal: ["hflip"],
            flipVertical: ["vflip"],
        };

        if (filter && filterMap[filter]) {
            instance.withVideoFilter(filterMap[filter]);
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
            const FileNameBase = `yt-dlx_VideoHighest_`;
            let FileName = `${FileNameBase}${filter ? filter + "_" : ""}${title}.mkv`;
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
            const FileNameBase = `yt-dlx_VideoHighest_`;
            let FileName = `${FileNameBase}${filter ? filter + "_" : ""}${title}.mkv`;
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
