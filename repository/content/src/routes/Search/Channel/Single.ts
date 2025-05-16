import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei"; // Assuming 'youtubei' provides a 'Client' class
// import { EventEmitter } from "events"; // Remove EventEmitter import as we are refactoring to async/await

// Define the Zod schema for input validation
const ZodSchema = z.object({ channelLink: z.string().min(2) }); // Mandatory channel link/ID, min 2 characters

/**
 * @shortdesc Fetches data for a single YouTube channel using async/await instead of events.
 *
 * @description This function retrieves detailed information about a specific YouTube channel using its link or ID. It utilizes the 'youtubei' library to interact with the YouTube API via async/await.
 *
 * The function requires the link or ID of the YouTube channel you want to fetch data for and returns a Promise that resolves with the channel data or rejects with an error. The resolved data is the raw object returned by the underlying `youtubei` library's `getChannel` method.
 *
 * @param options - An object containing the configuration options validated by ZodSchema.
 * @param {string} options.channelLink - The link or ID of the YouTube channel. **Required**, minimum length is 2 characters.
 *
 * @returns {Promise<any>} A Promise that resolves with the raw channel data object upon success.
 * @throws {Error} Throws a formatted error if argument validation fails (ZodError), if fetching channel data fails (e.g., channel not found or API error), or if other unexpected errors occur.
 */
export default async function channel_data({ channelLink }: z.infer<typeof ZodSchema>): Promise<any> {
    // Refactored to use async/await and return a Promise directly, replacing EventEmitter pattern.
    try {
        // Perform Zod schema validation on the provided options. This call is synchronous.
        // It will throw a ZodError if validation fails based on the defined schema.
        ZodSchema.parse({ channelLink });

        // Initialize youtubei client
        const youtube = new Client(); // Assuming Client constructor is synchronous

        // Perform the asynchronous call to get channel data by link or ID
        // Assuming youtube.getChannel returns a Promise<Channel | null>
        const channelData: any = await youtube.getChannel(channelLink);

        // Check if channel data was successfully retrieved
        if (!channelData) {
            // If getChannel returns null or undefined, throw an error
            throw new Error(`${colors.red("@error: ")} Unable to fetch channel data for the provided link.`);
        }

        // If successful, return the raw channel data object. The async function wraps this in a resolved Promise.
        return channelData;
    } catch (error: any) {
        // Catch any errors that occurred during the process (Zod validation, getChannel failure).
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
