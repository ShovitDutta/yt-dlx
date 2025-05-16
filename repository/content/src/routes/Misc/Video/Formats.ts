import colors from "colors";
import { z, ZodError } from "zod";
// import { EventEmitter } from "events"; // Removed EventEmitter import as we are refactoring to async/await
import Tuber from "../../../utils/Agent"; // Assuming Tuber is refactored and returns Promise<EngineOutput | null> or throws
import { EngineOutput } from "../../../utils/Engine";

// Define the Zod schema for input validation
const ZodSchema = z.object({ query: z.string().min(2), verbose: z.boolean().optional() }); // Mandatory query, min 2 characters, optional verbose

// Define the interface for the format details included in the result
interface FormatDetails {
    format?: string;
    tbr?: number;
    filesizeP?: number; // Keep as number | undefined
    format_note?: string;
}

// Define the interface for the comprehensive format listing result
export interface VideoFormatsResult {
    ManifestLow: FormatDetails[];
    ManifestHigh: FormatDetails[];
    AudioLow: FormatDetails[];
    VideoLow: FormatDetails[];
    VideoHigh: FormatDetails[];
    AudioHigh: FormatDetails[];
    VideoLowHDR: FormatDetails[];
    AudioLowDRC: FormatDetails[];
    AudioHighDRC: FormatDetails[];
    VideoHighHDR: FormatDetails[];
}

/**
 * @shortdesc Lists available audio and video formats for a YouTube video using async/await instead of events.
 *
 * @description This function retrieves and provides a detailed list of all available audio and video formats for a given YouTube video, specified by a search query or URL, using async/await. It queries the engine to get format information, including details like format type, bitrate (tbr), filesize, and format notes. Optional verbose logging can be enabled.
 *
 * The function requires a search query or video URL and returns a Promise that resolves with an object containing arrays of format details upon success, or rejects with an error.
 *
 * @param options - An object containing the configuration options validated by ZodSchema.
 * @param {string} options.query - The search query or video URL. **Required**, minimum length is 2 characters.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 *
 * @returns {Promise<VideoFormatsResult>} A Promise that resolves with an object containing categorized format details upon successful fetching.
 * @throws {Error} Throws a formatted error if argument validation fails (ZodError), if the engine response is null/undefined, or if other unexpected errors occur.
 */
export default async function list_formats({ query, verbose }: z.infer<typeof ZodSchema>): Promise<VideoFormatsResult> {
    // Refactored to use async/await and return a Promise directly, replacing EventEmitter pattern.
    try {
        // Perform Zod schema validation on the provided options. This call is synchronous.
        // It will throw a ZodError if validation fails based on the defined schema.
        ZodSchema.parse({ query, verbose });

        // Await the asynchronous call to Tuber (Agent) to get format information.
        // Assuming Tuber returns Promise<EngineOutput | null> or throws.
        const metaBody: EngineOutput | null = await Tuber({ query, verbose });

        // Check if Tuber returned data.
        if (!metaBody) {
            // If Tuber returned null, throw a critical error.
            throw new Error(`${colors.red("@error:")} Unable to get response from YouTube.`);
        }

        // Helper function to safely convert filesizeP to number or undefined
        const safeFilesizeP = (value: any): number | undefined => {
            if (typeof value === "number") {
                return value;
            }
            if (typeof value === "string") {
                const parsed = parseFloat(value);
                // Check if parsing resulted in a valid number
                if (!isNaN(parsed)) {
                    return parsed;
                }
            }
            // Return undefined if the value is not a number and cannot be parsed as one
            return undefined;
        };

        // Structure the output object by mapping relevant properties from the engine response arrays.
        // Use optional chaining and default to empty arrays if the source arrays are null or undefined.
        const formatsResult: VideoFormatsResult = {
            ManifestLow: metaBody.ManifestLow?.map(item => ({ format: item.format, tbr: item.tbr })) || [],
            ManifestHigh: metaBody.ManifestHigh?.map(item => ({ format: item.format, tbr: item.tbr })) || [],
            // Apply safeFilesizeP conversion during mapping for the arrays where filesizeP is used
            AudioLow: metaBody.AudioLow?.map(item => ({ filesizeP: safeFilesizeP(item.filesizeP), format_note: item.format_note })) || [],
            VideoLow: metaBody.VideoLow?.map(item => ({ filesizeP: safeFilesizeP(item.filesizeP), format_note: item.format_note })) || [],
            VideoHigh: metaBody.VideoHigh?.map(item => ({ filesizeP: safeFilesizeP(item.filesizeP), format_note: item.format_note })) || [],
            AudioHigh: metaBody.AudioHigh?.map(item => ({ filesizeP: safeFilesizeP(item.filesizeP), format_note: item.format_note })) || [],
            VideoLowHDR: metaBody.VideoLowHDR?.map(item => ({ filesizeP: safeFilesizeP(item.filesizeP), format_note: item.format_note })) || [],
            AudioLowDRC: metaBody.AudioLowDRC?.map(item => ({ filesizeP: safeFilesizeP(item.filesizeP), format_note: item.format_note })) || [],
            AudioHighDRC: metaBody.AudioHighDRC?.map(item => ({ filesizeP: safeFilesizeP(item.filesizeP), format_note: item.format_note })) || [],
            VideoHighHDR: metaBody.VideoHighHDR?.map(item => ({ filesizeP: safeFilesizeP(item.filesizeP), format_note: item.format_note })) || [],
        };

        // If successful, return the structured formats object. The async function automatically wraps this in a resolved Promise.
        return formatsResult;
    } catch (error: any) {
        // Catch any critical errors that occurred during the process (Zod validation, Tuber failure).
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
    } finally {
        // This block executes after the try block successfully returns or the catch block throws.
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
