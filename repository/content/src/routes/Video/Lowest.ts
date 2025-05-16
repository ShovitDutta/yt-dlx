import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import Tuber from "../../utils/Agent";
import { EventEmitter } from "events";
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
/**
 * @shortdesc Downloads or streams the lowest quality video from YouTube.
 *
 * @description This function allows you to download or stream the lowest available video quality from YouTube based on a search query or video URL. It offers customization options such as saving the output to a specified directory, using Tor for anonymity, enabling verbose logging, streaming the output, or simply fetching the metadata without downloading. Video filters can also be applied.
 *
 * The function requires a search query or video URL. It automatically selects the lowest quality video format available.
 *
 * It supports the following configuration options:
 * - **query:** A string representing the search query or video URL. This is a mandatory parameter.
 * - **output:** An optional string specifying the directory where the output video file should be saved. If not provided, the file will be saved in the current working directory. This parameter cannot be used when `metadata` is true.
 * - **useTor:** An optional boolean value. If true, the function will attempt to use Tor for the network requests, enhancing anonymity.
 * - **stream:** An optional boolean value. If true, the video will be streamed instead of saved to a file. When streaming, the `end` event will provide the streamable path and the `stream` event will provide the FFmpeg instance. This parameter cannot be used when `metadata` is true.
 * - **verbose:** An optional boolean value. If true, enables detailed logging to the console, providing more information about the process.
 * - **metadata:** An optional boolean value. If true, the function will only fetch and emit the video metadata without downloading or streaming the video. When `metadata` is true, the `output`, `stream`, and `filter` parameters are not allowed.
 * - **filter:** An optional string specifying a video filter to apply to the video stream. This parameter is ignored when `metadata` is true. Available filters include: "invert", "rotate90", "rotate270", "grayscale", "rotate180", "flipVertical", "flipHorizontal".
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - `"start"`: Emitted when the process begins, providing the FFmpeg command being executed.
 * - `"progress"`: Emitted periodically during the download/streaming process, providing progress details (e.g., downloaded size, time remaining).
 * - `"end"`: Emitted when the download/streaming process completes successfully, providing the path to the saved file. If `stream` is true, it provides the streamable path.
 * - `"metadata"`: Emitted only when the `metadata` parameter is true. Provides an object containing the video metadata, the lowest video format details, and a suggested filename.
 * - `"stream"`: Emitted only when the `stream` parameter is true. Provides an object containing the streamable filename/path and the FFmpeg instance.
 * - `"error"`: Emitted when an error occurs at any stage, such as argument validation, network issues, or FFmpeg errors. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.query - The search query or video URL. **Required**.
 * @param {string} [options.output] - The directory to save the output file. Cannot be used with `metadata: true`.
 * @param {boolean} [options.useTor] - Whether to use Tor.
 * @param {boolean} [options.stream] - Whether to stream the output. Cannot be used with `metadata: true`.
 * @param {boolean} [options.verbose] - Enable verbose logging.
 * @param {boolean} [options.metadata] - Only fetch metadata. Cannot be used with `output`, `stream`, or `filter`.
 * @param {("invert" | "rotate90" | "rotate270" | "grayscale" | "rotate180" | "flipVertical" | "flipHorizontal")} [options.filter] - A video filter to apply. Cannot be used with `metadata: true`.
 *
 * @returns {EventEmitter} An EventEmitter instance for handling events during the video processing.
 *
 * @example
 * // 1. Download the lowest quality video to the current directory
 * YouTubeDLX.Video.Lowest({ query: "your search query or url" })
 * .on("start", (start) => console.log("FFmpeg started:", start))
 * .on("progress", (progress) => console.log("Progress:", progress))
 * .on("end", (outputPath) => console.log("Download finished:", outputPath))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 2. Download the lowest quality video to a custom output directory
 * YouTubeDLX.Video.Lowest({ query: "your search query or url", output: "./lowest_video_downloads" })
 * .on("start", (start) => console.log("FFmpeg started:", start))
 * .on("progress", (progress) => console.log("Progress:", progress))
 * .on("end", (outputPath) => console.log("Download finished:", outputPath))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 3. Stream the lowest quality video
 * YouTubeDLX.Video.Lowest({ query: "your search query or url", stream: true })
 * .on("start", (start) => console.log("FFmpeg started:", start))
 * .on("progress", (progress) => console.log("Progress:", progress))
 * .on("stream", (data) => {
 * console.log("Stream available:", data.filename);
 * // You can use data.ffmpeg instance for streaming
 * })
 * .on("end", (streamPath) => console.log("Streaming session ended:", streamPath))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 4. Fetch only metadata for the lowest quality video
 * YouTubeDLX.Video.Lowest({ query: "your search query or url", metadata: true })
 * .on("metadata", (data) => console.log("Metadata:", data))
 * .on("error", (error) => console.error("Error:", error));
 * // Note: output, stream, and filter are ignored when metadata is true.
 *
 * @example
 * // 5. Download the lowest quality video and apply a filter (e.g., grayscale)
 * YouTubeDLX.Video.Lowest({ query: "your search query or url", filter: "grayscale" })
 * .on("start", (start) => console.log("FFmpeg started:", start))
 * .on("progress", (progress) => console.log("Progress:", progress))
 * .on("end", (outputPath) => console.log("Download finished:", outputPath))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 6. Download the lowest quality video and use Tor
 * YouTubeDLX.Video.Lowest({ query: "your search query or url", useTor: true })
 * .on("start", (start) => console.log("FFmpeg started:", start))
 * .on("progress", (progress) => console.log("Progress:", progress))
 * .on("end", (outputPath) => console.log("Download finished:", outputPath))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 7. Download the lowest quality video and enable verbose logging
 * YouTubeDLX.Video.Lowest({ query: "your search query or url", verbose: true })
 * .on("start", (start) => console.log("FFmpeg started:", start))
 * .on("progress", (progress) => console.log("Progress:", progress))
 * .on("end", (outputPath) => console.log("Download finished:", outputPath))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 8. Download the lowest quality video with custom output and apply a filter (e.g., rotate 180)
 * YouTubeDLX.Video.Lowest({ query: "your search query or url", output: "./filtered_videos", filter: "rotate180" })
 * .on("start", (start) => console.log("FFmpeg started:", start))
 * .on("progress", (progress) => console.log("Progress:", progress))
 * .on("end", (outputPath) => console.log("Download finished:", outputPath))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 9. Stream the lowest quality video and apply a filter (e.g., flip horizontal)
 * YouTubeDLX.Video.Lowest({ query: "your search query or url", stream: true, filter: "flipHorizontal" })
 * .on("start", (start) => console.log("FFmpeg started:", start))
 * .on("progress", (progress) => console.log("Progress:", progress))
 * .on("stream", (data) => {
 * console.log("Stream available:", data.filename);
 * // You can use data.ffmpeg instance for streaming
 * })
 * .on("end", (streamPath) => console.log("Streaming session ended:", streamPath))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 10. Download the lowest quality video with all applicable options (query, output, useTor, verbose, filter)
 * YouTubeDLX.Video.Lowest({ query: "your search query or url", output: "./full_options_lowest", useTor: true, verbose: true, filter: "invert" })
 * .on("start", (start) => console.log("FFmpeg started:", start))
 * .on("progress", (progress) => console.log("Progress:", progress))
 * .on("end", (outputPath) => console.log("Download finished:", outputPath))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 11. Stream the lowest quality video with all applicable options (query, stream, useTor, verbose, filter)
 * YouTubeDLX.Video.Lowest({ query: "your search query or url", stream: true, useTor: true, verbose: true, filter: "rotate90" })
 * .on("start", (start) => console.log("FFmpeg started:", start))
 * .on("progress", (progress) => console.log("Progress:", progress))
 * .on("stream", (data) => {
 * console.log("Stream available:", data.filename);
 * // You can use data.ffmpeg instance for streaming
 * })
 * .on("end", (streamPath) => console.log("Streaming session ended:", streamPath))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 12. Fetch metadata with verbose logging and use Tor
 * YouTubeDLX.Video.Lowest({ query: "your search query or url", metadata: true, verbose: true, useTor: true })
 * .on("metadata", (data) => console.log("Metadata (Verbose, Tor):", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 13. Attempt to use output with metadata (will result in an error)
 * YouTubeDLX.Video.Lowest({ query: "your search query or url", metadata: true, output: "./should_fail" })
 * .on("error", (error) => console.error("Expected Error (output with metadata):", error));
 *
 * @example
 * // 14. Attempt to use stream with metadata (will result in an error)
 * YouTubeDLX.Video.Lowest({ query: "your search query or url", metadata: true, stream: true })
 * .on("error", (error) => console.error("Expected Error (stream with metadata):", error));
 *
 * @example
 * // 15. Attempt to use filter with metadata (will result in an error)
 * YouTubeDLX.Video.Lowest({ query: "your search query or url", metadata: true, filter: "grayscale" })
 * .on("error", (error) => console.error("Expected Error (filter with metadata):", error));
 *
 * @example
 * // 16. Attempt to use stream and output together
 * // Based on the code, stream: true and an output path provided will likely result in a file being saved and the stream event also firing.
 * YouTubeDLX.Video.Lowest({ query: "your search query or url", stream: true, output: "./streamed_and_saved_lowest" })
 * .on("start", (start) => console.log("FFmpeg started:", start))
 * .on("progress", (progress) => console.log("Progress:", progress))
 * .on("stream", (data) => {
 * console.log("Stream event fired, file likely being saved to:", data.filename);
 * })
 * .on("end", (outputPath) => console.log("Process ended, file saved at:", outputPath)) // Should output the path in './streamed_and_saved_lowest'
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 17. Missing required 'query' parameter (will result in an error)
 * YouTubeDLX.Video.Lowest({} as any)
 * .on("error", (error) => console.error("Expected Error (missing query):", error));
 *
 * @example
 * // 18. Invalid 'filter' value (will result in an error - Zod validation)
 * YouTubeDLX.Video.Lowest({ query: "your search query or url", filter: "nonexistentvideofilter" as any })
 * .on("error", (error) => console.error("Expected Error (invalid filter):", error));
 *
 * @example
 * // 19. Query results in no engine data
 * // Note: This scenario depends on the internal Tuber function's behavior.
 * // You can simulate by providing a query that is unlikely to return results.
 * YouTubeDLX.Video.Lowest({ query: "a query that should return no results 12345abcde" })
 * .on("error", (error) => console.error("Expected Error (no engine data):", error));
 *
 */
export default function VideoLowest({ query, stream, verbose, output, metadata, useTor, filter }: z.infer<typeof ZodSchema>): EventEmitter {
    const emitter = new EventEmitter();
    (async () => {
        try {
            if (!query) {
                emitter.emit("error", `${colors.red("@error:")} The 'query' parameter is always required.`);
                return;
            }
            if (metadata) {
                if (stream) {
                    emitter.emit("error", `${colors.red("@error:")} The 'stream' parameter cannot be used when 'metadata' is true.`);
                    return;
                }
                if (output) {
                    emitter.emit("error", `${colors.red("@error:")} The 'output' parameter cannot be used when 'metadata' is true.`);
                    return;
                }
                if (filter) {
                    emitter.emit("error", `${colors.red("@error:")} The 'filter' parameter cannot be used when 'metadata' is true.`);
                    return;
                }
            }
            if (stream && metadata) {
                emitter.emit("error", `${colors.red("@error:")} The 'stream' parameter cannot be true when 'metadata' is true.`);
                return;
            }
            ZodSchema.parse({ query, stream, verbose, output, metadata, useTor, filter });
            const engineData = await Tuber({ query, verbose, useTor }).catch(error => {
                emitter.emit("error", `${colors.red("@error:")} Engine error: ${error?.message}`);
                return undefined;
            });
            if (!engineData) {
                emitter.emit("error", `${colors.red("@error:")} Unable to retrieve a response from the engine.`);
                return;
            }
            if (!engineData.metaData) {
                emitter.emit("error", `${colors.red("@error:")} Metadata not found in the engine response.`);
                return;
            }
            if (metadata) {
                emitter.emit("metadata", {
                    metaData: engineData.metaData,
                    BestVideoLow: engineData.BestVideoLow,
                    VideoLowHDR: engineData.VideoLowHDR,
                    ManifestLow: engineData.ManifestLow,
                    filename: engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_"),
                });
                return;
            }
            const title = engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "video";
            const folder = output ? output : process.cwd();
            if (!fs.existsSync(folder)) {
                try {
                    fs.mkdirSync(folder, { recursive: true });
                } catch (mkdirError: any) {
                    emitter.emit("error", `${colors.red("@error:")} Failed to create output directory: ${mkdirError?.message}`);
                    return;
                }
            }
            const instance: ffmpeg.FfmpegCommand = ffmpeg();
            try {
                const paths = await locator();
                if (!paths.ffmpeg) {
                    emitter.emit("error", `${colors.red("@error:")} ffmpeg executable not found.`);
                    return;
                }
                if (!paths.ffprobe) {
                    emitter.emit("error", `${colors.red("@error:")} ffprobe executable not found.`);
                    return;
                }
                instance.setFfmpegPath(paths.ffmpeg);
                instance.setFfprobePath(paths.ffprobe);
            } catch (locatorError: any) {
                emitter.emit("error", `${colors.red("@error:")} Failed to locate ffmpeg or ffprobe: ${locatorError?.message}`);
                return;
            }

            if (!engineData.BestVideoLow?.url) {
                emitter.emit("error", `${colors.red("@error:")} Lowest quality video URL not found.`);
                return;
            }
            instance.addInput(engineData.BestVideoLow.url);
            instance.withOutputFormat("mp4");
            const filenameBase = `yt-dlx_VideoLowest_`;
            let filename = `${filenameBase}${filter ? filter + "_" : ""}${title}.mp4`;
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
            instance.on("progress", progress => emitter.emit("progress", progress));
            instance.on("error", error => emitter.emit("error", `${colors.red("@error:")} FFmpeg error: ${error?.message}`));
            instance.on("start", start => emitter.emit("start", start));
            instance.on("end", () => emitter.emit("end", outputPath));
            instance.output(outputPath);
            if (stream) emitter.emit("stream", { filename: outputPath, ffmpeg: instance });
            instance.run();
        } catch (error) {
            if (error instanceof ZodError) emitter.emit("error", `${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
            else if (error instanceof Error) emitter.emit("error", `${colors.red("@error:")} ${error?.message}`);
            else emitter.emit("error", `${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
        } finally {
            console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
        }
    })();
    return emitter;
}
