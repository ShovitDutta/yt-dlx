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
    resolution: z.enum(["high", "medium", "low", "ultralow"]),
    filter: z
        .enum(["echo", "slow", "speed", "phaser", "flanger", "panning", "reverse", "vibrato", "subboost", "surround", "bassboost", "nightcore", "superslow", "vaporwave", "superspeed"])
        .optional(),
});
type AudioCustomOptions = z.infer<typeof ZodSchema>;
/**
 * @shortdesc Downloads or streams custom audio from YouTube videos/queries with options for resolution, filters, and output.
 *
 * @description This function allows fetching audio from a YouTube video identified by a query or URL.
 * It uses an internal engine (`Tuber`) to retrieve video information and available audio formats,
 * and then utilizes FFmpeg to process (optionally apply filters) and output the selected audio.
 * The output can be either a downloadable file saved locally or a readable stream.
 * The function also supports fetching only the video's metadata.
 *
 * It requires a valid search query or URL to identify the YouTube video. The query must be at least 2 characters long.
 * FFmpeg and FFprobe executables must be available in the system's PATH or locatable by the internal `locator` utility.
 *
 * The function supports the following configuration options:
 * - **Query:** A string representing the Youtube query or URL. Must be at least 2 characters long. **Required**.
 * - **Resolution:** Specifies the desired audio quality ("high", "medium", "low", "ultralow"). **Required**.
 * - **Output:** An optional string specifying the directory path where the downloaded audio file should be saved. If not provided, the file is saved in the current working directory. Cannot be used with `stream`.
 * - **Stream:** An optional boolean flag. If set to `true`, the function returns a Node.js Readable stream of the audio data instead of saving a file. Cannot be used with `output`. Defaults to `false`.
 * - **Filter:** An optional string specifying an audio filter to apply using FFmpeg. Available filters include "echo", "slow", "speed", "phaser", "flanger", "panning", "reverse", "vibrato", "subboost", "surround", "bassboost", "nightcore", "superslow", "vaporwave", "superspeed".
 * - **UseTor:** An optional boolean flag to route requests through Tor. Defaults to `false`.
 * - **Verbose:** An optional boolean value that, if true, enables detailed logging of the process, including FFmpeg commands. Defaults to `false`.
 * - **Metadata:** An optional boolean flag. If set to `true`, the function will only fetch and return the video metadata without performing any download or streaming. Cannot be used with `stream`, `output`, `filter`, or `showProgress`. Defaults to `false`.
 * - **ShowProgress:** An optional boolean flag to display a progress bar in the console during download or streaming. Defaults to `false`. Cannot be used with `metadata`.
 *
 * The function's return type depends on the provided options:
 * - If `metadata` is `true`, it returns a Promise resolving to `{ metadata: object }` containing detailed video information.
 * - If `stream` is `true` (and `metadata` is `false`), it returns a Promise resolving to `{ stream: Readable }` providing a stream of the audio data.
 * - Otherwise (if `metadata` is `false` and `stream` is `false`), it returns a Promise resolving to `{ outputPath: string }` indicating the path to the downloaded file.
 *
 * FFmpeg is used internally, setting the output format to 'avi' and including the video thumbnail as a second input, potentially for embedding album art.
 *
 * @param {object} options - The configuration options for the audio fetching and processing.
 * @param {string} options.query - The Youtube query or video URL (minimum 2 characters). **Required**.
 * @param {"high" | "medium" | "low" | "ultralow"} options.resolution - The desired audio resolution/quality. **Required**.
 * @param {string} [options.output] - The directory path to save the downloaded file. Cannot be used with `stream`.
 * @param {boolean} [options.stream=false] - If true, returns a Readable stream instead of saving a file. Cannot be used with `output`.
 * @param {boolean} [options.useTor=false] - Use Tor for requests.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 * @param {boolean} [options.metadata=false] - Fetch only metadata. Cannot be used with `stream`, `output`, `filter`, or `showProgress`.
 * @param {boolean} [options.showProgress=false] - Display a progress bar. Cannot be used with `metadata`.
 * @param {"echo" | "slow" | "speed" | "phaser" | "flanger" | "panning" | "reverse" | "vibrato" | "subboost" | "surround" | "bassboost" | "nightcore" | "superslow" | "vaporwave" | "superspeed"} [options.filter] - Apply an audio filter.
 *
 * @returns {Promise<{ metadata: object } | { outputPath: string } | { stream: Readable }>} A promise resolving to an object containing either the metadata, the output file path, or a readable stream, depending on the options.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing required parameters, invalid enum values for resolution or filter, `query` less than 2 characters).
 * - Throws an `Error` if invalid option combinations are used (e.g., `metadata` with output/stream/filter/showProgress, `stream` with output).
 * - Throws an `Error` if the internal engine (`Tuber`) fails to retrieve a response or metadata.
 * - Throws an `Error` if FFmpeg or FFprobe executables are not found on the system.
 * - Throws an `Error` if no audio data is found for the specified `resolution`.
 * - Throws an `Error` if the audio URL or thumbnail URL is missing from the fetched data.
 * - Throws an `Error` if the output directory cannot be created when `output` is specified and `stream` is false.
 * - Throws an `Error` if an FFmpeg process error occurs during download or streaming.
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Basic Audio Download
 * const query = "a video with audio"; // Replace with your query or URL
 * try {
 * const result = await AudioCustom({ query, resolution: "high" });
 * if ("outputPath" in result) {
 * console.log("Basic download finished:", result.outputPath);
 * }
 * } catch (error) {
 * console.error("Basic download error:", error);
 * }
 *
 * @example
 * // 2. Download with Output Directory and Bass Boost Filter
 * const query = "another video"; // Replace with your query or URL
 * try {
 * const result = await AudioCustom({ query, output: "./custom_downloads_audiocustom", filter: "bassboost", resolution: "medium" });
 * if ("outputPath" in result) {
 * console.log("Download with output and filter finished:", result.outputPath);
 * }
 * } catch (error) {
 * console.error("Download with output and filter error:", error);
 * }
 *
 * @example
 * // 3. Download with Verbose Logging, Echo Filter, and Progress Bar
 * const query = "video for testing"; // Replace with your query or URL
 * try {
 * const result = await AudioCustom({ query, resolution: "low", output: "./full_downloads_audiocustom", verbose: true, filter: "echo", showProgress: true });
 * if ("outputPath" in result) {
 * console.log("\nDownload with all options finished:", result.outputPath);
 * }
 * } catch (error) {
 * console.error("\nDownload with all options error:", error);
 * }
 *
 * @example
 * // 4. Fetch Metadata Only
 * const query = "video metadata test"; // Replace with your query or URL
 * try {
 * const result = await AudioCustom({ query, resolution: "high", metadata: true });
 * if ("metadata" in result) {
 * console.log("Metadata:", result.metadata);
 * }
 * } catch (error) {
 * console.error("Metadata fetch error:", error);
 * }
 *
 * @example
 * // 5. Basic Audio Stream
 * import { createWriteStream } from "fs";
 * const query = "streamable audio"; // Replace with your query or URL
 * try {
 * const result = await AudioCustom({ query, resolution: "low", stream: true });
 * if ("stream" in result && result.stream) {
 * console.log("Basic streaming started. Piping to basic_stream_audiocustom.avi...");
 * const outputStream = createWriteStream("basic_stream_audiocustom.avi");
 * result.stream.pipe(outputStream);
 * await new Promise<void>((resolve, reject) => {
 * result.stream.on("end", () => {
 * console.log("Basic streaming finished.");
 * resolve();
 * });
 * result.stream.on("error", error => {
 * console.error("Basic stream error:", error.message);
 * result.stream.destroy(error);
 * reject(error);
 * });
 * });
 * }
 * } catch (error) {
 * console.error("Basic stream setup error:", error);
 * }
 *
 * @example
 * // 6. Stream with Vaporwave Filter
 * import { createWriteStream } from "fs";
 * const query = "audio for filter test"; // Replace with your query or URL
 * try {
 * const result = await AudioCustom({ query, resolution: "medium", stream: true, filter: "vaporwave" });
 * if ("stream" in result && result.stream) {
 * console.log("Stream with filter started. Piping to filtered_stream_audiocustom.avi...");
 * const outputStream = createWriteStream("filtered_stream_audiocustom.avi");
 * result.stream.pipe(outputStream);
 * await new Promise<void>((resolve, reject) => {
 * result.stream.on("end", () => {
 * console.log("Stream with filter finished.");
 * resolve();
 * });
 * result.stream.on("error", error => {
 * console.error("Stream with filter error:", error.message);
 * result.stream.destroy(error);
 * reject(error);
 * });
 * });
 * }
 * } catch (error) {
 * console.error("Stream with filter setup error:", error);
 * }
 *
 * @example
 * // 7. Invalid Options Example (Metadata and Output used together - will throw Error)
 * const query = "some video"; // Replace with your query or URL
 * try {
 * await AudioCustom({ query, resolution: "high", metadata: true, output: "./should_fail_dir" });
 * console.log("This should not be reached - Invalid Options Example.");
 * } catch (error) {
 * console.error("Expected Error (Metadata and Output):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 8. Invalid Options Example (Stream and Output used together - will throw Error)
 * const query = "some video"; // Replace with your query or URL
 * try {
 * await AudioCustom({ query, resolution: "high", stream: true, output: "./should_fail_dir" });
 * console.log("This should not be reached - Invalid Options Example.");
 * } catch (error) {
 * console.error("Expected Error (Stream and Output):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 9. Zod Validation Error Example (Missing Query - will throw ZodError)
 * try {
 * await AudioCustom({ resolution: "high" } as any); // Simulating missing query
 * console.log("This should not be reached - Missing Query Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Missing Query):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 10. Zod Validation Error Example (Missing Resolution - will throw ZodError)
 * const query = "some video"; // Replace with your query or URL
 * try {
 * await AudioCustom({ query } as any); // Simulating missing resolution
 * console.log("This should not be reached - Missing Resolution Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Missing Resolution):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 11. Zod Validation Error Example (Invalid Filter - will throw ZodError)
 * const query = "some video"; // Replace with your query or URL
 * try {
 * await AudioCustom({ query, resolution: "high", filter: "nonexistentfilter" as any }); // Simulating invalid enum value
 * console.log("This should not be reached - Invalid Filter Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Invalid Filter):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 12. Zod Validation Error Example (Invalid Resolution - will throw ZodError)
 * const query = "some video"; // Replace with your query or URL
 * try {
 * await AudioCustom({ query, resolution: "superhigh" as any }); // Simulating invalid enum value
 * console.log("This should not be reached - Invalid Resolution Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Invalid Resolution):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 13. Example of Client Initialization Failure (e.g., Tuber fails to respond)
 * // This scenario depends on the internal Tuber logic failing.
 * // You would typically trigger this by providing a query that the engine cannot process or if the engine itself fails.
 * // try {
 * //    await AudioCustom({ query: "query-that-breaks-tuber", resolution: "high" });
 * // } catch (error) {
 * //    console.error("Expected Error (Client Initialization Failed):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 14. Example of FFmpeg/FFprobe not found
 * // This would occur if the ffmpeg/ffprobe executables are not in PATH and the locator fails.
 * // try {
 * //    // Ensure ffmpeg/ffprobe are not found in PATH before running
 * //    await AudioCustom({ query: "your search query or url", resolution: "high" });
 * // } catch (error) {
 * //    console.error("Expected Error (FFmpeg not found):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 15. Example of no audio data for specified resolution
 * // This might occur for certain videos if the internal engine doesn't return a format matching the requested resolution.
 * // try {
 * //    // Use a query/resolution combination known to fail
 * //    await AudioCustom({ query: "some video", resolution: "ultralow" }); // Example, might not always fail
 * // } catch (error) {
 * //    console.error("Expected Error (No audio data):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 16. Example of FFmpeg processing error (during download or stream)
 * // This can occur due to various reasons like network issues, invalid input stream, or FFmpeg internal errors.
 * // It's difficult to trigger reliably via a simple example.
 * // try {
 * //    // Use a query/options known to cause FFmpeg issues
 * //    await AudioCustom({ query: "query-causing-ffmpeg-error", resolution: "high" });
 * // } catch (error) {
 * //    console.error("Expected Error (FFmpeg Processing Error):", error instanceof Error ? error.message : error);
 * // }
 */
export default async function AudioCustom({
    query,
    output,
    useTor,
    stream,
    filter,
    verbose,
    metadata,
    resolution,
    showProgress,
}: AudioCustomOptions): Promise<{ metadata: object } | { outputPath: string } | { stream: Readable }> {
    try {
        ZodSchema.parse({ query, output, useTor, stream, filter, verbose, metadata, resolution, showProgress });
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
            throw new Error(`${colors.red("@error:")} Metadata was not found in the engine's response.`);
        }
        if (metadata) {
            return {
                metadata: {
                    metaData: engineData.metaData,
                    BestAudioLow: engineData.BestAudioLow,
                    BestAudioHigh: engineData.BestAudioHigh,
                    AudioLowDRC: engineData.AudioLowDRC,
                    AudioHighDRC: engineData.AudioHighDRC,
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
        } catch (locatorError: any) {
            throw new Error(`${colors.red("@error:")} Failed to locate ffmpeg or ffprobe: ${locatorError.message}`);
        }
        const adata = engineData.AudioHigh?.find((i: { format: string | string[] }) => i.format?.includes(resolution));
        if (!adata) {
            throw new Error(`${colors.red("@error:")} No audio data found for the specified resolution: ${resolution}. Please use the 'list_formats()' command to see available formats.`);
        }
        if (!adata.url) {
            throw new Error(`${colors.red("@error:")} The audio URL was not found.`);
        }
        instance.addInput(adata.url);
        if (!engineData.metaData.thumbnail) {
            throw new Error(`${colors.red("@error:")} The thumbnail URL was not found.`);
        }
        instance.addInput(engineData.metaData.thumbnail);
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
            const filenameBase = `yt-dlx_AudioCustom_${resolution}_`;
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
import { createWriteStream } from "fs";
import * as vitest from "vitest";
vitest.describe("AudioCustom", () => {
    const query = "test query";
    vitest.it("should handle basic download", async () => {
        const result = await AudioCustom({ query, resolution: "high" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.avi$/);
        }
    });
    vitest.it("should handle download with output and filter", async () => {
        const result = await AudioCustom({ query, output: "./custom_downloads_audiocustom", filter: "bassboost", resolution: "medium" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.avi$/);
        }
    });
    vitest.it("should handle download with all options", async () => {
        const result = await AudioCustom({ query, resolution: "low", output: "./full_downloads_audiocustom", useTor: false, verbose: true, filter: "echo", showProgress: true });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.avi$/);
        }
    });
    vitest.it("should fetch metadata only", async () => {
        const result = await AudioCustom({ query, resolution: "high", metadata: true });
        vitest.expect(result).toHaveProperty("metadata");
        vitest.expect((result as { metadata: object }).metadata).toBeInstanceOf(Object);
    });
    vitest.it("should handle basic stream", async () => {
        const result = await AudioCustom({ query, resolution: "low", stream: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("basic_stream_audiocustom.avi");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with filter", async () => {
        const result = await AudioCustom({ query, resolution: "medium", stream: true, filter: "vaporwave" });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("filtered_stream_audiocustom.avi");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should throw error for metadata with output", async () => {
        await vitest.expect(AudioCustom({ query: "test query", resolution: "high", metadata: true, output: "./should_fail_dir" })).rejects.toThrowError(/metadata.*cannot be used with.*output/);
    });
    vitest.it("should throw error for stream with output", async () => {
        await vitest.expect(AudioCustom({ query: "test query", resolution: "high", stream: true, output: "./should_fail_dir" })).rejects.toThrowError(/stream.*cannot be used with.*output/);
    });
    vitest.it("should throw Zod error for missing query", async () => {
        await vitest.expect(AudioCustom({ resolution: "high" } as any)).rejects.toThrowError(/query.*Required/);
    });
    vitest.it("should throw Zod error for missing resolution", async () => {
        await vitest.expect(AudioCustom({ query: "test query" } as any)).rejects.toThrowError(/resolution.*Required/);
    });
    vitest.it("should throw Zod error for invalid filter", async () => {
        await vitest.expect(AudioCustom({ query: "test query", resolution: "high", filter: "nonexistentfilter" as any })).rejects.toThrowError(/filter.*invalid enum value/);
    });
    vitest.it("should throw Zod error for invalid resolution", async () => {
        await vitest.expect(AudioCustom({ query: "test query", resolution: "superhigh" as any })).rejects.toThrowError(/resolution.*invalid enum value/);
    });
});
