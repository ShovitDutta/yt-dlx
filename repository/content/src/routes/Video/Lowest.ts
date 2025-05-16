import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import Agent from "../../utils/Agent";
import progbar from "../../utils/progbar";
import * as fsPromises from "fs/promises";
import { locator } from "../../utils/locator";
var ZodSchema = z.object({
    query: z.string().min(2),
    output: z.string().optional(),
    useTor: z.boolean().optional(),
    stream: z.boolean().optional(),
    verbose: z.boolean().optional(),
    metadata: z.boolean().optional(),
    filter: z.enum(["invert", "rotate90", "rotate270", "grayscale", "rotate180", "flipVertical", "flipHorizontal"]).optional(),
});
type MetadataResult = {
    metaData: any;
    BestVideoLow: any;
    VideoLowHDR: any;
    ManifestLow: any;
    filename: string;
};
type StreamResult = {
    filename: string;
    ffmpeg: ffmpeg.FfmpegCommand;
};
type DownloadResult = string;
type VideoLowestResult = MetadataResult | StreamResult | DownloadResult;
/**
 * @shortdesc Downloads, streams, or fetches metadata for the lowest quality video from YouTube using async/await instead of events.
 *
 * @description This function allows you to download, stream, or fetch metadata for the lowest available video quality from YouTube based on a search query or video URL using async/await.
 * It offers customization options such as saving the output to a specified directory, using Tor for anonymity, enabling verbose logging, streaming the output, or simply fetching the metadata without downloading. Video filters can also be applied.
 *
 * The function requires a search query or video URL. It automatically selects the lowest quality video format available based on the engine's results.
 *
 * It returns a Promise that resolves with the result of the operation (metadata object, stream info object, or output file path) or rejects with an error, replacing the EventEmitter pattern.
 *
 * @param options - An object containing the configuration options validated by ZodSchema.
 * @param options.query - The search query or video URL. **Required**.
 * @param {string} [options.output] - The directory where the output video file should be saved. Not allowed when `metadata` is true.
 * @param {boolean} [options.useTor] - Whether to attempt to use Tor for the network requests.
 * @param {boolean} [options.stream] - If true, the video will be processed for streaming instead of saved to a file. Not allowed when `metadata` is true. When streaming, the Promise resolves when FFmpeg starts with an object containing the filename (output path reference) and the FFmpeg instance.
 * @param {boolean} [options.verbose] - If true, enables detailed logging to the console, including FFmpeg command and progress.
 * @param {boolean} [options.metadata] - If true, the function will only fetch metadata without processing video. Not allowed with `output`, `stream`, or `filter`. The Promise resolves with a `MetadataResult` object.
 * @param {("invert" | "rotate90" | "rotate270" | "grayscale" | "rotate180" | "flipVertical" | "flipHorizontal")} [options.filter] - A video filter to apply. Ignored when `metadata` is true.
 *
 * @returns {Promise<VideoLowestResult>} A Promise that resolves based on the operation mode:
 * - If `metadata` is true: Resolves with a `MetadataResult` object.
 * - If `stream` is true (and `metadata` is false): Resolves with a `StreamResult` object when FFmpeg starts.
 * - If downloading (neither `metadata` nor `stream` is true): Resolves with the `DownloadResult` string (the output file path) when FFmpeg finishes successfully.
 * @throws {Error} Throws a formatted error if argument validation fails (ZodError), if the engine fails to retrieve data, if required metadata or formats are missing, if directory creation fails, if FFmpeg/FFprobe executables are not found, or if FFmpeg encounters an error during processing.
 */
export default async function VideoLowest({ query, stream, verbose, output, metadata, useTor, filter }: z.infer<typeof ZodSchema>): Promise<VideoLowestResult> {
    try {
        let startTime: [number, number] | undefined;
        if (!query) throw new Error(`${colors.red("@error:")} The 'query' parameter is always required.`);
        if (metadata) {
            if (stream) throw new Error(`${colors.red("@error:")} The 'stream' parameter cannot be used when 'metadata' is true.`);
            if (output) throw new Error(`${colors.red("@error:")} The 'output' parameter cannot be used when 'metadata' is true.`);
            if (filter) throw new Error(`${colors.red("@error:")} The 'filter' parameter cannot be used when 'metadata' is true.`);
        }
        if (stream && metadata) throw new Error(`${colors.red("@error:")} The 'stream' parameter cannot be true when 'metadata' is true.`);
        ZodSchema.parse({ query, stream, verbose, output, metadata, useTor, filter });
        const engineData = await Agent({ query, verbose, useTor });
        if (!engineData) throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        if (!engineData.metaData) throw new Error(`${colors.red("@error:")} Metadata not found in the engine response.`);
        if (metadata) {
            return {
                metaData: engineData.metaData,
                BestVideoLow: engineData.BestVideoLow,
                VideoLowHDR: engineData.VideoLowHDR,
                ManifestLow: engineData.ManifestLow,
                filename: engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "metadata",
            };
        }
        const title = engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "untitled";
        const folder = output ? output : process.cwd();
        try {
            await fsPromises.access(folder, fs.constants.F_OK);
            if (verbose) console.log(colors.green("@info:"), `Output directory already exists: ${folder}`);
        } catch (e: any) {
            if (e.code === "ENOENT") {
                if (verbose) console.log(colors.green("@info:"), `Output directory does not exist, attempting to create: ${folder}`);
                try {
                    await fsPromises.mkdir(folder, { recursive: true });
                    if (verbose) console.log(colors.green("@info:"), `Output directory created: ${folder}`);
                } catch (mkdirError: any) {
                    throw new Error(`${colors.red("@error:")} Failed to create output directory: ${mkdirError.message}`);
                }
            } else throw new Error(`${colors.red("@error:")} Error checking output directory: ${e.message}`);
        }
        const instance: ffmpeg.FfmpegCommand = ffmpeg();
        try {
            const paths = await locator();
            if (!paths.ffmpeg) throw new Error(`${colors.red("@error:")} ffmpeg executable not found.`);
            if (!paths.ffprobe) throw new Error(`${colors.red("@error:")} ffprobe executable not found.`);
            instance.setFfmpegPath(paths.ffmpeg);
            instance.setFfprobePath(paths.ffprobe);
        } catch (locatorError: any) {
            throw new Error(`${colors.red("@error:")} Failed to locate ffmpeg or ffprobe: ${locatorError.message}`);
        }
        const lqVideoUrl = engineData.BestVideoLow?.url;
        if (!lqVideoUrl) throw new Error(`${colors.red("@error:")} Lowest quality video URL not found.`);
        instance.addInput(lqVideoUrl);
        instance.withOutputFormat("mp4");
        const filenameBase = `yt-dlx_VideoLowest_`;
        const cleanTitleForFilename = engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "untitled";
        let filename = `${filenameBase}${filter ? filter + "_" : ""}${cleanTitleForFilename}.mp4`; // Use .mp4 extension
        const outputPath = path.join(folder, filename);
        const filterMap: Record<string, string[]> = {
            grayscale: ["colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3"],
            invert: ["negate"],
            rotate90: ["rotate=PI/2"],
            rotate180: ["rotate=PI"],
            rotate270: ["rotate=3*PI/2"],
            flipHorizontal: ["hflip"],
            flipVertical: ["vflip"],
        };
        if (filter && filterMap[filter]) instance.withVideoFilter(filterMap[filter]);
        else instance.outputOptions("-c copy");
        if (!stream) instance.output(outputPath);
        if (stream) {
            const streamReadyPromise = new Promise<StreamResult>((resolve, reject) => {
                instance.on("start", commandLine => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg command:", commandLine);
                    resolve({ filename: outputPath, ffmpeg: instance });
                });
                instance.on("progress", async progress => {
                    if (verbose && startTime !== undefined) await progbar({ percent: progress.percent ?? 0, baseTime: startTime });
                });
                instance.on("error", (error, stdout, stderr) => {
                    reject(new Error(`${colors.red("@error:")} FFmpeg error during stream setup: ${error.message}\nStdout: ${stdout}\nStderr: ${stderr}`));
                });
            });
            instance.run();
            return await streamReadyPromise;
        } else {
            const downloadCompletePromise = new Promise<DownloadResult>((resolve, reject) => {
                instance.on("start", commandLine => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg command:", commandLine);
                });
                instance.on("progress", async progress => {
                    if (verbose && startTime !== undefined) await progbar({ percent: progress.percent ?? 0, baseTime: startTime });
                });
                instance.on("error", (error, stdout, stderr) => {
                    reject(new Error(`${colors.red("@error:")} FFmpeg error during download: ${error.message}\nStdout: ${stdout}\nStderr: ${stderr}`));
                });
                instance.on("end", () => {
                    resolve(outputPath);
                });
            });
            instance.run();
            return await downloadCompletePromise;
        }
    } catch (error: any) {
        if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw new Error(`${colors.red("@error:")} ${error.message}`);
        else throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
