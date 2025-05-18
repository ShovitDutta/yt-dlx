import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import ytdlx from "../../utils/Agent";
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
var ZodSchema = z.object({
    query: z.string().min(2),
    output: z.string().optional(),
    useTor: z.boolean().optional(),
    stream: z.boolean().optional(),
    verbose: z.boolean().optional(),
    metadata: z.boolean().optional(),
    filter: z.enum(["invert", "rotate90", "rotate270", "grayscale", "rotate180", "flipVertical", "flipHorizontal"]).optional(),
    resolution: z.enum(["144p", "240p", "360p", "480p", "720p", "1080p", "1440p", "2160p", "3072p", "4320p", "6480p", "8640p", "12000p"]),
    showProgress: z.boolean().optional(),
});
type AudioVideoCustomOptions = z.infer<typeof ZodSchema>;
/**
 * @shortdesc Downloads or streams custom audio and video from YouTube videos/queries with options for resolution, video filters, and output.
 *
 * @description This function allows fetching both audio and video from a YouTube video identified by a query or URL.
 * It uses an internal engine (`ytdlx`) to retrieve video information and available formats,
 * and then utilizes FFmpeg to combine the highest quality audio stream with a video stream of the specified resolution,
 * apply a video filter, and output the result.
 * The output can be either a downloadable file saved locally or a readable stream.
 * The function also supports fetching only the video's metadata.
 *
 * It requires a valid search query or URL to identify the YouTube video and a specific video resolution.
 * FFmpeg and FFprobe executables must be available in the system's PATH or locatable by the internal `locator` utility.
 *
 * The process typically involves:
 * 1. Fetching video and audio format data using the internal engine.
 * 2. Identifying the highest quality separate audio stream.
 * 3. Identifying a separate video stream matching the requested resolution.
 * 4. Using FFmpeg to combine these streams and optionally apply a video filter.
 * 5. Outputting the result as a file or a stream, typically in MKV format.
 *
 * The function supports the following configuration options:
 * - **Query:** A string representing the Youtube query or video URL. Must be at least 2 characters long. **Required**.
 * - **Resolution:** Specifies the desired video resolution. Supported values include "144p", "240p", "360p", "480p", "720p", "1080p", "1440p", "2160p", "3072p", "4320p", "6480p", "8640p", "12000p". **Required**.
 * - **Output:** An optional string specifying the directory path where the downloaded audio/video file should be saved. If not provided, the file is saved in the current working directory. Cannot be used with `stream`.
 * - **Stream:** An optional boolean flag. If set to `true`, the function returns a Node.js Readable stream of the audio/video data instead of saving a file. Cannot be used with `output`. Defaults to `false`.
 * - **Filter:** An optional string specifying a video filter to apply using FFmpeg. Available filters include "invert", "rotate90", "rotate270", "grayscale", "rotate180", "flipVertical", "flipHorizontal".
 * - **UseTor:** An optional boolean flag to route requests through Tor. Defaults to `false`.
 * - **Verbose:** An optional boolean value that, if true, enables detailed logging of the process, including FFmpeg commands. Defaults to `false`.
 * - **Metadata:** An optional boolean flag. If set to `true`, the function will only fetch and return the video metadata and format information without performing any download, streaming, or filtering. Cannot be used with `stream`, `output`, `filter`, or `showProgress`. Defaults to `false`.
 * - **ShowProgress:** An optional boolean flag to display a progress bar in the console during download or streaming. Defaults to `false`. Cannot be used with `metadata`.
 *
 * The function's return type depends on the provided options:
 * - If `metadata` is `true`, it returns a Promise resolving to `{ metadata: object }` containing detailed video information and available formats.
 * - If `stream` is `true` (and `metadata` is `false`), it returns a Promise resolving to `{ stream: Readable }` providing a stream of the audio/video data.
 * - Otherwise (if `metadata` is `false` and `stream` is `false`), it returns a Promise resolving to `{ outputPath: string }` indicating the path to the downloaded MKV file.
 *
 * FFmpeg is used internally to merge the audio and video streams and apply filters, with the output typically in Matroska (`.mkv`) format.
 *
 * @param {object} options - The configuration options for the audio/video fetching and processing.
 * @param {string} options.query - The Youtube query or video URL (minimum 2 characters). **Required**.
 * @param {"144p" | "240p" | "360p" | "480p" | "720p" | "1080p" | "1440p" | "2160p" | "3072p" | "4320p" | "6480p" | "8640p" | "12000p"} options.resolution - The desired video resolution. **Required**.
 * @param {string} [options.output] - The directory path to save the downloaded file. Cannot be used with `stream`.
 * @param {boolean} [options.stream=false] - If true, returns a Readable stream instead of saving a file. Cannot be used with `output`.
 * @param {boolean} [options.useTor=false] - Use Tor for requests via the internal engine.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 * @param {boolean} [options.metadata=false] - Fetch only metadata. Cannot be used with `stream`, `output`, `filter`, or `showProgress`.
 * @param {boolean} [options.showProgress=false] - Display a progress bar. Cannot be used with `metadata`.
 * @param {"invert" | "rotate90" | "rotate270" | "grayscale" | "rotate180" | "flipVertical" | "flipHorizontal"} [options.filter] - Apply a video filter.
 *
 * @returns {Promise<{ metadata: object } | { outputPath: string } | { stream: Readable }>} A promise resolving to an object containing either the metadata, the output file path, or a readable stream, depending on the options.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing required `query` or `resolution`, `query` is too short, invalid enum values for `resolution` or `filter`).
 * - Throws an `Error` if invalid option combinations are used (`metadata` with incompatible options, `stream` with `output`).
 * - Throws an `Error` if the internal engine (`ytdlx`) fails to retrieve a response or metadata.
 * - Throws an `Error` if FFmpeg or FFprobe executables are not found on the system.
 * - Throws an `Error` if the highest quality audio URL is not found in the fetched data.
 * - Throws an `Error` if no video data is found for the specified `resolution` or the corresponding video URL is missing.
 * - Throws an `Error` if the output directory cannot be created when `output` is specified and `stream` is false.
 * - Throws an `Error` if an FFmpeg process error occurs during download or streaming.
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Running Basic Download Example (combines highest audio with 720p video, saves in current directory)
 * try {
 * const result = await AudioVideoCustom({ query: "your search query or url", resolution: "720p" });
 * if ("outputPath" in result) console.log("Basic Download finished:", result.outputPath);
 * } catch (error) {
 * console.error("Basic Download Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Download with Output and Filter Example (1080p video with grayscale filter)
 * try {
 * const result = await AudioVideoCustom({ query: "your search query or url", resolution: "1080p", output: "./custom_downloads_avcustom", filter: "grayscale" });
 * if ("outputPath" in result) console.log("Download with Output and Filter finished:", result.outputPath);
 * } catch (error) {
 * console.error("Download with Output and Filter Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Download with All Options Example (1440p video, saves to directory, uses Tor, verbose, invert filter, shows progress)
 * try {
 * const result = await AudioVideoCustom({
 * query: "your search query or url",
 * resolution: "1440p",
 * output: "./full_downloads_avcustom",
 * useTor: true,
 * verbose: true,
 * filter: "invert",
 * showProgress: true,
 * });
 * if ("outputPath" in result) console.log("\nDownload with All Options finished:", result.outputPath);
 * } catch (error) {
 * console.error("\nDownload with All Options Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Fetch Metadata Only Example (fetches metadata for a 720p video)
 * try {
 * const result = await AudioVideoCustom({ query: "your search query or url", resolution: "720p", metadata: true });
 * if ("metadata" in result) console.log("Metadata Only:", result.metadata);
 * } catch (error) {
 * console.error("Metadata Only Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Running Fetch Metadata with Tor and Verbose Example
 * try {
 * const result = await AudioVideoCustom({ query: "your search query or url", resolution: "720p", metadata: true, useTor: true, verbose: true });
 * if ("metadata" in result) console.log("Metadata with Tor and Verbose:", result.metadata);
 * } catch (error) {
 * console.error("Metadata with Tor and Verbose Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Running Basic Stream Example (streams 480p video with highest audio, pipes to a local file)
 * import { createWriteStream } from "fs";
 * try {
 * const result = await AudioVideoCustom({ query: "your search query or url", resolution: "480p", stream: true });
 * if ("stream" in result && result.stream) {
 * console.log("Basic Streaming started. Piping to basic_stream_avcustom.mkv...");
 * const outputStream = createWriteStream("basic_stream_avcustom.mkv");
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
 * // 7. Running Stream with Filter Example (streams 720p video with flipVertical filter)
 * import { createWriteStream } from "fs";
 * try {
 * const result = await AudioVideoCustom({ query: "your search query or url", resolution: "720p", stream: true, filter: "flipVertical" });
 * if ("stream" in result && result.stream) {
 * console.log("Stream with Filter started. Piping to filtered_stream_avcustom.mkv...");
 * const outputStream = createWriteStream("filtered_stream_avcustom.mkv");
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
 * // 8. Running Stream with All Options Example (streams 1080p video, uses Tor, verbose, rotate270 filter, shows progress)
 * import { createWriteStream } from "fs";
 * try {
 * const result = await AudioVideoCustom({
 * query: "your search query or url",
 * resolution: "1080p",
 * stream: true,
 * useTor: true,
 * verbose: true,
 * filter: "rotate270",
 * showProgress: true,
 * });
 * if ("stream" in result && result.stream) {
 * console.log("\nStream with All Options started. Piping to full_stream_avcustom.mkv...");
 * const outputStream = createWriteStream("full_stream_avcustom.mkv");
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
 * await AudioVideoCustom({ query: "your search query or url", resolution: "720p", metadata: true, output: "./should_fail_dir" });
 * console.log("This should not be reached - Invalid Options Example.");
 * } catch (error) {
 * console.error("Expected Error (Metadata and Output):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 10. Running Invalid Options Example (Stream and Output used together - will throw Error)
 * try {
 * await AudioVideoCustom({ query: "your search query or url", resolution: "720p", stream: true, output: "./should_fail_dir" });
 * console.log("This should not be reached - Invalid Options Example.");
 * } catch (error) {
 * console.error("Expected Error (Stream and Output):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 11. Running Zod Validation Error Example (Missing Query - will throw ZodError)
 * try {
 * await AudioVideoCustom({ resolution: "720p" } as any); // Using 'as any' to simulate missing required parameter
 * console.log("This should not be reached - Zod Validation Error Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Missing Query):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 12. Running Zod Validation Error Example (Missing Resolution - will throw ZodError)
 * try {
 * await AudioVideoCustom({ query: "your search query or url" } as any); // Using 'as any' to simulate missing required parameter
 * console.log("This should not be reached - Zod Validation Error Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Missing Resolution):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 13. Running Zod Validation Error Example (Invalid Filter - will throw ZodError)
 * try {
 * await AudioVideoCustom({ query: "your search query or url", resolution: "720p", filter: "nonexistentfilter" as any }); // Using 'as any' to simulate invalid enum value
 * console.log("This should not be reached - Zod Validation Error Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Invalid Filter):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 14. Running Zod Validation Error Example (Invalid Resolution - will throw ZodError)
 * try {
 * await AudioVideoCustom({ query: "your search query or url", resolution: "500p" as any }); // Using 'as any' to simulate invalid enum value
 * console.log("This should not be reached - Zod Validation Error Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Invalid Resolution):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 15. Example of Client Initialization Failure (e.g., internal engine fails to respond)
 * // This scenario depends on the internal engine logic failing.
 * // try {
 * //    await AudioVideoCustom({ query: "query-that-breaks-engine", resolution: "720p" });
 * // } catch (error) {
 * //    console.error("Expected Error (Client Initialization Failed):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 16. Example of FFmpeg/FFprobe not found
 * // This would occur if the ffmpeg/ffprobe executables are not in PATH and the locator fails.
 * // try {
 * //    // Ensure ffmpeg/ffprobe are not found in PATH before running
 * //    await AudioVideoCustom({ query: "your search query or url", resolution: "720p" });
 * // } catch (error) {
 * //    console.error("Expected Error (FFmpeg not found):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 17. Example of Highest Quality Audio URL not found
 * // This might occur for certain videos if the internal engine cannot find the expected audio format.
 * // try {
 * //    // Use a query for a video known to have issues with highest quality audio detection
 * //    await AudioVideoCustom({ query: "some video with audio format issues", resolution: "720p" });
 * // } catch (error) {
 * //    console.error("Expected Error (Highest Quality Audio URL not found):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 18. Example of no video data for specified resolution or missing URL
 * // This would occur if the internal engine doesn't return a format matching the requested resolution, or the URL for that format is missing.
 * // try {
 * //    // Use a query/resolution combination known to fail
 * //    await AudioVideoCustom({ query: "some video", resolution: "6480p" }); // Example, might not always fail
 * // } catch (error) {
 * //    console.error("Expected Error (No video data for resolution):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 19. Example of FFmpeg processing error (during download or stream)
 * // This can occur due to various reasons like network issues, invalid input stream, or FFmpeg internal errors.
 * // It's difficult to trigger reliably via a simple example.
 * // try {
 * //    // Use a query/options known to cause FFmpeg issues
 * //    await AudioVideoCustom({ query: "query-causing-ffmpeg-error", resolution: "720p" });
 * // } catch (error) {
 * //    console.error("Expected Error (FFmpeg Processing Error):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // Vitest Test Case: should handle basic download
 * // vitest.it("should handle basic download", async () => {
 * //     const query = "test query";
 * //     const resolution = "720p";
 * //     const result = await AudioVideoCustom({ query, resolution });
 * //     vitest.expect(result).toHaveProperty("outputPath");
 * //     if ("outputPath" in result) {
 * //         vitest.expect(result.outputPath).toMatch(/\.mkv$/);
 * //     }
 * // });
 *
 * @example
 * // Vitest Test Case: should handle download with output and filter
 * // vitest.it("should handle download with output and filter", async () => {
 * //     const query = "test query";
 * //     const resolution = "1080p";
 * //     const result = await AudioVideoCustom({ query, resolution, output: "./custom_downloads_avcustom", filter: "grayscale" });
 * //     vitest.expect(result).toHaveProperty("outputPath");
 * //     if ("outputPath" in result) {
 * //         vitest.expect(result.outputPath).toMatch(/\.mkv$/);
 * //     }
 * // });
 *
 * @example
 * // Vitest Test Case: should handle download with all options
 * // vitest.it("should handle download with all options", async () => {
 * //     const query = "test query";
 * //     const result = await AudioVideoCustom({
 * //         query,
 * //         resolution: "1440p",
 * //         output: "./full_downloads_avcustom",
 * //         useTor: false, // Note: Tor usage might need specific test setup
 * //         verbose: true,
 * //         filter: "invert",
 * //         showProgress: true, // Note: Progress bar output is console based, testing requires mocking stdout
 * //     });
 * //     vitest.expect(result).toHaveProperty("outputPath");
 * //     if ("outputPath" in result) {
 * //         vitest.expect(result.outputPath).toMatch(/\.mkv$/);
 * //     }
 * // });
 *
 * @example
 * // Vitest Test Case: should fetch metadata only
 * // vitest.it("should fetch metadata only", async () => {
 * //     const query = "test query";
 * //     const resolution = "720p";
 * //     const result = await AudioVideoCustom({ query, resolution, metadata: true });
 * //     vitest.expect(result).toHaveProperty("metadata");
 * //     vitest.expect((result as { metadata: object }).metadata).toBeInstanceOf(Object);
 * // });
 *
 * @example
 * // Vitest Test Case: should fetch metadata with Tor and verbose
 * // vitest.it("should fetch metadata with Tor and verbose", async () => {
 * //     const query = "test query";
 * //     const resolution = "720p";
 * //     const result = await AudioVideoCustom({ query, resolution, metadata: true, useTor: false, verbose: true }); // Note: Tor usage might need specific test setup
 * //     vitest.expect(result).toHaveProperty("metadata");
 * // });
 *
 * @example
 * // Vitest Test Case: should handle basic stream
 * // import { createWriteStream } from "fs"; // Needed for piping stream to file
 * // vitest.it("should handle basic stream", async () => {
 * //     const query = "test query";
 * //     const result = await AudioVideoCustom({ query, resolution: "480p", stream: true });
 * //     vitest.expect(result).toHaveProperty("stream");
 * //     vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
 * //     // Note: Testing stream content requires more complex setup, here we just pipe to a dummy file
 * //     const outputStream = createWriteStream("basic_stream_avcustom.mkv");
 * //     (result as { stream: Readable }).stream?.pipe(outputStream);
 * //     await new Promise(resolve => {
 * //         (result as { stream: Readable }).stream?.on("end", resolve);
 * //     });
 * // });
 *
 * @example
 * // Vitest Test Case: should handle stream with filter
 * // import { createWriteStream } from "fs"; // Needed for piping stream to file
 * // vitest.it("should handle stream with filter", async () => {
 * //     const query = "test query";
 * //     const result = await AudioVideoCustom({ query, resolution: "720p", stream: true, filter: "flipVertical" });
 * //     vitest.expect(result).toHaveProperty("stream");
 * //     vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
 * //     // Note: Testing stream content requires more complex setup, here we just pipe to a dummy file
 * //     const outputStream = createWriteStream("filtered_stream_avcustom.mkv");
 * //     (result as { stream: Readable }).stream?.pipe(outputStream);
 * //     await new Promise(resolve => {
 * //         (result as { stream: Readable }).stream?.on("end", resolve);
 * //     });
 * // });
 *
 * @example
 * // Vitest Test Case: should handle stream with all options
 * // import { createWriteStream } from "fs"; // Needed for piping stream to file
 * // vitest.it("should handle stream with all options", async () => {
 * //     const query = "test query";
 * //     const result = await AudioVideoCustom({
 * //         query,
 * //         resolution: "1080p",
 * //         stream: true,
 * //         useTor: false, // Note: Tor usage might need specific test setup
 * //         verbose: true,
 * //         filter: "rotate270",
 * //         showProgress: true, // Note: Progress bar output is console based, testing requires mocking stdout
 * //     });
 * //     vitest.expect(result).toHaveProperty("stream");
 * //     vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
 * //     // Note: Testing stream content requires more complex setup, here we just pipe to a dummy file
 * //     const outputStream = createWriteStream("full_stream_avcustom.mkv");
 * //     (result as { stream: Readable }).stream?.pipe(outputStream);
 * //     await new Promise(resolve => {
 * //         (result as { stream: Readable })?.stream?.on("end", resolve);
 * //     });
 * // });
 *
 * @example
 * // Vitest Test Case: should throw error for metadata with output
 * // vitest.it("should throw error for metadata with output", async () => {
 * //     const query = "test query";
 * //     const resolution = "720p";
 * //     await vitest.expect(AudioVideoCustom({ query, resolution, metadata: true, output: "./should_fail_dir" })).rejects.toThrowError(/metadata.*cannot be used with.*output/);
 * // });
 *
 * @example
 * // Vitest Test Case: should throw error for stream with output
 * // vitest.it("should throw error for stream with output", async () => {
 * //     const query = "test query";
 * //     const resolution = "720p";
 * //     await vitest.expect(AudioVideoCustom({ query, resolution, stream: true, output: "./should_fail_dir" })).rejects.toThrowError(/stream.*cannot be used with.*output/);
 * // });
 *
 * @example
 * // Vitest Test Case: should throw Zod error for missing query
 * // vitest.it("should throw Zod error for missing query", async () => {
 * //     const resolution = "720p";
 * //     await vitest.expect(AudioVideoCustom({ resolution } as any)).rejects.toThrowError(/query.*Required/);
 * // });
 *
 * @example
 * // Vitest Test Case: should throw Zod error for missing resolution
 * // vitest.it("should throw Zod error for missing resolution", async () => {
 * //     const query = "test query";
 * //     await vitest.expect(AudioVideoCustom({ query } as any)).rejects.toThrowError(/resolution.*Required/);
 * // });
 *
 * @example
 * // Vitest Test Case: should throw Zod error for invalid filter
 * // vitest.it("should throw Zod error for invalid filter", async () => {
 * //     const query = "test query";
 * //     const resolution = "720p";
 * //     await vitest.expect(AudioVideoCustom({ query, resolution, filter: "nonexistentfilter" as any })).rejects.toThrowError(/filter.*invalid enum value/);
 * // });
 *
 * @example
 * // Vitest Test Case: should throw Zod error for invalid resolution
 * // vitest.it("should throw Zod error for invalid resolution", async () => {
 * //     const query = "test query";
 * //     await vitest.expect(AudioVideoCustom({ query, resolution: "500p" as any })).rejects.toThrowError(/resolution.*invalid enum value/);
 * // });
 */
export default async function AudioVideoCustom({
    query,
    stream,
    output,
    useTor,
    filter,
    metadata,
    verbose,
    resolution,
    showProgress,
}: AudioVideoCustomOptions): Promise<{ metadata: object } | { outputPath: string } | { stream: Readable }> {
    try {
        ZodSchema.parse({ query, stream, output, useTor, filter, metadata, verbose, resolution, showProgress });
        if (metadata && (stream || output || filter || showProgress)) {
            throw new Error(`${colors.red("@error:")} The 'metadata' parameter cannot be used with 'stream', 'output', 'filter', or 'showProgress'.`);
        }
        if (stream && output) throw new Error(`${colors.red("@error:")} The 'stream' parameter cannot be used with 'output'.`);
        if (metadata && showProgress) throw new Error(`${colors.red("@error:")} The 'showProgress' parameter cannot be used when 'metadata' is true.`);
        const engineData = await ytdlx({ query, verbose, useTor });
        if (!engineData) throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        if (!engineData.metaData) throw new Error(`${colors.red("@error:")} Metadata was not found in the engine response.`);
        if (metadata) {
            return {
                metadata: {
                    metaData: engineData.metaData,
                    BestAudioLow: engineData.BestAudioLow,
                    BestAudioHigh: engineData.BestAudioHigh,
                    AudioLowDRC: engineData.AudioLowDRC,
                    AudioHighDRC: engineData.AudioHighDRC,
                    BestVideoLow: engineData.BestVideoLow,
                    BestVideoHigh: engineData.BestVideoHigh,
                    VideoLowHDR: engineData.VideoLowHDR,
                    VideoHighHDR: engineData.VideoHighHDR,
                    ManifestLow: engineData.ManifestLow,
                    ManifestHigh: engineData.ManifestHigh,
                    filename: engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_"),
                },
            };
        }
        const title = engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "video";
        const folder = output ? output : process.cwd();
        if (!stream && !fs.existsSync(folder)) {
            try {
                fs.mkdirSync(folder, { recursive: true });
            } catch (mkdirError: any) {
                throw new Error(`${colors.red("@error:")} Failed to create the output directory: ${mkdirError?.message}`);
            }
        }
        const instance: ffmpeg.FfmpegCommand = ffmpeg();
        try {
            const paths = await locator();
            if (!paths.ffmpeg) throw new Error(`${colors.red("@error:")} ffmpeg executable not found.`);
            if (!paths.ffprobe) throw new Error(`${colors.red("@error:")} ffprobe executable not found.`);
            instance.setFfmpegPath(paths.ffmpeg);
            instance.setFfprobePath(paths.ffprobe);
        } catch (locatorError: any) {
            throw new Error(`${colors.red("@error:")} Failed to locate ffmpeg or ffprobe: ${locatorError?.message}`);
        }
        if (!engineData.BestAudioHigh?.url) throw new Error(`${colors.red("@error:")} Highest quality audio URL was not found.`);
        instance.addInput(engineData.BestAudioHigh.url);
        instance.withOutputFormat("matroska");
        const resolutionWithoutP = resolution.replace("p", "");
        const vdata = engineData.ManifestHigh?.find((i: { format: string | string[] }) => i.format?.includes(resolutionWithoutP));
        if (vdata) {
            if (!vdata.url) throw new Error(`${colors.red("@error:")} Video URL not found for resolution: ${resolution}.`);
            instance.addInput(vdata.url.toString());
        } else throw new Error(`${colors.red("@error:")} No video data found for resolution: ${resolution}. Use list_formats() maybe?`);
        const filterMap: Record<string, string[]> = {
            invert: ["negate"],
            flipVertical: ["vflip"],
            rotate180: ["rotate=PI"],
            flipHorizontal: ["hflip"],
            rotate90: ["rotate=PI/2"],
            rotate270: ["rotate=3*PI/2"],
            grayscale: ["colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3"],
        };
        if (filter && filterMap[filter]) instance.withVideoFilter(filterMap[filter]);
        else instance.outputOptions("-c copy");
        let processStartTime: Date;
        if (showProgress) {
            instance.on("start", () => {
                processStartTime = new Date();
            });
            instance.on("progress", progress => {
                if (processStartTime) progbar({ ...progress, percent: progress.percent !== undefined ? progress.percent : 0, startTime: processStartTime });
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
            const filenameBase = `yt-dlx_AudioVideoCustom_${resolution}_`;
            let filename = `${filenameBase}${filter ? filter + "_" : ""}${title}.mkv`;
            const outputPath = path.join(folder, filename);
            instance.output(outputPath);
            await new Promise<void>((resolve, reject) => {
                instance.on("start", command => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg download started:", command);
                    if (showProgress) processStartTime = new Date();
                });
                instance.on("progress", progress => {
                    if (showProgress && processStartTime) progbar({ ...progress, percent: progress.percent !== undefined ? progress.percent : 0, startTime: processStartTime });
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
            return { outputPath: outputPath };
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
import { createWriteStream } from "fs";
import * as vitest from "vitest";
vitest.describe("AudioVideoCustom", () => {
    const query = "test query";
    const resolution = "720p";
    vitest.it("should handle basic download", async () => {
        const result = await AudioVideoCustom({ query, resolution });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should handle download with output and filter", async () => {
        const result = await AudioVideoCustom({ query, resolution: "1080p", output: "./custom_downloads_avcustom", filter: "grayscale" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should handle download with all options", async () => {
        const result = await AudioVideoCustom({
            query,
            resolution: "1440p",
            output: "./full_downloads_avcustom",
            useTor: false,
            verbose: true,
            filter: "invert",
            showProgress: true,
        });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should fetch metadata only", async () => {
        const result = await AudioVideoCustom({ query, resolution, metadata: true });
        vitest.expect(result).toHaveProperty("metadata");
        vitest.expect((result as { metadata: object }).metadata).toBeInstanceOf(Object);
    });
    vitest.it("should fetch metadata with Tor and verbose", async () => {
        const result = await AudioVideoCustom({ query, resolution, metadata: true, useTor: false, verbose: true });
        vitest.expect(result).toHaveProperty("metadata");
    });
    vitest.it("should handle basic stream", async () => {
        const result = await AudioVideoCustom({ query, resolution: "480p", stream: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("basic_stream_avcustom.mkv");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with filter", async () => {
        const result = await AudioVideoCustom({ query, resolution: "720p", stream: true, filter: "flipVertical" });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("filtered_stream_avcustom.mkv");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with all options", async () => {
        const result = await AudioVideoCustom({
            query: "your search query or url",
            resolution: "1080p",
            stream: true,
            useTor: false,
            verbose: true,
            filter: "rotate270",
            showProgress: true,
        });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("full_stream_avcustom.mkv");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable })?.stream?.on("end", resolve);
        });
    });
    vitest.it("should throw error for metadata with output", async () => {
        await vitest.expect(AudioVideoCustom({ query, resolution, metadata: true, output: "./should_fail_dir" })).rejects.toThrowError(/metadata.*cannot be used with.*output/);
    });
    vitest.it("should throw error for stream with output", async () => {
        await vitest.expect(AudioVideoCustom({ query, resolution, stream: true, output: "./should_fail_dir" })).rejects.toThrowError(/stream.*cannot be used with.*output/);
    });
    vitest.it("should throw Zod error for missing query", async () => {
        await vitest.expect(AudioVideoCustom({ resolution } as any)).rejects.toThrowError(/query.*Required/);
    });
    vitest.it("should throw Zod error for missing resolution", async () => {
        await vitest.expect(AudioVideoCustom({ query } as any)).rejects.toThrowError(/resolution.*Required/);
    });
    vitest.it("should throw Zod error for invalid filter", async () => {
        await vitest.expect(AudioVideoCustom({ query, resolution, filter: "nonexistentfilter" as any })).rejects.toThrowError(/filter.*invalid enum value/);
    });
    vitest.it("should throw Zod error for invalid resolution", async () => {
        await vitest.expect(AudioVideoCustom({ query, resolution: "500p" as any })).rejects.toThrowError(/resolution.*invalid enum value/);
    });
});
