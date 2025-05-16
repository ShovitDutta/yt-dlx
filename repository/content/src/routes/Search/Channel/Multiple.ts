import colors from "colors";
import { Client } from "youtubei"; // Assuming 'youtubei' provides a 'Client' class
import { z, ZodError } from "zod";
// import { EventEmitter } from "events"; // Remove EventEmitter import as we are refactoring to async/await

// Define the Zod schema for input validation
const ZodSchema = z.object({ query: z.string().min(2) }); // Mandatory query, min 2 characters

// Define the interface for the channel search result items
export interface channelSearchType {
    id: string;
    name: string;
    subscriberCount: number | null; // Subscriber count can be null
    description: string | null; // Description can be null
    thumbnails: { url: string; width: number; height: number }[]; // Assuming thumbnail structure
}

// Helper function to search for channels using youtubei
// Refactored to not take emitter and throw errors or return array directly
async function searchChannelsHelper({ query }: { query: string }): Promise<channelSearchType[]> {
    try {
        const youtube = new Client(); // Assuming Client constructor is synchronous
        // Assuming Youtube returns a Promise<SearchResults> where SearchResults has an 'items' array of channel objects
        const searchResults = await youtube.search(query, { type: "channel" });

        // Map the search results to the desired channelSearchType structure
        const result: channelSearchType[] = searchResults.items
            .filter((item: any) => item.type === "channel") // Ensure only channel items are processed
            .map((item: any) => ({
                id: item.id,
                name: item.name, // Assuming property name is 'name'
                subscriberCount: item.subscriberCount || null, // Assuming subscriberCount is a number or null
                description: item.description || null, // Assuming description is a string or null
                thumbnails:
                    item.thumbnails?.map((thumb: { url: string; width: number; height: number }) => ({
                        // Map thumbnail objects
                        url: thumb.url,
                        width: thumb.width,
                        height: thumb.height,
                    })) || [], // Default to empty array if thumbnails missing
                // Note: Original interface included 'description' which might be null/undefined
                // Note: Original interface mapped thumbnails to string[] but youtubei provides objects, mapping to object array for clarity.
            }));

        return result; // Return the array of channels
    } catch (error: any) {
        // Catch any errors during the search and re-throw with context
        // Removed console.error and returning empty array from original helper
        throw new Error(`${colors.red("@error: ")} Youtube failed: ${error.message}`);
    }
}

/**
 * @shortdesc Searches for YouTube channels based on a query using async/await instead of events.
 *
 * @description This function searches YouTube for channels matching the provided query string using async/await. It returns a Promise that will resolve with the search results or reject with an error if the search fails or no channels are found.
 *
 * The function requires a search query and returns a Promise that resolves with an array of channel objects, or rejects with an error.
 *
 * @param options - An object containing the configuration options.
 * @param {string} options.query - The search query for channels. **Required**. Minimum length is 2 characters.
 *
 * @returns {Promise<channelSearchType[]>} A Promise that resolves with an array of channel objects upon success.
 * @throws {Error} Throws a formatted error if argument validation fails (ZodError), if the search request fails, or if no channels are found for the query.
 *
 * @example
 * // 1. Search for channels with a query using async/await with try...catch
 * const query = "programming tutorials";
 * try {
 * const channels = await YouTubeDLX.Search.Channel.Multiple({ query });
 * console.log("Found channels:");
 * channels.forEach(channel => console.log(`- ${channel.name} (${channel.id})`));
 * } catch (error) {
 * console.error("Error searching channels:", error);
 * }
 *
 * @example
 * // 2. Handle missing required 'query' parameter with async/await
 * try {
 * const channels = await YouTubeDLX.Search.Channel.Multiple({} as any);
 * console.log("Found channels:", channels); // This line won't be reached
 * } catch (error) {
 * console.error("Expected Error (missing query):", error.message); // Catches the thrown ZodError
 * }
 *
 * @example
 * // 3. Handle query parameter that is too short with async/await
 * const query = "a";
 * try {
 * const channels = await YouTubeDLX.Search.Channel.Multiple({ query });
 * console.log("Found channels:", channels); // This line won't be reached
 * } catch (error) {
 * console.error("Expected Error (query too short):", error.message); // Catches the thrown ZodError
 * }
 *
 * @example
 * // 4. Handle query that returns no channels with async/await
 * const query = "asdfghjklzxcvbnm1234567890qwer"; // Query unlikely to match channels
 * try {
 * const channels = await YouTubeDLX.Search.Channel.Multiple({ query });
 * console.log("Found channels:", channels); // This line won't be reached
 * } catch (error) {
 * console.error("Expected Error (no channels found):", error.message); // Catches the thrown error
 * }
 *
 * // Note: Original examples using .on(...) are replaced by standard Promise handling (.then/.catch or await with try/catch).
 */
export default async function search_channels({ query }: z.infer<typeof ZodSchema>): Promise<channelSearchType[]> {
    // Refactored to use async/await and return a Promise directly, replacing EventEmitter pattern.
    try {
        // Perform Zod schema validation on the provided options. This call is synchronous.
        // It will throw a ZodError if validation fails based on the defined schema.
        ZodSchema.parse({ query });

        // Await the asynchronous call to the refactored searchChannelsHelper function.
        // This helper now throws errors or returns the array directly.
        const channels: channelSearchType[] = await searchChannelsHelper({ query });

        // Check if the search returned any results.
        if (!channels || channels.length === 0) {
            // If no channels were found, throw an error.
            throw new Error(`${colors.red("@error: ")} No channels found for the provided query.`);
        }

        // If successful and channels are found, return the array of channels. The async function wraps this in a resolved Promise.
        return channels;
    } catch (error: any) {
        // Catch any errors that occurred during the process (Zod validation, search failure, no results).
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
