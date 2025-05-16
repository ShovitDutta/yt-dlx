import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import Agent from "../../utils/Agent";
import progbar from "../../utils/progbar";
import * as fsPromises from "fs/promises";
import { locator } from "../../utils/locator";

// Define the Zod schema for input validation for AudioVideoCustom
var ZodSchema = z.object({
    query: z.string().min(2), // Mandatory query
    output: z.string().optional(), // Optional output directory
    useTor: z.boolean().optional(), // Optional Tor usage flag
    stream: z.boolean().optional(), // Optional streaming flag
    verbose: z.boolean().optional(), // Optional verbose logging flag
    metadata: z.boolean().optional(), // Optional metadata-only flag
    filter: z // Optional video filter
        .enum(["invert", "rotate90", "rotate270", "grayscale", "rotate180", "flipVertical", "flipHorizontal"])
        .optional(),
    resolution: z.enum(["144p", "240p", "360p", "480p", "720p", "1080p", "1440p", "2160p", "3072p", "4320p", "6480p", "8640p", "12000p"]), // Mandatory resolution
});

// Define types for the possible return values based on flags (similar to audio functions)
type MetadataResult = {
    metaData: any; // General video metadata
    BestAudioLow: any; // Lowest quality audio format details
    BestAudioHigh: any; // Highest quality audio format details
    AudioLowDRC: any; // Lowest quality audio with DRC details
    AudioHighDRC: any; // Highest quality audio with DRC details
    BestVideoLow: any; // Lowest quality video format details
    BestVideoHigh: any; // Highest quality video format details
    VideoLowHDR: any; // Lowest quality HDR video details
    VideoHighHDR: any; // Highest quality HDR video details
    ManifestLow: any; // Details for low range manifest formats
    ManifestHigh: any; // Details for high range manifest formats
    filename: string; // Cleaned filename based on video title
};

type StreamResult = {
    filename: string; // Output path used as filename reference for streaming
    ffmpeg: ffmpeg.FfmpegCommand; // The FFmpeg instance for piping/handling the stream
};

type DownloadResult = string; // The output file path where the video was saved

// Define the union type for the async function's Promise resolution
type AudioVideoCustomResult = MetadataResult | StreamResult | DownloadResult;

/**
 * @shortdesc Downloads, streams, or fetches metadata for combined audio and video from YouTube with custom options using async/await instead of events.
 *
 * @description This function allows you to download, stream, or fetch metadata for a combined audio and video stream from YouTube based on a search query or video URL and a specified video resolution using async/await.
 * It fetches the highest quality audio and the specified video resolution stream and merges them using FFmpeg.
 * It provides customization options such as saving the output to a specified directory, using Tor for anonymity, enabling verbose logging, streaming the output, or simply fetching the metadata. Video filters can also be applied.
 * It returns a Promise that resolves with the result of the operation (metadata object, stream info object, or output file path) or rejects with an error, replacing the EventEmitter pattern.
 *
 * @param options - An object containing the configuration options validated by ZodSchema.
 * @param options.query - The search query or video URL. **Required**.
 * @param {string} [options.output] - The directory where the output video file should be saved. Not allowed when `metadata` is true.
 * @param {boolean} [options.useTor] - Whether to attempt to use Tor for the network requests.
 * @param {boolean} [options.stream] - If true, the video will be processed for streaming instead of saved to a file. Not allowed when `metadata` is true. When streaming, the Promise resolves when FFmpeg starts with an object containing the filename (output path reference) and the FFmpeg instance.
 * @param {boolean} [options.verbose] - If true, enables detailed logging to the console, including FFmpeg command and progress.
 * @param {boolean} [options.metadata] - If true, the function will only fetch metadata without processing audio/video. Not allowed with `output`, `stream`, or `filter`. The Promise resolves with a `MetadataResult` object.
 * @param {("invert" | "rotate90" | "rotate270" | "grayscale" | "rotate180" | "flipVertical" | "flipHorizontal")} [options.filter] - A video filter to apply. Ignored when `metadata` is true.
 * @param {("144p" | "240p" | "360p" | "480p" | "720p" | "1080p" | "1440p" | "2160p" | "3072p" | "4320p" | "6480p" | "8640p" | "12000p")} options.resolution - The desired video resolution. **Required**.
 *
 * @returns {Promise<AudioVideoCustomResult>} A Promise that resolves based on the operation mode:
 * - If `metadata` is true: Resolves with a `MetadataResult` object.
 * - If `stream` is true (and `metadata` is false): Resolves with a `StreamResult` object when FFmpeg starts.
 * - If downloading (neither `metadata` nor `stream` is true): Resolves with the `DownloadResult` string (the output file path) when FFmpeg finishes successfully.
 * @throws {Error} Throws a formatted error if argument validation fails (ZodError), if the engine fails to retrieve data, if required metadata or formats are missing, if directory creation fails, if FFmpeg/FFprobe executables are not found, or if FFmpeg encounters an error during processing.
 */
export default async function AudioVideoCustom({ query, stream, output, useTor, filter, metadata, verbose, resolution }: z.infer<typeof ZodSchema>): Promise<AudioVideoCustomResult> {
    try {
        let startTime: [number, number] | undefined;
        // Perform initial validation checks before Zod parse for clearer messages on common requirement errors.
        if (!query) {
            throw new Error(`${colors.red("@error:")} The 'query' parameter is always required.`);
        }
        if (!resolution) {
            // Although Zod validates this, explicit check provides a clearer message.
            throw new Error(`${colors.red("@error:")} The 'resolution' parameter is always required.`);
        }
        // Validate parameter combinations that are not allowed when metadata is true.
        if (metadata) {
            if (stream) {
                throw new Error(`${colors.red("@error:")} The 'stream' parameter cannot be used when 'metadata' is true.`);
            }
            if (output) {
                throw new Error(`${colors.red("@error:")} The 'output' parameter cannot be used when 'metadata' is true.`);
            }
            if (filter) {
                throw new Error(`${colors.red("@error:")} The 'filter' parameter cannot be used when 'metadata' is true.`);
            }
        }
        // Validate that stream and metadata are not both true (redundant check but harmless).
        if (stream && metadata) {
            throw new Error(`${colors.red("@error:")} The 'stream' parameter cannot be true when 'metadata' is true.`);
        }

        // Perform Zod schema validation on the provided options. This call is synchronous.
        // It will throw a ZodError if validation fails based on the defined schema.
        ZodSchema.parse({ query, stream, output, useTor, filter, metadata, verbose, resolution });

        // Await the asynchronous call to the Agent to get engine data.
        // This function is assumed to return a Promise<EngineOutput | null>.
        // Removed the original `.catch()` on the await call so errors propagate naturally to the main try/catch.
        const engineData = await Agent({ query, verbose, useTor });

        // Check if engine data was successfully retrieved.
        if (!engineData) {
            throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        }

        // Check if metadata is present in the engine response, which is required for processing.
        if (!engineData.metaData) {
            throw new Error(`${colors.red("@error:")} Metadata was not found in the engine response.`);
        }

        // Handle the metadata-only mode.
        if (metadata) {
            // If metadata is requested, return the relevant metadata object immediately.
            // The async function automatically wraps this return value in a resolved Promise.
            return {
                metaData: engineData.metaData,
                BestAudioLow: engineData.BestAudioLow, // Include various audio format details from engineData
                BestAudioHigh: engineData.BestAudioHigh,
                AudioLowDRC: engineData.AudioLowDRC,
                AudioHighDRC: engineData.AudioHighDRC,
                BestVideoLow: engineData.BestVideoLow, // Include various video format details from engineData
                BestVideoHigh: engineData.BestVideoHigh,
                VideoLowHDR: engineData.VideoLowHDR,
                VideoHighHDR: engineData.VideoHighHDR,
                ManifestLow: engineData.ManifestLow, // Include manifest details from engineData
                ManifestHigh: engineData.ManifestHigh,
                filename: engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "metadata", // Provide a cleaned filename based on title, default if title missing
            };
        }

        // If not in metadata-only mode, proceed with download or stream setup.
        // Clean the video title for use in the filename.
        const title = engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "untitled"; // Clean title, default if missing

        // Determine the output folder based on the 'output' option or default to the current working directory.
        const folder = output ? output : process.cwd();

        // Refactor synchronous folder existence check and creation to use asynchronous file system operations.
        try {
            // Attempt to access the specified output folder asynchronously to check if it exists and is visible.
            await fsPromises.access(folder, fs.constants.F_OK);
            if (verbose) console.log(colors.green("@info:"), `Output directory already exists: ${folder}`);
        } catch (e: any) {
            // If access fails, check if the error indicates the folder does not exist.
            if (e.code === "ENOENT") {
                if (verbose) console.log(colors.green("@info:"), `Output directory does not exist, attempting to create: ${folder}`);
                try {
                    // If the folder doesn't exist, create it asynchronously, including any necessary parent directories.
                    await fsPromises.mkdir(folder, { recursive: true });
                    if (verbose) console.log(colors.green("@info:"), `Output directory created: ${folder}`);
                } catch (mkdirError: any) {
                    // If directory creation fails, throw a specific error.
                    throw new Error(`${colors.red("@error:")} Failed to create the output directory: ${mkdirError.message}`);
                }
            } else {
                // If access failed for a reason other than 'ENOENT', re-throw the original error.
                throw new Error(`${colors.red("@error:")} Error checking output directory: ${e.message}`);
            }
        }

        // Initialize a new fluent-ffmpeg instance.
        const instance: ffmpeg.FfmpegCommand = ffmpeg();

        // Locate the required ffmpeg and ffprobe executables using the asynchronous locator function.
        try {
            const paths = await locator(); // Await the asynchronous locator function call.
            if (!paths.ffmpeg) {
                throw new Error(`${colors.red("@error:")} ffmpeg executable not found.`);
            }
            if (!paths.ffprobe) {
                throw new Error(`${colors.red("@error:")} ffprobe executable not found.`);
            }
            // Set the located paths for ffmpeg and ffprobe in the fluent-ffmpeg instance.
            instance.setFfmpegPath(paths.ffmpeg);
            instance.setFfprobePath(paths.ffprobe);
        } catch (locatorError: any) {
            // Catch and re-throw any errors that occurred during the executable location process.
            throw new Error(`${colors.red("@error:")} Failed to locate ffmpeg or ffprobe: ${locatorError.message}`);
        }

        // Select the highest quality audio stream URL.
        const hqAudioUrl = engineData.BestAudioHigh?.url; // Use BestAudioHigh for highest audio URL

        // Check if the highest quality audio URL is available.
        if (!hqAudioUrl) {
            // Use optional chaining for safer access.
            // Throw an error if the highest quality audio URL is not found.
            throw new Error(`${colors.red("@error:")} Highest quality audio URL was not found.`);
        }
        // Add the highest quality audio stream URL as the first input to FFmpeg.
        instance.addInput(hqAudioUrl);

        // Select the video stream URL based on the requested resolution.
        const resolutionWithoutP = resolution.replace("p", ""); // Remove 'p' from resolution for matching
        // Assuming ManifestHigh is an array of format objects with a 'format' property to match against resolution.
        // Find the video data object matching the requested resolution.
        const vdata = engineData.ManifestHigh?.find((i: { format?: string | string[] }) => typeof i.format === "string" && i.format.includes(resolutionWithoutP)); // Added optional chaining and type check

        // Check if video data for the specified resolution was found.
        if (!vdata) {
            // Throw an error if no video data is found for the requested resolution.
            throw new Error(`${colors.red("@error:")} No video data found for resolution: ${resolution}. Use list_formats() maybe?`);
        }

        // Check if the video URL for the specified resolution is available.
        if (!vdata.url) {
            // Assuming vdata object has a 'url' property.
            // Throw an error if the video URL is missing for the found video data.
            throw new Error(`${colors.red("@error:")} Video URL not found for resolution: ${resolution}.`);
        }
        // Add the video stream URL as the second input to FFmpeg.
        instance.addInput(vdata.url.toString()); // Convert URL to string, as per original code.

        // Set the output format for FFmpeg. Matroska (.mkv) is suitable for containing both audio and video.
        instance.withOutputFormat("matroska"); // Original code sets Matroska output format

        // Determine the final output filename and its full path.
        const filenameBase = `yt-dlx_AudioVideoCustom_${resolution}_`;
        // Clean the title again for filename safety and provide a default if the title was empty or missing.
        const cleanTitleForFilename = engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "untitled";
        let filename = `${filenameBase}${filter ? filter + "_" : ""}${cleanTitleForFilename}.mkv`; // Use .mkv extension, suitable for matroska format
        const outputPath = path.join(folder, filename);

        // Define the mapping of filter names to their corresponding FFmpeg *video* filter complex options.
        const filterMap: Record<string, string[]> = {
            grayscale: ["colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3"],
            invert: ["negate"],
            rotate90: ["rotate=PI/2"],
            rotate180: ["rotate=PI"],
            rotate270: ["rotate=3*PI/2"],
            flipHorizontal: ["hflip"],
            flipVertical: ["vflip"],
        };

        // Apply the specified video filter if a valid one is provided.
        if (filter && filterMap[filter]) {
            // Apply the video filter complex options using `withVideoFilter`.
            instance.withVideoFilter(filterMap[filter]);
        } else {
            // If no filter is applied, use the 'copy' codec option for both audio and video streams.
            // This merges the streams without re-encoding.
            instance.outputOptions("-c copy");
        }

        // Set output path if not streaming.
        if (!stream) {
            instance.output(outputPath);
        }
        // In streaming mode, the output is typically piped. The 'stream' event in the original
        // code emitted the outputPath and instance, implying the path is a reference or temporary file location.

        // Setup FFmpeg event listeners and wrap the `instance.run()` call in a Promise for async/await compatibility.
        // The Promise will resolve or reject based on the FFmpeg process completion or error.

        if (stream) {
            // Stream mode: Create a Promise that resolves when FFmpeg starts its process.
            // This signals that the video/audio stream is likely available for consumption via the FFmpeg instance.
            const streamReadyPromise = new Promise<StreamResult>((resolve, reject) => {
                // Listen for the FFmpeg 'start' event.
                instance.on("start", commandLine => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg command:", commandLine);
                    // Resolve the promise immediately upon start with stream info.
                    // Use the determined outputPath as a filename reference for the stream.
                    resolve({ filename: outputPath, ffmpeg: instance });
                });
                // Listen for FFmpeg 'progress' events (optional logging if verbose).
                instance.on("progress", async progress => {
                    if (verbose && startTime !== undefined) await progbar({ percent: progress.percent ?? 0, baseTime: startTime });
                });
                // Listen for FFmpeg 'error' events.
                instance.on("error", (error, stdout, stderr) => {
                    // Reject the promise if FFmpeg encounters an error during stream setup or processing.
                    reject(new Error(`${colors.red("@error:")} FFmpeg error during stream setup: ${error.message}\nStdout: ${stdout}\nStderr: ${stderr}`));
                });
                // In stream mode, the main promise is resolved on 'start'. The 'end' event still fires when the process finishes.
            });

            // Start the FFmpeg process.
            instance.run();

            // Await the promise that signals the stream is ready.
            return await streamReadyPromise;
        } else {
            // Download mode: Create a Promise that resolves when FFmpeg finishes the download successfully.
            const downloadCompletePromise = new Promise<DownloadResult>((resolve, reject) => {
                // Listen for the FFmpeg 'start' event (optional logging if verbose).
                instance.on("start", commandLine => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg command:", commandLine);
                });
                // Listener for FFmpeg 'progress' events (optional logging if verbose).
                instance.on("progress", async progress => {
                    if (verbose && startTime !== undefined) await progbar({ percent: progress.percent ?? 0, baseTime: startTime });
                });
                // Listener for FFmpeg 'error' events.
                instance.on("error", (error, stdout, stderr) => {
                    // Reject the promise if FFmpeg encounters an error during the download process.
                    reject(new Error(`${colors.red("@error:")} FFmpeg error during download: ${error.message}\nStdout: ${stdout}\nStderr: ${stderr}`));
                });
                // Listener for the FFmpeg 'end' event (successful completion).
                instance.on("end", () => {
                    // Resolve the promise with the output file path upon successful completion.
                    resolve(outputPath);
                });
            });

            // Start the FFmpeg process to begin the download.
            instance.run();

            // Await the promise that indicates the download process has completed successfully.
            return await downloadCompletePromise;
        }
    } catch (error: any) {
        // Catch any errors that occurred during the setup phase before FFmpeg potentially started
        // (e.g., validation errors, engine data retrieval errors, locator errors, directory creation errors).
        // Format the error message based on the error type and re-throw it to reject the main function's Promise.
        if (error instanceof ZodError) {
            // Handle Zod validation errors by formatting the error details.
            throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        } else if (error instanceof Error) {
            // Re-throw standard Error objects with their existing message.
            throw new Error(`${colors.red("@error:")} ${error.message}`);
        } else {
            // Handle any other unexpected error types by converting them to a string.
            throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
        }
        // Note: FFmpeg errors caught by the listeners attached to the instance
        // are handled by rejecting the specific promise being awaited (streamReadyPromise or downloadCompletePromise),
        // and these rejections will be caught by this outer try/catch block as exceptions.
    } finally {
        // This block executes after the try block successfully returns or the catch block throws.
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
