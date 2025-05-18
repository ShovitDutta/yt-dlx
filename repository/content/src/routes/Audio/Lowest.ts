/**
 * @shortdesc Downloads or streams the lowest quality audio from YouTube videos/queries with options for filters and output.
 *
 * @description This function allows fetching the lowest available quality audio from a YouTube video identified by a query or URL.
 * It uses an internal engine (`Agent`) to retrieve video information and the URL for the lowest audio format,
 * and then utilizes FFmpeg to process (optionally apply filters) and output the selected audio.
 * The output can be either a downloadable file saved locally or a readable stream.
 * The function also supports fetching only the video's metadata.
 *
 * It requires a valid search query or URL to identify the YouTube video.
 * FFmpeg and FFprobe executables must be available in the system's PATH or locatable by the internal `locator` utility.
 *
 * The function supports the following configuration options:
 * - **Query:** A string representing the Youtube query or URL. Must be at least 2 characters long. **Required**.
 * - **Output:** An optional string specifying the directory path where the downloaded audio file should be saved. If not provided, the file is saved in the current working directory. Cannot be used with `stream`.
 * - **Stream:** An optional boolean flag. If set to `true`, the function returns a Node.js Readable stream of the audio data instead of saving a file. Cannot be used with `output`. Defaults to `false`.
 * - **Filter:** An optional string specifying an audio filter to apply using FFmpeg. Available filters include "echo", "slow", "speed", "phaser", "flanger", "panning", "reverse", "vibrato", "subboost", "surround", "bassboost", "nightcore", "superslow", "vaporwave", "superspeed".
 * - **UseTor:** An optional boolean flag to route requests through Tor (handled by the internal `Agent`). Defaults to `false`.
 * - **Verbose:** An optional boolean value that, if true, enables detailed logging of the process, including FFmpeg commands. Defaults to `false`.
 * - **Metadata:** An optional boolean flag. If set to `true`, the function will only fetch and return the video metadata without performing any download or streaming. Cannot be used with `stream`, `output`, `filter`, or `showProgress`. Defaults to `false`.
 * - **ShowProgress:** An optional boolean flag to display a progress bar in the console during download or streaming. Defaults to `false`. Cannot be used with `metadata`.
 *
 * The function's return type depends on the provided options:
 * - If `metadata` is `true`, it returns a Promise resolving to `{ metadata: object }` containing detailed video information including the lowest quality audio format data (`BestAudioLow`, `AudioLowDRC`) and a suggested filename.
 * - If `stream` is `true` (and `metadata` is `false`), it returns a Promise resolving to `{ stream: Readable }` providing a stream of the audio data.
 * - Otherwise (if `metadata` is `false` and `stream` is `false`), it returns a Promise resolving to `{ outputPath: string }` indicating the path to the downloaded file.
 *
 * FFmpeg is used internally, setting the output format to 'avi' and including the video thumbnail as a second input, potentially for embedding album art.
 *
 * @param {object} options - The configuration options for the audio fetching and processing.
 * @param {string} options.query - The Youtube query or video URL (minimum 2 characters). **Required**.
 * @param {string} [options.output] - The directory path to save the downloaded file. Cannot be used with `stream`.
 * @param {boolean} [options.stream=false] - If true, returns a Readable stream instead of saving a file. Cannot be used with `output`.
 * @param {boolean} [options.useTor=false] - Use Tor for requests via the internal Agent.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 * @param {boolean} [options.metadata=false] - Fetch only metadata. Cannot be used with `stream`, `output`, `filter`, or `showProgress`.
 * @param {boolean} [options.showProgress=false] - Display a progress bar. Cannot be used with `metadata`.
 * @param {"echo" | "slow" | "speed" | "phaser" | "flanger" | "panning" | "reverse" | "vibrato" | "subboost" | "surround" | "bassboost" | "nightcore" | "superslow" | "vaporwave" | "superspeed"} [options.filter] - Apply an audio filter.
 *
 * @returns {Promise<{ metadata: object } | { outputPath: string } | { stream: Readable }>} A promise resolving to an object containing either the metadata, the output file path, or a readable stream, depending on the options.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing required `query`, `query` less than 2 characters, invalid enum value for `filter`).
 * - Throws an `Error` if invalid option combinations are used (e.g., `metadata` with output/stream/filter/showProgress, `stream` with output).
 * - Throws an `Error` if the internal engine (`Agent`) fails to retrieve a response or metadata.
 * - Throws an `Error` if FFmpeg or FFprobe executables are not found on the system.
 * - Throws an `Error` if the lowest quality audio URL (`BestAudioLow?.url`) is not found in the fetched data.
 * - Throws an `Error` if the thumbnail URL is missing from the fetched data.
 * - Throws an `Error` if the output directory cannot be created when `output` is specified and `stream` is false.
 * - Throws an `Error` if an FFmpeg process error occurs during download or streaming.
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Basic download (fetches lowest quality audio, saves in current directory)
 * const query = "test query or url";
 * try {
 * const result = await AudioLowest({ query });
 * if ("outputPath" in result) console.log("Basic Download finished:", result.outputPath);
 * } catch (error) {
 * console.error("Basic Download Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Download with output directory and filter
 * const query = "test query or url";
 * try {
 * const result = await AudioLowest({ query, output: "./custom_downloads_al", filter: "bassboost" });
 * if ("outputPath" in result) console.log("Download with Output and Filter finished:", result.outputPath);
 * } catch (error) {
 * console.error("Download with Output and Filter Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Download with all options (excluding incompatible ones)
 * const query = "test query or url";
 * try {
 * const result = await AudioLowest({ query, output: "./full_downloads_al", useTor: true, verbose: true, filter: "vaporwave", showProgress: true });
 * if ("outputPath" in result) console.log("\nDownload with All Options finished:", result.outputPath);
 * } catch (error) {
 * console.error("\nDownload with All Options Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Fetch metadata only
 * const query = "test query or url";
 * try {
 * const result = await AudioLowest({ query, metadata: true });
 * if ("metadata" in result) console.log("Metadata Only:", result.metadata);
 * } catch (error) {
 * console.error("Metadata Only Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Fetch metadata with verbose logging and Tor usage
 * const query = "test query or url";
 * try {
 * const result = await AudioLowest({ query, metadata: true, useTor: true, verbose: true });
 * if ("metadata" in result) console.log("Metadata with Tor and Verbose:", result.metadata);
 * } catch (error) {
 * console.error("Metadata with Tor and Verbose Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Basic streaming (fetches lowest quality audio, pipes to a local file)
 * import { createWriteStream } from "fs";
 * const query = "test query or url";
 * try {
 * const result = await AudioLowest({ query, stream: true });
 * if ("stream" in result && result.stream) {
 * console.log("Basic Streaming started. Piping to basic_stream_al.avi...");
 * const outputStream = createWriteStream("basic_stream_al.avi");
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
 * // 7. Streaming with audio filter (pipes to a local file)
 * import { createWriteStream } from "fs";
 * const query = "test query or url";
 * try {
 * const result = await AudioLowest({ query, stream: true, filter: "nightcore" });
 * if ("stream" in result && result.stream) {
 * console.log("Stream with Filter started. Piping to filtered_stream_al.avi...");
 * const outputStream = createWriteStream("filtered_stream_al.avi");
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
 * // 8. Streaming with all options (excluding incompatible 'metadata' and 'output'), with progress bar
 * import { createWriteStream } from "fs";
 * const query = "test query or url";
 * try {
 * const result = await AudioLowest({ query, stream: true, useTor: true, verbose: true, filter: "superspeed", showProgress: true });
 * if ("stream" in result && result.stream) {
 * console.log("\nStream with All Options started. Piping to full_stream_al.avi...");
 * const outputStream = createWriteStream("full_stream_al.avi");
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
 * // 9. Example of invalid options (metadata and output used together - will throw Error)
 * const query = "test query or url";
 * try {
 * await AudioLowest({ query, metadata: true, output: "./should_fail_dir" });
 * console.log("This should not be reached - Invalid Options Example.");
 * } catch (error) {
 * console.error("Expected Error (Metadata and Output):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 10. Example of invalid options (stream and output used together - will throw Error)
 * const query = "test query or url";
 * try {
 * await AudioLowest({ query, stream: true, output: "./should_fail_dir" });
 * console.log("This should not be reached - Invalid Options Example.");
 * } catch (error) {
 * console.error("Expected Error (Stream and Output):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 11. Example of Zod validation error (missing query - will throw ZodError)
 * try {
 * await AudioLowest({} as any); // Using 'as any' to simulate missing required parameter
 * console.log("This should not be reached - Zod Validation Error Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Missing Query):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 12. Example of Zod validation error (invalid filter value - will throw ZodError)
 * const query = "test query or url";
 * try {
 * await AudioLowest({ query, filter: "nonexistentfilter" as any }); // Using 'as any' to simulate invalid enum value
 * console.log("This should not be reached - Zod Validation Error Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Invalid Filter):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 13. Example of Agent failure (e.g., Agent fails to retrieve a response)
 * // This scenario depends on the internal Agent logic failing.
 * // You would typically trigger this by providing a query that the agent cannot process or if the agent itself fails.
 * // try {
 * //    await AudioLowest({ query: "query-that-breaks-agent" });
 * // } catch (error) {
 * //    console.error("Expected Error (Agent Failure):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 14. Example of FFmpeg/FFprobe not found
 * // This would occur if the ffmpeg/ffprobe executables are not in PATH and the locator fails.
 * // try {
 * //    // Ensure ffmpeg/ffprobe are not found in PATH before running
 * //    const query = "test query or url";
 * //    await AudioLowest({ query });
 * // } catch (error) {
 * //    console.error("Expected Error (FFmpeg not found):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 15. Example of Lowest Quality Audio URL not found
 * // This might occur for certain videos if the internal engine cannot find the expected format.
 * // try {
 * //    // Use a query for a video known to have issues with lowest quality audio detection
 * //    const query = "some video with format issues";
 * //    await AudioLowest({ query });
 * // } catch (error) {
 * //    console.error("Expected Error (Lowest Quality Audio URL not found):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 16. Example of FFmpeg processing error (during download or stream)
 * // This can occur due to various reasons like network issues, invalid input stream, or FFmpeg internal errors.
 * // It's difficult to trigger reliably via a simple example.
 * // try {
 * //    // Use a query/options known to cause FFmpeg issues
 * //    const query = "query-causing-ffmpeg-error";
 * //    await AudioLowest({ query });
 * // } catch (error) {
 * //    console.error("Expected Error (FFmpeg Processing Error):", error instanceof Error ? error.message : error);
 * // }
 */
import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import Agent from "../../utils/Agent";
import { locator } from "../../utils/locator";
import { Readable, PassThrough } from "stream";
import { spawn } from "child_process";

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
    filter: z
        .enum(["echo", "slow", "speed", "phaser", "flanger", "panning", "reverse", "vibrato", "subboost", "surround", "bassboost", "nightcore", "superslow", "vaporwave", "superspeed"])
        .optional(),
});

type AudioLowestOptions = z.infer<typeof ZodSchema>;

export default async function AudioLowest({
    query,
    output,
    useTor,
    stream,
    filter,
    metadata,
    verbose,
    showProgress,
}: AudioLowestOptions): Promise<{ metadata: object } | { outputPath: string } | { stream: Readable }> {
    try {
        ZodSchema.parse({ query, output, useTor, stream, filter, metadata, verbose, showProgress });
        if (metadata && (stream || output || filter || showProgress)) {
            throw new Error(`${colors.red("@error:")} The 'metadata' parameter cannot be used with 'stream', 'output', 'filter', or 'showProgress'.`);
        }
        if (stream && output) {
            throw new Error(`${colors.red("@error:")} The 'stream' parameter cannot be used with 'output'.`);
        }
        const engineData = await Agent({ query, verbose, useTor });
        if (!engineData) {
            throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        }
        if (!engineData.metaData) {
            throw new Error(`${colors.red("@error:")} Metadata was not found in the engine response.`);
        }
        if (metadata) {
            return {
                metadata: {
                    metaData: engineData.metaData,
                    BestAudioLow: engineData.BestAudioLow,
                    AudioLowDRC: engineData.AudioLowDRC,
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
            if (!paths.ffmpeg || !paths.ffprobe) {
                throw new Error(`${colors.red("@error:")} yt-dlx executable not found.`);
            }
            instance.setFfmpegPath(paths["yt-dlx"]);
            instance.setFfprobePath(paths["yt-dlx"]);
            instance.on("start", (commandLine: string) => {
                const isFfprobe = commandLine.includes("ffprobe");
                const args = commandLine.split(" ").slice(1);
                const fullArgs = isFfprobe ? ["--ffprobe", ...args] : ["--ffmpeg", ...args];
                if (verbose) console.log(colors.green("@info:"), `Running ${isFfprobe ? "ffprobe" : "ffmpeg"} via yt-dlx:`, fullArgs.join(" "));
                const proc = spawn(paths["yt-dlx"], fullArgs, { stdio: ["pipe", "pipe", "pipe"] });
                if (isFfprobe) instance.emit("ffprobeProc", proc);
                else instance.emit("ffmpegProc", proc);
            });
        } catch (locatorError: any) {
            throw new Error(`${colors.red("@error:")} Failed to locate yt-dlx: ${locatorError.message}`);
        }
        if (!engineData.BestAudioLow?.url) {
            throw new Error(`${colors.red("@error:")} Lowest quality audio URL was not found.`);
        }
        instance.addInput(engineData.BestAudioLow.url);
        if (!engineData.metaData.thumbnail) {
            throw new Error(`${colors.red("@error:")} Thumbnail URL was not found.`);
        }
        instance.addInput(engineData.metaData.thumbnail);
        instance.withOutputFormat("avi");
        const filterMap: Record<string, string[]> = {
            bassboost: ["bass=g=10,dynaudnorm=f=150"],
            echo: ["aecho=0.8:0.9:1000:0.3"],
            flanger: ["flanger"],
            nightcore: ["aresample=48000,asetrate=48000*1.25"],
            panning: ["apulsator=hz=0.08"],
            phaser: ["aphaser=in_gain=0.4"],
            reverse: ["areverse"],
            slow: ["atempo=0.8"],
            speed: ["atempo=2"],
            subboost: ["asubboost"],
            superslow: ["atempo=0.5"],
            superspeed: ["atempo=3"],
            surround: ["surround"],
            vaporwave: ["aresample=48000,asetrate=48000*0.8"],
            vibrato: ["vibrato=f=6.5"],
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
            console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
            return { stream: passthroughStream };
        } else {
            const filenameBase = `yt-dlx_AudioLowest_`;
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
            console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
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
    }
}
