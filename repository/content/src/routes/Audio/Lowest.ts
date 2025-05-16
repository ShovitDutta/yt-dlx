import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import Agent from "../../utils/Agent";
import * as fsPromises from "fs/promises";
import { locator } from "../../utils/locator";

// Define the Zod schema for input validation for AudioLowest
// Note: This schema does NOT include a 'resolution' parameter, as Lowest quality is automatic.
var ZodSchema = z.object({
    query: z.string().min(2), // Mandatory query
    output: z.string().optional(), // Optional output directory
    useTor: z.boolean().optional(), // Optional Tor usage flag
    stream: z.boolean().optional(), // Optional streaming flag
    verbose: z.boolean().optional(), // Optional verbose logging flag
    metadata: z.boolean().optional(), // Optional metadata-only flag
    filter: z // Optional audio filter
        .enum(["echo", "slow", "speed", "phaser", "flanger", "panning", "reverse", "vibrato", "subboost", "surround", "bassboost", "nightcore", "superslow", "vaporwave", "superspeed"])
        .optional(),
});

// Define types for the possible return values based on flags (similar to AudioHighest)
type MetadataResult = {
    metaData: any;
    BestAudioLow: any; // Details for the lowest quality audio format found by the engine
    AudioLowDRC: any; // Details for the lowest quality audio with DRC found by the engine
    filename: string; // Cleaned filename based on video title
};

type StreamResult = {
    filename: string; // Output path used as filename reference for streaming
    ffmpeg: ffmpeg.FfmpegCommand; // The FFmpeg instance for piping/handling the stream
};

type DownloadResult = string; // The output file path where the audio was saved

// Define the union type for the async function's Promise resolution
type AudioLowestResult = MetadataResult | StreamResult | DownloadResult;

/**
 * @shortdesc Downloads, streams, or fetches metadata for the lowest quality audio from YouTube using async/await instead of events.
 *
 * @description This function allows you to download, stream, or fetch metadata for the lowest available audio quality from YouTube based on a search query or video URL using async/await.
 * It provides customization options such as saving the output to a specified directory, using Tor for anonymity, enabling verbose logging, streaming the output, or simply fetching the metadata. Audio filters can also be applied.
 * The function automatically selects the lowest quality audio format available based on the engine's results.
 * It returns a Promise that resolves with the result of the operation (metadata object, stream info object, or output file path) or rejects with an error, replacing the EventEmitter pattern.
 *
 * @param options - An object containing the configuration options validated by ZodSchema.
 * @param options.query - The search query or video URL. **Required**.
 * @param {string} [options.output] - The directory where the output audio file should be saved. Not allowed when `metadata` is true.
 * @param {boolean} [options.useTor] - Whether to attempt to use Tor for the network requests.
 * @param {boolean} [options.stream] - If true, the audio will be processed for streaming instead of saved to a file. Not allowed when `metadata` is true. When streaming, the Promise resolves when FFmpeg starts with an object containing the filename (output path reference) and the FFmpeg instance.
 * @param {boolean} [options.verbose] - If true, enables detailed logging to the console, including FFmpeg command and progress.
 * @param {boolean} [options.metadata] - If true, the function will only fetch metadata without processing audio. Not allowed with `output`, `stream`, or `filter`. The Promise resolves with a `MetadataResult` object.
 * @param {("echo" | "slow" | "speed" | "phaser" | "flanger" | "panning" | "reverse" | "vibrato" | "subboost" | "surround" | "bassboost" | "nightcore" | "superslow" | "vaporwave" | "superspeed")} [options.filter] - An audio filter to apply. Ignored when `metadata` is true.
 *
 * @returns {Promise<AudioLowestResult>} A Promise that resolves based on the operation mode:
 * - If `metadata` is true: Resolves with a `MetadataResult` object.
 * - If `stream` is true (and `metadata` is false): Resolves with a `StreamResult` object when FFmpeg starts.
 * - If downloading (neither `metadata` nor `stream` is true): Resolves with the `DownloadResult` string (the output file path) when FFmpeg finishes successfully.
 * @throws {Error} Throws a formatted error if argument validation fails (ZodError), if the engine fails to retrieve data, if required metadata or formats are missing, if directory creation fails, if FFmpeg/FFprobe executables are not found, or if FFmpeg encounters an error during processing.
 *
 * @example
 * // 1. Download the lowest quality audio using async/await syntax with try...catch
 * const query = "some video or query";
 * try {
 * const outputPath = await YouTubeDLX.Audio.Lowest({ query });
 * console.log("Download finished:", outputPath);
 * } catch (error) {
 * console.error("Error during download:", error);
 * }
 *
 * @example
 * // 2. Stream the lowest quality audio with verbose logging using async/await
 * const query = "another video or query";
 * try {
 * const streamInfo = await YouTubeDLX.Audio.Lowest({ query, stream: true, verbose: true });
 * console.log("Stream available:", streamInfo.filename);
 * // Use streamInfo.ffmpeg for piping, e.g., streamInfo.ffmpeg.pipe(myWritableStream);
 * // Remember to handle the end and error events on the ffmpeg instance for stream cleanup if necessary.
 * } catch (error) {
 * console.error("Error during streaming setup:", error);
 * }
 *
 * @example
 * // 3. Fetch only metadata for the lowest quality audio using async/await
 * const query = "metadata test";
 * try {
 * const metadata = await YouTubeDLX.Audio.Lowest({ query, metadata: true });
 * console.log("Metadata:", metadata);
 * console.log("Lowest audio format details:", metadata.BestAudioLow);
 * } catch (error) {
 * console.error("Error fetching metadata:", error);
 * }
 *
 * @example
 * // 4. Download lowest quality audio with a filter and custom output directory using async/await
 * const query = "video with filter";
 * try {
 * const outputPath = await YouTubeDLX.Audio.Lowest({ query, output: "./filtered_audio_out", filter: "bassboost" });
 * console.log("Filtered download finished:", outputPath);
 * } catch (error) {
 * console.error("Error during filtered download:", error);
 * }
 *
 * // Note: Original examples using .on(...) are replaced by standard Promise handling (.then/.catch or await with try/catch).
 */
export default async function AudioLowest({ query, output, useTor, stream, filter, metadata, verbose }: z.infer<typeof ZodSchema>): Promise<AudioLowestResult> {
    // Refactored to use async/await and return a Promise directly, replacing EventEmitter pattern.
    try {
        // Perform initial validation checks before Zod parse for clearer messages on common requirement errors.
        if (!query) {
            throw new Error(`${colors.red("@error:")} The 'query' parameter is always required.`);
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
        ZodSchema.parse({ query, output, useTor, stream, filter, metadata, verbose });

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
                BestAudioLow: engineData.BestAudioLow, // Include the lowest audio format details as per original metadata output
                AudioLowDRC: engineData.AudioLowDRC, // Include lowest audio with DRC details
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

        // Select the lowest quality audio format found by the engine based on 'BestAudioLow'.
        const lqAudio = engineData.BestAudioLow; // Use BestAudioLow as per original code

        // Check if the lowest quality audio format object exists and has a URL.
        if (!lqAudio?.url) {
            // Use optional chaining for safer access.
            // Throw an error if the lowest quality audio URL is not found.
            throw new Error(`${colors.red("@error:")} Lowest quality audio URL was not found.`);
        }
        // Add the URL of the lowest quality audio stream as an input to FFmpeg.
        instance.addInput(lqAudio.url);

        // Check if the thumbnail URL is present, often used for embedding album art.
        if (!engineData.metaData.thumbnail) {
            // Throw an error if the thumbnail URL is missing.
            throw new Error(`${colors.red("@error:")} Thumbnail URL was not found.`);
        }
        // Add thumbnail input to FFmpeg (often used for cover art in audio files)
        instance.addInput(engineData.metaData.thumbnail);

        // Set the output format for FFmpeg.
        // Note: The original code sets the output format to "avi", which is primarily a video container
        // and might be an incorrect choice for audio-only output. Preserving this original logic for refactoring.
        instance.withOutputFormat("avi"); // Original code sets AVI output format.

        // Determine the final output filename and its full path.
        // Preserving the original filename structure which includes the filter name if applied, and the '.avi' extension.
        const filenameBase = `yt-dlx_AudioLowest_`;
        // Clean the title again for filename safety and provide a default if the title was empty or missing.
        const cleanTitleForFilename = engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "untitled";
        let filename = `${filenameBase}${filter ? filter + "_" : ""}${cleanTitleForFilename}.avi`; // Original used .avi extension.
        const outputPath = path.join(folder, filename);

        // Define the mapping of filter names to their corresponding FFmpeg audio filter complex options.
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

        // Apply the specified audio filter if a valid one is provided.
        if (filter && filterMap[filter]) {
            // Apply the audio filter complex options.
            // Note: Correcting from the original `withVideoFilter` which was likely incorrect for audio filters.
            instance.withAudioFilter(filterMap[filter]);
        } else {
            // If no filter is applied, use the 'copy' codec option.
            // Note: Using '-c copy' might fail if the input audio codec is not compatible with the output container (AVI).
            // This preserves the original logic, which might have implicit requirements or be flawed.
            instance.outputOptions("-c copy");
        }

        // Set output path if not streaming
        if (!stream) {
            instance.output(outputPath);
        }
        // In streaming mode, the output destination is handled by fluent-ffmpeg internally or by piping.
        // The 'stream' event in the original code emitted the outputPath, potentially as a reference.

        // Setup FFmpeg event listeners and wrap the `instance.run()` call in a Promise for async/await compatibility.
        // The Promise will resolve or reject based on the FFmpeg process completion or error.

        if (stream) {
            // Stream mode: Create a Promise that resolves when FFmpeg starts its process.
            // This signals that the audio stream is likely available for consumption via the FFmpeg instance.
            const streamReadyPromise = new Promise<StreamResult>((resolve, reject) => {
                // Listener for FFmpeg 'start' event
                instance.on("start", commandLine => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg command:", commandLine);
                    // Resolve the promise immediately upon start with stream info
                    // Use outputPath as the filename reference as in the original stream event
                    resolve({ filename: outputPath, ffmpeg: instance });
                });
                // Listener for FFmpeg 'progress' events (optional logging if verbose)
                instance.on("progress", progress => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg progress:", progress);
                });
                // Listener for FFmpeg 'error' events
                instance.on("error", (error, stdout, stderr) => {
                    // Reject the promise if FFmpeg encounters an error during stream setup or processing.
                    reject(new Error(`${colors.red("@error:")} FFmpeg error during stream setup: ${error.message}\nStdout: ${stdout}\nStderr: ${stderr}`));
                });
                // In stream mode, the main promise is resolved on 'start'. The 'end' event still fires when the process finishes.
            });

            // Start the FFmpeg process.
            instance.run();

            // Await the promise that signals the stream is ready
            return await streamReadyPromise;
        } else {
            // Download mode: Create a Promise that resolves when FFmpeg finishes the download successfully.
            const downloadCompletePromise = new Promise<DownloadResult>((resolve, reject) => {
                // Listener for FFmpeg 'start' event (optional logging if verbose).
                instance.on("start", commandLine => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg command:", commandLine);
                });
                // Listener for FFmpeg 'progress' events (optional logging if verbose).
                instance.on("progress", progress => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg progress:", progress);
                });
                // Listener for FFmpeg 'error' events
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
