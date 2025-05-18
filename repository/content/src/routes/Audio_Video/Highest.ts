import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import Tuber from "../../utils/Agent";
import { locator } from "../../utils/locator";
import { Readable, PassThrough } from "stream";
function formatTime(seconds: number): string {
    if (!isFinite(seconds) || isNaN(seconds)) return "00h 00m 00s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
}
function calculateETA(startTime: Date, percent: number): number {
    const currentTime = new Date();
    const elapsedTime = (currentTime.getTime() - startTime.getTime()) / 1000;
    if (percent <= 0) return NaN;
    const totalTimeEstimate = (elapsedTime / percent) * 100;
    const remainingTime = totalTimeEstimate - elapsedTime;
    return remainingTime;
}
function progbar({ percent, timemark, startTime }: { percent: number | undefined; timemark: string; startTime: Date }) {
    let displayPercent = isNaN(percent || 0) ? 0 : percent || 0;
    displayPercent = Math.min(Math.max(displayPercent, 0), 100);
    const colorFn = displayPercent < 25 ? colors.red : displayPercent < 50 ? colors.yellow : colors.green;
    const width = Math.floor((process.stdout.columns || 80) / 4);
    const scomp = Math.round((width * displayPercent) / 100);
    const progb = colorFn("━").repeat(scomp) + colorFn(" ").repeat(width - scomp);
    const etaSeconds = calculateETA(startTime, displayPercent);
    const etaFormatted = formatTime(etaSeconds);
    process.stdout.write(`\r${colorFn("@prog:")} ${progb} ${colorFn("| @percent:")} ${displayPercent.toFixed(2)}% ${colorFn("| @timemark:")} ${timemark} ${colorFn("| @eta:")} ${etaFormatted}`);
}
const ZodSchema = z.object({
    query: z.string().min(2),
    output: z.string().optional(),
    useTor: z.boolean().optional(),
    stream: z.boolean().optional(),
    verbose: z.boolean().optional(),
    metadata: z.boolean().optional(),
    showProgress: z.boolean().optional(),
    filter: z.enum(["invert", "rotate90", "rotate270", "grayscale", "rotate180", "flipVertical", "flipHorizontal"]).optional(),
});
type AudioVideoHighestOptions = z.infer<typeof ZodSchema>;
/**
 * @shortdesc Downloads or streams the highest quality audio and the video thumbnail as a static image, with video filters, from YouTube videos/queries.
 *
 * @description This function fetches the highest available quality audio stream from a YouTube video identified by a query or URL.
 * It uses the video's thumbnail as a static video input and utilizes FFmpeg to combine these streams (effectively creating a video file with the static thumbnail and the audio), process the static video (optionally apply video filters), and output the result.
 * The output can be either a downloadable file saved locally or a readable stream.
 * The function also supports fetching only the video's metadata, including information about the highest quality audio and video formats available.
 *
 * It requires a valid search query or URL to identify the YouTube video.
 * FFmpeg and FFprobe executables must be available in the system's PATH or locatable by the internal `locator` utility.
 *
 * The function supports the following configuration options:
 * - **Query:** A string representing the Youtube query or URL. Must be at least 2 characters long. **Required**.
 * - **Output:** An optional string specifying the directory path where the downloaded file should be saved. If not provided, the file is saved in the current working directory. Cannot be used with `stream`.
 * - **Stream:** An optional boolean flag. If set to `true`, the function returns a Node.js Readable stream of the audio/video data instead of saving a file. Cannot be used with `output`. Defaults to `false`.
 * - **Filter:** An optional string specifying a video filter to apply to the thumbnail image using FFmpeg. Available filters include "invert", "rotate90", "rotate270", "grayscale", "rotate180", "flipVertical", "flipHorizontal". If no filter is specified, streams are copied without re-encoding video.
 * - **UseTor:** An optional boolean flag to route requests through Tor. Defaults to `false`.
 * - **Verbose:** An optional boolean value that, if true, enables detailed logging of the process, including FFmpeg commands. Defaults to `false`.
 * - **Metadata:** An optional boolean flag. If set to `true`, the function will only fetch and return the video metadata without performing any download or streaming. Cannot be used with `stream`, `output`, `filter`, or `showProgress`. Defaults to `false`. The returned metadata includes details about available audio and video formats.
 * - **ShowProgress:** An optional boolean flag to display a progress bar in the console during download or streaming. Defaults to `false`. Cannot be used with `metadata`.
 *
 * The function's return type depends on the provided options:
 * - If `metadata` is `true`, it returns a Promise resolving to `{ metadata: object }` containing detailed video information including data for the highest quality audio and video formats (`AudioHighF`, `AudioHighDRC`, `VideoHighF`, `VideoHighHDR`, `ManifestHigh`) and a suggested filename.
 * - If `stream` is `true` (and `metadata` is `false`), it returns a Promise resolving to `{ stream: Readable }` providing a stream of the audio and static video data.
 * - Otherwise (if `metadata` is `false` and `stream` is `false`), it returns a Promise resolving to `{ outputPath: string }` indicating the path to the downloaded file.
 *
 * FFmpeg is used internally to combine the audio stream with the static thumbnail image, applying video filters if specified, and outputting in 'avi' format.
 *
 * @param {object} options - The configuration options for the audio/video fetching and processing.
 * @param {string} options.query - The Youtube query or video URL (minimum 2 characters). **Required**.
 * @param {string} [options.output] - The directory path to save the downloaded file. Cannot be used with `stream`.
 * @param {boolean} [options.stream=false] - If true, returns a Readable stream instead of saving a file. Cannot be used with `output`.
 * @param {boolean} [options.useTor=false] - Use Tor for requests.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 * @param {boolean} [options.metadata=false] - Fetch only metadata. Cannot be used with `stream`, `output`, `filter`, or `showProgress`.
 * @param {boolean} [options.showProgress=false] - Display a progress bar. Cannot be used with `metadata`.
 * @param {"invert" | "rotate90" | "rotate270" | "grayscale" | "rotate180" | "flipVertical" | "flipHorizontal"} [options.filter] - Apply a video filter to the thumbnail.
 *
 * @returns {Promise<{ metadata: object } | { outputPath: string } | { stream: Readable }>} A promise resolving to an object containing either the metadata, the output file path, or a readable stream, depending on the options.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing required `query`, `query` is less than 2 characters, invalid enum value for `filter`).
 * - Throws an `Error` if invalid option combinations are used (e.g., `metadata` with output/stream/filter/showProgress, `stream` with output).
 * - Throws an `Error` if the internal engine (`Tuber`) fails to retrieve a response or metadata.
 * - Throws an `Error` if FFmpeg or FFprobe executables are not found on the system.
 * - Throws an `Error` if the highest quality audio URL (`AudioHighF?.url`) is not found in the fetched data.
 * - Throws an `Error` if the thumbnail URL is missing from the fetched data (as it's used as the video input).
 * - Throws an `Error` if the output directory cannot be created when `output` is specified and `stream` is false.
 * - Throws an `Error` if an FFmpeg process error occurs during download or streaming.
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Running Basic Download Example (fetches highest audio+thumbnail, saves in current directory as AVI)
 * try {
 * const result = await AudioVideoHighest({ query: "your search query or url" });
 * if ("outputPath" in result) console.log("Basic Download finished:", result.outputPath);
 * } catch (error) {
 * console.error("Basic Download Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Download with Output and Video Filter Example (Applies grayscale filter to the thumbnail)
 * try {
 * const result = await AudioVideoHighest({ query: "your search query or url", output: "./custom_downloads_avhigh", filter: "grayscale" });
 * if ("outputPath" in result) console.log("Download with Output and Filter finished:", result.outputPath);
 * } catch (error) {
 * console.error("Download with Output and Filter Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Download with All Options Example (excluding incompatible 'metadata' and 'stream')
 * try {
 * const result = await AudioVideoHighest({ query: "your search query or url", output: "./full_downloads_avhigh", useTor: false, verbose: true, filter: "flipHorizontal", showProgress: true });
 * if ("outputPath" in result) console.log("\nDownload with All Options finished:", result.outputPath);
 * } catch (error) {
 * console.error("\nDownload with All Options Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Fetch Metadata Only Example
 * try {
 * const result = await AudioVideoHighest({ query: "your search query or url", metadata: true });
 * if ("metadata" in result) console.log("Metadata Only:", result.metadata);
 * } catch (error) {
 * console.error("Metadata Only Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Running Fetch Metadata with Tor and Verbose Example
 * try {
 * const result = await AudioVideoHighest({ query: "your search query or url", metadata: true, useTor: false, verbose: true });
 * if ("metadata" in result) console.log("Metadata with Tor and Verbose:", result.metadata);
 * } catch (error) {
 * console.error("Metadata with Tor and Verbose Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Running Basic Stream Example (fetches highest audio+thumbnail, streams as AVI)
 * import { createWriteStream } from "fs";
 * try {
 * const result = await AudioVideoHighest({ query: "your search query or url", stream: true });
 * if ("stream" in result && result.stream) {
 * console.log("Basic Streaming started. Piping to basic_stream_avhigh.avi...");
 * const outputStream = createWriteStream("basic_stream_avhigh.avi");
 * result.stream.pipe(outputStream);
 * await new Promise<void>((resolve, reject) => {
 * result.stream.on("end", () => {
 * console.log("Basic Streaming finished.");
 * resolve();
 * });
 * result.stream.on("error", error => {
 * console.error("Basic Stream error:", error.message);
 * result.stream.destroy(error);
 * reject(error);
 * });
 * });
 * }
 * } catch (error) {
 * console.error("Basic Stream Setup Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 7. Running Stream with Video Filter Example (Applies rotation filter to the thumbnail)
 * import { createWriteStream } from "fs";
 * try {
 * const result = await AudioVideoHighest({ query: "your search query or url", stream: true, filter: "rotate90" });
 * if ("stream" in result && result.stream) {
 * console.log("Stream with Filter started. Piping to filtered_stream_avhigh.avi...");
 * const outputStream = createWriteStream("filtered_stream_avhigh.avi");
 * result.stream.pipe(outputStream);
 * await new Promise<void>((resolve, reject) => {
 * result.stream.on("end", () => {
 * console.log("Stream with Filter finished.");
 * resolve();
 * });
 * result.stream.on("error", error => {
 * console.error("Stream with Filter error:", error.message);
 * result.stream.destroy(error);
 * reject(error);
 * });
 * });
 * }
 * } catch (error) {
 * console.error("Stream with Filter Setup Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 8. Running Stream with All Options Example (excluding incompatible 'metadata' and 'output')
 * import { createWriteStream } from "fs";
 * try {
 * const result = await AudioVideoHighest({ query: "your search query or url", stream: true, useTor: false, verbose: true, filter: "rotate270", showProgress: true });
 * if ("stream" in result && result.stream) {
 * console.log("\nStream with All Options started. Piping to full_stream_avhigh.avi...");
 * const outputStream = createWriteStream("full_stream_avhigh.avi");
 * result.stream.pipe(outputStream);
 * await new Promise<void>((resolve, reject) => {
 * result.stream.on("end", () => {
 * console.log("Stream with All Options finished.");
 * resolve();
 * });
 * result.stream.on("error", error => {
 * console.error("Stream with All Options error:", error.message);
 * result.stream.destroy(error);
 * reject(error);
 * });
 * });
 * }
 * } catch (error) {
 * console.error("\nStream with All Options Setup Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 9. Running Invalid Options Example (Metadata and Output used together - will throw Error)
 * try {
 * await AudioVideoHighest({ query: "your search query or url", metadata: true, output: "./should_fail_dir" });
 * console.log("This should not be reached - Invalid Options Example.");
 * } catch (error) {
 * console.error("Expected Error (Metadata and Output):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 10. Running Invalid Options Example (Stream and Output used together - will throw Error)
 * try {
 * await AudioVideoHighest({ query: "your search query or url", stream: true, output: "./should_fail_dir" });
 * console.log("This should not be reached - Invalid Options Example.");
 * } catch (error) {
 * console.error("Expected Error (Stream and Output):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 11. Running Zod Validation Error Example (Missing Query - will throw ZodError)
 * try {
 * await AudioVideoHighest({} as any); // Using 'as any' to simulate missing required parameter
 * console.log("This should not be reached - Zod Validation Error Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Missing Query):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 12. Running Zod Validation Error Example (Invalid Filter - will throw ZodError)
 * // This example uses an audio filter name which is invalid for the video filter enum.
 * try {
 * await AudioVideoHighest({ query: "your search query or url", filter: "bassboost" as any }); // Using 'as any' to simulate invalid enum value
 * console.log("This should not be reached - Zod Validation Error Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Invalid Filter):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 13. Example of Client Initialization Failure (e.g., Tuber fails to respond)
 * // This scenario depends on the internal Tuber logic failing.
 * // You would typically trigger this by providing a query that the engine cannot process or if the engine itself fails.
 * // try {
 * //    await AudioVideoHighest({ query: "query-that-breaks-tuber" });
 * // } catch (error) {
 * //    console.error("Expected Error (Client Initialization Failed):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 14. Example of FFmpeg/FFprobe not found
 * // This would occur if the ffmpeg/ffprobe executables are not in PATH and the locator fails.
 * // try {
 * //    // Ensure ffmpeg/ffprobe are not found in PATH before running
 * //    await AudioVideoHighest({ query: "your search query or url" });
 * // } catch (error) {
 * //    console.error("Expected Error (FFmpeg not found):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 15. Example of Highest Quality Audio URL not found
 * // This might occur for certain videos if the internal engine cannot find the expected format.
 * // try {
 * //    // Use a query for a video known to have issues with highest quality audio detection
 * //    await AudioVideoHighest({ query: "some video with format issues" });
 * // } catch (error) {
 * //    console.error("Expected Error (Highest Quality Audio URL not found):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 16. Example of Thumbnail URL not found
 * // This would occur if the internal engine fails to provide a thumbnail URL, which is required as video input.
 * // try {
 * //    // Use a query for a video known to be missing a thumbnail
 * //    await AudioVideoHighest({ query: "video missing thumbnail" });
 * // } catch (error) {
 * //    console.error("Expected Error (Thumbnail URL not found):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 17. Example of FFmpeg processing error (during download or stream)
 * // This can occur due to various reasons like network issues, invalid input stream, or FFmpeg internal errors.
 * // It's difficult to trigger reliably via a simple example.
 * // try {
 * //    // Use a query/options known to cause FFmpeg issues
 * //    await AudioVideoHighest({ query: "query-causing-ffmpeg-error" });
 * // } catch (error) {
 * //    console.error("Expected Error (FFmpeg Processing Error):", error instanceof Error ? error.message : error);
 * // }
 */
export default async function AudioVideoHighest({
    query,
    output,
    useTor,
    stream,
    filter,
    metadata,
    verbose,
    showProgress,
}: AudioVideoHighestOptions): Promise<{ metadata: object } | { outputPath: string } | { stream: Readable }> {
    try {
        ZodSchema.parse({ query, output, useTor, stream, filter, metadata, verbose, showProgress });
        if (metadata && (stream || output || filter || showProgress)) {
            throw new Error(`${colors.red("@error:")} The 'metadata' parameter cannot be used with 'stream', 'output', 'filter', or 'showProgress'.`);
        }
        if (stream && output) {
            throw new Error(`${colors.red("@error:")} The 'stream' parameter cannot be used with 'output'.`);
        }
        const engineData = await Tuber({ query, verbose, useTor });
        if (!engineData) {
            throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        }
        if (!engineData.metaData) {
            throw new Error(`${colors.red("@error:")} Metadata not found in the engine response.`);
        }
        if (metadata) {
            return {
                metadata: {
                    metaData: engineData.metaData,
                    AudioHighF: engineData.AudioHighF,
                    AudioHighDRC: engineData.AudioHighDRC,
                    VideoHighF: engineData.VideoHighF,
                    VideoHighHDR: engineData.VideoHighHDR,
                    ManifestHigh: engineData.ManifestHigh,
                    filename: engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_"),
                },
            };
        }
        const title = engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "audio";
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
        } catch (locatorError: any) {
            throw new Error(`${colors.red("@error:")} Failed to locate ffmpeg or ffprobe: ${locatorError.message}`);
        }
        if (!engineData.AudioHighF?.url) {
            throw new Error(`${colors.red("@error:")} Highest quality audio URL not found.`);
        }
        instance.addInput(engineData.AudioHighF.url);
        if (!engineData.metaData.thumbnail) {
            throw new Error(`${colors.red("@error:")} Thumbnail URL not found.`);
        }
        instance.addInput(engineData.metaData.thumbnail);
        instance.withOutputFormat("avi");
        const filterMap: Record<string, string[]> = {
            invert: ["negate"],
            rotate90: ["transpose=1"],
            rotate180: ["transpose=2,transpose=2"],
            rotate270: ["transpose=2"],
            grayscale: ["hue=s=0"],
            flipVertical: ["vflip"],
            flipHorizontal: ["hflip"],
        };
        if (filter && filterMap[filter]) {
            instance.withVideoFilter(filterMap[filter]);
        } else {
            instance.outputOptions("-c copy");
        }
        let processStartTime: Date;
        if (showProgress) {
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
            instance.on("start", command => {
                if (verbose) console.log(colors.green("@info:"), "FFmpeg stream started:", command);
            });
            instance.pipe(passthroughStream, { end: true });
            instance.on("end", () => {
                if (verbose) console.log(colors.green("@info:"), "FFmpeg streaming finished.");
                if (showProgress) process.stdout.write("\n");
            });
            instance.on("error", (error, stdout, stderr) => {
                const errorMessage = `${colors.red("@error:")} FFmpeg stream error: ${error?.message}`;
                console.error(errorMessage, "\nstdout:", stdout, "\nstderr:", stderr);
                passthroughStream.emit("error", new Error(errorMessage));
                passthroughStream.destroy(new Error(errorMessage));
                if (showProgress) process.stdout.write("\n");
            });
            instance.run();
            return { stream: passthroughStream };
        } else {
            const filenameBase = `yt-dlx_AudioVideoHighest_`;
            let filename = `${filenameBase}${filter ? filter + "_" : ""}${title}.avi`;
            const outputPath = path.join(folder, filename);
            instance.output(outputPath);
            await new Promise<void>((resolve, reject) => {
                instance.on("start", command => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg download started:", command);
                    if (showProgress) processStartTime = new Date();
                });
                instance.on("progress", progress => {
                    if (showProgress && processStartTime) {
                        progbar({ ...progress, percent: progress.percent !== undefined ? progress.percent : 0, startTime: processStartTime });
                    }
                });
                instance.on("end", () => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg download finished.");
                    if (showProgress) process.stdout.write("\n");
                    resolve();
                });
                instance.on("error", (error, stdout, stderr) => {
                    const errorMessage = `${colors.red("@error:")} FFmpeg download error: ${error?.message}`;
                    console.error(errorMessage, "\nstdout:", stdout, "\nstderr:", stderr);
                    if (showProgress) process.stdout.write("\n");
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
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
