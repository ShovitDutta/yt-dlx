import colors from "colors";
import { Client } from "youtubei"; // Assuming 'youtubei' provides a 'Client' class
import { z, ZodError } from "zod";
// import { EventEmitter } from "events"; // Remove EventEmitter import as we are refactoring to async/await
import YouTubeID from "../../../utils/YouTubeId"; // Assuming YouTubeID helper function exists and returns Promise<string | null>

// Define the Zod schema for input validation
const ZodSchema = z.object({ playlistLink: z.string().min(2) }); // Parameter name is 'playlistLink' but used as search query

// Define the interface for the playlist search result items
export interface searchPlaylistsType {
    id: string;
    title: string;
    videoCount: number;
    thumbnails: { url: string; width: number; height: number }[]; // Assuming thumbnail structure
}

// Helper function to search for playlists using youtubei
// Refactored to not take emitter and throw errors or return array directly
async function searchPlaylistsHelper({ query }: { query: string }): Promise<searchPlaylistsType[]> {
    try {
        const youtube = new Client(); // Assuming Client constructor is synchronous
        // Assuming Youtube returns a Promise<SearchResults> where SearchResults has an 'items' array of playlist objects
        const searchResults = await youtube.search(query, { type: "playlist" });

        // Map the search results to the desired searchPlaylistsType structure
        const result: searchPlaylistsType[] = searchResults.items
            .filter((item: any) => item.type === "playlist") // Ensure only playlist items are processed
            .map((item: any) => ({
                id: item.id,
                title: item.title,
                videoCount: item.videoCount,
                thumbnails:
                    item.thumbnails?.map((thumb: { url: string; width: number; height: number }) => ({
                        // Map thumbnail objects
                        url: thumb.url,
                        width: thumb.width,
                        height: thumb.height,
                    })) || [], // Default to empty array if thumbnails missing
            }));

        return result; // Return the array of playlists
    } catch (error: any) {
        // Catch any errors during the search and re-throw with context
        throw new Error(`${colors.red("@error: ")} Youtube failed: ${error.message}`);
    }
}

/**
 * @shortdesc Searches for YouTube playlists based on a query string using async/await instead of events.
 *
 * @description This function performs a search on YouTube for playlists using a given query string. It returns the data of the first playlist found in the search results as a Promise. Note that this function is intended for searching by keywords, not for fetching data of a known playlist ID or URL; use a dedicated playlist data function for that purpose.
 *
 * The function requires a search query string and returns a Promise that resolves with the first matching playlist object, or rejects with an error.
 *
 * @param options - An object containing the configuration options.
 * @param {string} options.playlistLink - The search query string for playlists. **Required**, min 2 characters. Despite the parameter name, this should be a search term (e.g., "lofi hip hop playlist"), not a playlist URL or ID.
 *
 * @returns {Promise<searchPlaylistsType>} A Promise that resolves with the data of the first found playlist upon success.
 * @throws {Error} Throws a formatted error if argument validation fails (ZodError), if the input is detected as a playlist ID, if no playlists are found for the query, or if there is an internal search or data retrieval issue.
 */
export default async function search_playlists({ playlistLink }: z.infer<typeof ZodSchema>): Promise<searchPlaylistsType> {
    // Refactored to use async/await and return a Promise directly, replacing EventEmitter pattern.
    try {
        // Perform Zod schema validation on the provided options. This call is synchronous.
        // It will throw a ZodError if validation fails based on the defined schema.
        ZodSchema.parse({ playlistLink });

        // Check if the input string is likely a YouTube ID (could be video or playlist ID)
        // The original code uses YouTubeID to check if it *is* an ID and throws if so,
        // implying this function is strictly for text search queries.
        const isID = await YouTubeID(playlistLink); // Assuming YouTubeID returns Promise<string | null>

        // If YouTubeID returns a non-null value, it means the input looks like an ID.
        if (isID) {
            // Throw an error indicating the user should use a different function for IDs/links.
            throw new Error(`${colors.red("@error: ")} Input "${playlistLink}" appears to be a YouTube ID or link. Use playlist_data() to fetch information for a known playlist link/ID.`);
        }

        // Perform the asynchronous search using the refactored helper function.
        const metaDataArray: searchPlaylistsType[] = await searchPlaylistsHelper({ query: playlistLink }); // Call the refactored helper

        // Check if the search returned any results.
        if (!metaDataArray || metaDataArray.length === 0) {
            // If no playlists were found, throw an error.
            throw new Error(`${colors.red("@error: ")} No playlists found for the provided query "${playlistLink}".`);
        }

        // Select the first playlist result from the array.
        const metaData: searchPlaylistsType = metaDataArray[0];

        // Although the previous check ensures the array is not empty,
        // an extra check for the first element being null/undefined as a safeguard.
        if (!metaData) {
            // This case is unlikely if metaDataArray.length > 0, but included for robustness.
            throw new Error(`${colors.red("@error: ")} Unable to get data for the first playlist result.`);
        }

        // If successful, return the first playlist object. The async function automatically wraps this in a resolved Promise.
        return metaData;
    } catch (error: any) {
        // Catch any errors that occurred during the process (Zod validation, YouTubeID check, search failure, no results).
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
