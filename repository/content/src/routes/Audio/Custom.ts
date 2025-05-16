import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import Tuber from "../../utils/Agent";
import * as fsPromises from "fs/promises";
import { locator } from "../../utils/locator";
const ZodSchema = z.object({
    query: z.string().min(2),
    output: z.string().optional(),
    useTor: z.boolean().optional(),
    stream: z.boolean().optional(),
    verbose: z.boolean().optional(),
    metadata: z.boolean().optional(),
    resolution: z.enum(["high", "medium", "low", "ultralow"]),
    filter: z
        .enum(["echo", "slow", "speed", "phaser", "flanger", "panning", "reverse", "vibrato", "subboost", "surround", "bassboost", "nightcore", "superslow", "vaporwave", "superspeed"])
        .optional(),
});
type MetadataResult = {
    metaData: any;
    BestAudioLow: any;
    BestAudioHigh: any;
    AudioLowDRC: any;
    AudioHighDRC: any;
    filename: string;
};
type StreamResult = {
    filename: string;
    ffmpeg: ffmpeg.FfmpegCommand;
};

type DownloadResult = string; // The output file path

// Define the union type for the async function's Promise resolution
type AudioCustomResult = MetadataResult | StreamResult | DownloadResult;

/**
 * @shortdesc Downloads, streams, or fetches metadata for audio from YouTube with custom options using async/await instead of events.
 * @description This function allows you to download, stream, or fetch metadata for audio from YouTube based on a search query or video URL using async/await.
 * It provides extensive customization options, including specifying the audio resolution, applying various audio filters, saving the output to a specified directory, using Tor for anonymity, enabling verbose logging, streaming the output, or simply fetching the metadata.
 * The function returns a Promise that resolves with the result of the operation (metadata object, stream info object, or output file path) or rejects with an error, replacing the EventEmitter pattern.
 *
 * @param options - An object containing the configuration options validated by ZodSchema.
 * @param options.query - The search query or video URL. **Required**.
 * @param {string} [options.output] - The directory where the output audio file should be saved. Not allowed when `metadata` is true.
 * @param {boolean} [options.useTor] - Whether to attempt to use Tor for the network requests.
 * @param {boolean} [options.stream] - If true, the audio will be processed for streaming instead of saved to a file. Not allowed when `metadata` is true. When streaming, the Promise resolves when FFmpeg starts with an object containing the filename (output path) and the FFmpeg instance.
 * @param {boolean} [options.verbose] - If true, enables detailed logging to the console, including FFmpeg command and progress.
 * @param {boolean} [options.metadata] - If true, the function will only fetch metadata. Not allowed with `output`, `stream`, or `filter`. The Promise resolves with a metadata object.
 * @param {("high" | "medium" | "low" | "ultralow")} options.resolution - The desired audio resolution or quality. Mandatory parameter.
 * @param {("echo" | "slow" | "speed" | "phaser" | "flanger" | "panning" | "reverse" | "vibrato" | "subboost | "surround" | "bassboost" | "nightcore" | "superslow" | "vaporwave" | "superspeed")} [options.filter] - An audio filter to apply. Ignored when `metadata` is true.
 *
 * @returns {Promise<AudioCustomResult>} A Promise that resolves based on the operation mode:
 * - If `metadata` is true: Resolves with a `MetadataResult` object.
 * - If `stream` is true (and `metadata` is false): Resolves with a `StreamResult` object when FFmpeg starts.
 * - If downloading (neither `metadata` nor `stream` is true): Resolves with the `DownloadResult` string (the output file path) when FFmpeg finishes successfully.
 * @throws {Error} Throws a formatted error if argument validation fails (ZodError), if the engine fails to retrieve data, if required metadata or formats are missing, if directory creation fails, if FFmpeg/FFprobe executables are not found, or if FFmpeg encounters an error during processing.
 */
export default async function AudioCustom({ query, output, useTor, stream, filter, verbose, metadata, resolution }: z.infer<typeof ZodSchema>): Promise<AudioCustomResult> {
    // Refactored to use async/await and return a Promise directly
    try {
        // Perform initial validation checks before Zod parse for clearer messages on common errors
        if (!query) {
            // Throw error instead of emitting
            throw new Error(`${colors.red("@error:")} The 'query' parameter is required.`);
        }
        // Validate parameter combinations when metadata is true
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
        // Validate that resolution is provided (although Zod covers this too)
        if (!resolution) {
            // Throw error instead of emitting
            throw new Error(`${colors.red("@error:")} The 'resolution' parameter is required.`);
        }

        // Perform Zod schema validation. This call is synchronous and will throw ZodError on failure.
        ZodSchema.parse({ query, output, useTor, stream, filter, verbose, metadata, resolution });

        // Await the asynchronous call to the Agent (Tuber) to get engine data
        const engineData = await Tuber({ query, verbose, useTor });

        // Check if engine data was successfully retrieved
        if (!engineData) {
            // Throw error if engine returns no data
            throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        }

        // Check if metadata is present in the engine response
        if (!engineData.metaData) {
            // Throw error if metadata is missing
            throw new Error(`${colors.red("@error:")} Metadata was not found in the engine's response.`);
        }

        // Handle the metadata-only case
        if (metadata) {
            // Return the metadata object directly (wrapped in Promise.resolve() by async function)
            return {
                metaData: engineData.metaData,
                BestAudioLow: engineData.BestAudioLow,
                BestAudioHigh: engineData.BestAudioHigh,
                AudioLowDRC: engineData.AudioLowDRC,
                AudioHighDRC: engineData.AudioHighDRC,
                filename: engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "metadata", // Clean title for filename, default if missing
            };
        }

        // If not in metadata-only mode, proceed with download or stream setup
        const title = engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "untitled"; // Clean title, default if missing
        const folder = output ? output : process.cwd(); // Determine output folder

        // Refactor synchronous folder existence check and creation to use async/await
        try {
            // Attempt to access the folder asynchronously
            await fsPromises.access(folder, fs.constants.F_OK); // Check if the folder exists
            if (verbose) console.log(colors.green("@info:"), `Output directory already exists: ${folder}`);
        } catch (e: any) {
            // If access fails, check if it's because the folder doesn't exist
            if (e.code === "ENOENT") {
                if (verbose) console.log(colors.green("@info:"), `Output directory does not exist, attempting to create: ${folder}`);
                try {
                    // Create the folder asynchronously, including parent directories
                    await fsPromises.mkdir(folder, { recursive: true });
                    if (verbose) console.log(colors.green("@info:"), `Output directory created: ${folder}`);
                } catch (mkdirError: any) {
                    // If directory creation fails, throw an error
                    throw new Error(`${colors.red("@error:")} Failed to create the output directory: ${mkdirError.message}`);
                }
            } else {
                // If access failed for another reason, re-throw the error
                throw new Error(`${colors.red("@error:")} Error checking output directory: ${e.message}`);
            }
        }

        // Initialize fluent-ffmpeg instance
        const instance: ffmpeg.FfmpegCommand = ffmpeg();

        // Locate ffmpeg and ffprobe executables using async/await
        try {
            const paths = await locator(); // Await the async locator function
            if (!paths.ffmpeg) {
                // Throw error if ffmpeg not found
                throw new Error(`${colors.red("@error:")} ffmpeg executable not found.`);
            }
            if (!paths.ffprobe) {
                // Throw error if ffprobe not found
                throw new Error(`${colors.red("@error:")} ffprobe executable not found.`);
            }
            // Set the paths for ffmpeg and ffprobe in the fluent-ffmpeg instance
            instance.setFfmpegPath(paths.ffmpeg);
            instance.setFfprobePath(paths.ffprobe);
        } catch (locatorError: any) {
            // Catch and re-throw errors from the locator function
            throw new Error(`${colors.red("@error:")} Failed to locate ffmpeg or ffprobe: ${locatorError.message}`);
        }

        // Find the appropriate audio format based on the requested resolution
        const resolutionFilter = resolution.replace("p", ""); // Remove 'p' if present (though resolutions are 'high', 'medium', etc.)
        // Assuming AudioHigh is an array of format objects with a 'format' property to match against resolution
        // The original code searched for the resolutionFilter within the format string.
        const adata = engineData.AudioHigh?.find((i: { format?: string | string[] }) => typeof i.format === "string" && i.format.includes(resolutionFilter)); // Added optional chaining and type check

        // Check if a suitable audio format was found
        if (!adata) {
            // Throw error if no matching audio data is found
            throw new Error(`${colors.red("@error:")} No audio data found for the specified resolution: ${resolution}. Please use the 'list_formats()' command to see available formats.`);
        }

        // Check if the thumbnail URL is present
        if (!engineData.metaData.thumbnail) {
            // Throw error if thumbnail URL is missing
            throw new Error(`${colors.red("@error:")} The thumbnail URL was not found.`);
        }
        // Add thumbnail input to FFmpeg (often used for cover art in audio files)
        instance.addInput(engineData.metaData.thumbnail);

        // Set the output format (original used 'avi', which is odd for audio-only)
        // Preserving original, potentially flawed, logic for format.
        instance.withOutputFormat("avi"); // Original code sets AVI output format

        // Check if the audio URL is present
        if (!adata.url) {
            // Throw error if audio URL is missing
            throw new Error(`${colors.red("@error:")} The audio URL was not found.`);
        }
        // Add the audio stream input to FFmpeg
        instance.addInput(adata.url);

        // Determine output filename and path
        // Preserving the original filename structure and '.avi' extension
        const filenameBase = `yt-dlx_AudioCustom_${resolution}_`;
        // Clean the title again just in case the engine returned one that wasn't perfectly cleaned, or title was missing before.
        const cleanTitleForFilename = engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "untitled";
        let filename = `${filenameBase}${filter ? filter + "_" : ""}${cleanTitleForFilename}.avi`; // Original used .avi extension
        const outputPath = path.join(folder, filename);

        // Define the audio filter map
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

        // Apply audio filter if specified and valid
        if (filter && filterMap[filter]) {
            // Apply audio filter (corrected from original withVideoFilter which was likely a bug)
            instance.withAudioFilter(filterMap[filter]);
        } else {
            // If no filter, use copy codec options (preserving original logic)
            // Note: Using '-c copy' with an AVI container and typical web audio codecs might not work reliably.
            instance.outputOptions("-c copy");
        }

        // Set output path if not streaming
        if (!stream) {
            instance.output(outputPath);
        }
        // If streaming, the output destination is handled by fluent-ffmpeg internally or by piping.
        // The 'stream' event in the original code emitted the outputPath, potentially as a reference.

        // Setup event listeners and wrap the FFmpeg run process in a Promise for async/await
        // Use different promise setups for stream and download modes

        if (stream) {
            // Stream mode: Create a Promise that resolves when FFmpeg starts and is ready for streaming.
            // The caller will receive the FFmpeg instance to pipe its output.
            const streamReadyPromise = new Promise<StreamResult>((resolve, reject) => {
                // Listener for FFmpeg start event
                instance.on("start", commandLine => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg command:", commandLine);
                    // Resolve the promise immediately upon start with stream info
                    // Use outputPath as the filename reference as in the original stream event
                    resolve({ filename: outputPath, ffmpeg: instance });
                });
                // Listener for FFmpeg progress events (optional logging)
                instance.on("progress", progress => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg progress:", progress);
                });
                // Listener for FFmpeg error events
                instance.on("error", (error, stdout, stderr) => {
                    // Reject the promise if FFmpeg encounters an error during stream setup
                    reject(new Error(`${colors.red("@error:")} FFmpeg error during stream setup: ${error.message}\nStdout: ${stdout}\nStderr: ${stderr}`));
                });
                // The 'end' event will still fire when the FFmpeg process exits,
                // but the main promise in stream mode is resolved on 'start'.
            });

            // Start the FFmpeg process
            instance.run();

            // Await the promise that signals the stream is ready
            return await streamReadyPromise;
        } else {
            // Download mode: Create a Promise that resolves when FFmpeg finishes the download successfully.
            const downloadCompletePromise = new Promise<DownloadResult>((resolve, reject) => {
                // Listener for FFmpeg start event (optional logging)
                instance.on("start", commandLine => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg command:", commandLine);
                });
                // Listener for FFmpeg progress events (optional logging)
                instance.on("progress", progress => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg progress:", progress);
                });
                // Listener for FFmpeg error events
                instance.on("error", (error, stdout, stderr) => {
                    // Reject the promise if FFmpeg encounters an error during download
                    reject(new Error(`${colors.red("@error:")} FFmpeg error during download: ${error.message}\nStdout: ${stdout}\nStderr: ${stderr}`));
                });
                // Listener for FFmpeg end event (successful completion)
                instance.on("end", () => {
                    // Resolve the promise with the output path on successful completion
                    resolve(outputPath);
                });
            });

            // Start the FFmpeg process
            instance.run();

            // Await the promise that signals the download is complete
            return await downloadCompletePromise;
        }
    } catch (error: any) {
        // Catch errors that occurred before FFmpeg started (validation, engine, locator, directory creation)
        // Format and re-throw the error to reject the main function's Promise
        if (error instanceof ZodError) {
            // Handle Zod validation errors by formatting the error details
            throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        } else if (error instanceof Error) {
            // Re-throw standard Error objects with the existing message
            throw new Error(`${colors.red("@error:")} ${error.message}`);
        } else {
            // Handle any other unexpected error types by converting to a string
            throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
        }
        // Note: FFmpeg errors caught by the listeners attached to the instance
        // are handled by rejecting the specific promise being awaited (streamReadyPromise or downloadCompletePromise),
        // which then propagates as an exception caught by this outer try/catch block.
    } finally {
        // This block executes after the try block completes (returns) or the catch block throws
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
