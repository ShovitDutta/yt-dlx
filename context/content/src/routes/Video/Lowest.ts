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
    Filter: z.enum(["invert", "rotate90", "rotate270", "grayscale", "rotate180", "flipVertical", "flipHorizontal"]).optional(),
});

type VideoLowestOptions = z.infer<typeof ZodSchema>;

export default async function VideoLowest({
    Query,
    Output,
    UseTor,
    Stream,
    Filter,
    MetaData,
    Verbose,
    ShowProgress,
}: VideoLowestOptions): Promise<{ MetaData: object } | { outputPath: string } | { Stream: Readable; FileName: string }> {
    try {
        ZodSchema.parse({ Query, Output, UseTor, Stream, Filter, MetaData, Verbose, ShowProgress });

        if (MetaData && (Stream || Output || Filter || ShowProgress)) {
            throw new Error(`${colors.red("@error:")} The 'MetaData' parameter cannot be used with 'Stream', 'Output', 'Filter', or 'ShowProgress'.`);
        }
        if (Stream && Output) throw new Error(`${colors.red("@error:")} The 'Stream' parameter cannot be used with 'Output'.`);

        const EngineMeta: EngineOutput | null = await Agent({ Query, Verbose, UseTor });

        if (!EngineMeta) throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);

        if (!EngineMeta.MetaData) throw new Error(`${colors.red("@error:")} Metadata not found in the engine response.`);

        if (MetaData) {
            return {
                MetaData: {
                    MetaData: EngineMeta.MetaData,
                    FileName: `yt-dlx_VideoLowest_${Filter ? Filter + "_" : ""}${EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "video"}.mkv`,
                    Links: {
                        Standard_Lowest: EngineMeta.VideoOnly.Standard_Dynamic_Range.Lowest,
                        HDR_Lowest: EngineMeta.VideoOnly.High_Dynamic_Range.Lowest,
                    },
                },
            };
        }
        const title = EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "video";
        const folder = Output ? Output : process.cwd();

        if (!Stream && !fs.existsSync(folder)) {
            try {
                fs.mkdirSync(folder, { recursive: true });
            } catch (mkdirError: any) {
                throw new Error(`${colors.red("@error:")} Failed to create Output directory: ${mkdirError.message}`);
            }
        }

        const instance: ffmpeg.FfmpegCommand = ffmpeg();

        const paths = await locator();
        if (!paths.ffmpeg) throw new Error(`${colors.red("@error:")} ffmpeg executable not found.`);

        if (!paths.ffprobe) throw new Error(`${colors.red("@error:")} ffprobe executable not found.`);

        instance.setFfmpegPath(paths.ffmpeg);
        instance.setFfprobePath(paths.ffprobe);
        if (EngineMeta.Thumbnails.Highest?.url) instance.addInput(EngineMeta.Thumbnails.Highest.url);

        const lowestVideo = EngineMeta.VideoOnly.Standard_Dynamic_Range.Lowest;
        if (!lowestVideo || !lowestVideo.url) throw new Error(`${colors.red("@error:")} Lowest quality video URL not found.`);

        instance.addInput(lowestVideo.url);

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

        if (Filter && filterMap[Filter]) instance.withVideoFilter(filterMap[Filter]);
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
            const FileNameBase = `yt-dlx_VideoLowest_`;
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

            instance.run();
            return { Stream: passthroughStream, FileName: FileName };
        } else {
            const FileNameBase = `yt-dlx_VideoLowest_`;
            let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.mkv`;
            const outputPath = path.join(folder, FileName);

            instance.output(outputPath);

            await new Promise<void>((resolve, reject) => {
                instance.on("start", command => {
                    if (Verbose) console.log(colors.green("@info:"), "FFmpeg download started:", command);
                    if (ShowProgress) processStartTime = new Date();
                });

                instance.on("progress", progress => {
                    if (ShowProgress && processStartTime) progbar({ ...progress, percent: progress.percent !== undefined ? progress.percent : 0, startTime: processStartTime });
                });

                instance.on("end", () => {
                    if (Verbose) console.log(colors.green("@info:"), "FFmpeg download finished.");
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
    }
}
