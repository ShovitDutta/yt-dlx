import colors from "colors";
import { z, ZodError } from "zod";
import { Client, PlaylistCompact } from "youtubei"; // Assuming 'youtubei' provides 'Client' and 'PlaylistCompact' or similar types
// import { EventEmitter } from "events"; // Remove EventEmitter import as we are refactoring to async/await
import YouTubeID from "../../../utils/YouTubeId"; // Assuming YouTubeID helper function exists and returns Promise<string | null>

// Define the Zod schema for input validation
const ZodSchema = z.object({ playlistLink: z.string().min(2) }); // Mandatory playlist link

// Define the interface for the result structure
export interface playlistVideosType {
    id: string;
    title: string;
    videoCount: number;
    result: { id: string; title: string; isLive: boolean; duration: number | null; thumbnails: { url: string; width: number; height: number }[] }[]; // Array of video details
}

// Helper function to fetch playlist videos using youtubei
// Refactored to not take emitter and throw errors or return null/data directly
async function playlistVideosHelper({ playlistId }: { playlistId: string }): Promise<playlistVideosType | null> {
    try {
        const youtube = new Client(); // Assuming Client constructor is synchronous
        // Assuming youtube.getPlaylist returns a Promise<Playlist | null> where Playlist has id, title, videoCount, and videos.items array
        const playlistVideosData: any = await youtube.getPlaylist(playlistId);

        if (!playlistVideosData) {
            // If getPlaylist returns null or undefined, throw an error
            throw new Error(`${colors.red("@error: ")} Unable to fetch playlist data from youtubei client.`);
        }

        // Map the videos within the playlist to the desired structure
        // Note: Original code mapped thumbnail objects to string URLs. Preserving that structure.
        const videoResults = playlistVideosData.videos.items.map((item: any) => ({
            id: item.id,
            title: item.title,
            isLive: item.isLive, // Assuming property name is isLive
            duration: item.duration, // Assuming duration is a number or null
            thumbnails: item.thumbnails?.map((thumb: { url: string }) => thumb.url) || [], // Map thumbnail objects to URLs, default to empty array
        }));

        // Return the mapped playlist data
        return {
            id: playlistVideosData.id,
            title: playlistVideosData.title,
            videoCount: playlistVideosData.videoCount, // Assuming property name is videoCount
            result: videoResults,
        };
    } catch (error: any) {
        // Catch any errors during fetching playlist data and re-throw with context
        throw new Error(`${colors.red("@error: ")} Error fetching playlist details: ${error.message}`);
    }
}

/**
 * @shortdesc Fetches data for a YouTube playlist using async/await instead of events.
 *
 * @description This function retrieves comprehensive details about a YouTube playlist, including its title, video count, and a list of videos within the playlist using async/await. It requires a valid YouTube playlist link as input.
 *
 * The function takes the playlist link, extracts the playlist ID, and then uses the YouTube API (via the youtubei library) to fetch the playlist information and the list of videos it contains.
 *
 * It returns a Promise that resolves with an object conforming to the `playlistVideosType` interface containing playlist details and video list, or rejects with an error, replacing the EventEmitter pattern.
 *
 * @param options - An object containing the configuration options.
 * @param {string} options.playlistLink - The URL of the YouTube playlist. **Required**.
 *
 * @returns {Promise<playlistVideosType>} A Promise that resolves with the playlist data upon success.
 * @throws {Error} Throws a formatted error if argument validation fails (ZodError), if the video link format is invalid, if fetching data from the YouTube API fails, or if other unexpected errors occur.
 *
 * @example
 * // 1. Fetch data for a valid playlist link using async/await with try...catch
 * const playlistLink = "https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID_HERE"; // Replace with a real playlist link
 * try {
 * const playlistData = await YouTubeDLX.Search.Playlist.Single({ playlistLink });
 * console.log("Playlist Data:", playlistData);
 * console.log("First video title:", playlistData.result[0]?.title); // Access videos in the 'result' array
 * } catch (error) {
 * console.error("Error fetching playlist data:", error);
 * }
 *
 * @example
 * // 2. Handle missing required 'playlistLink' parameter with async/await
 * try {
 * const playlistData = await YouTubeDLX.Search.Playlist.Single({} as any);
 * console.log("Playlist Data:", playlistData); // This line won't be reached
 * } catch (error) {
 * console.error("Expected Error (missing playlistLink):", error.message); // Catches the thrown ZodError
 * }
 *
 * @example
 * // 3. Handle invalid playlist link provided (fails YouTubeID extraction) with async/await
 * const invalidLink = "this is not a playlist link";
 * try {
 * const playlistData = await YouTubeDLX.Search.Playlist.Single({ playlistLink: invalidLink });
 * console.log("Playlist Data:", playlistData); // This line won't be reached
 * } catch (error) {
 * console.error("Expected Error (incorrect playlist link):", error.message); // Catches the thrown error
 * }
 *
 * @example
 * // 4. Handle fetching data for a non-existent or private playlist with async/await
 * // Replace with a real playlist link that is known to be inaccessible or non-existent
 * const nonExistentPlaylistLink = "https://www.youtube.com/playlist?list=NON_EXISTENT_PLAYLIST_ID_12345";
 * try {
 * const playlistData = await YouTubeDLX.Search.Playlist.Single({ playlistLink: nonExistentPlaylistLink });
 * console.log("Playlist Data:", playlistData); // This line won't be reached
 * } catch (error) {
 * console.error("Expected Error (unable to retrieve playlist information):", error.message); // Catches the thrown error from playlistVideosHelper
 * }
 *
 * // Note: Original examples using .on(...) are replaced by standard Promise handling (.then/.catch or await with try/catch).
 */
export default async function playlist_data({ playlistLink }: z.infer<typeof ZodSchema>): Promise<playlistVideosType> {
    // Refactored to use async/await and return a Promise directly, replacing EventEmitter pattern.
    try {
        // Perform Zod schema validation on the provided options. This call is synchronous.
        // It will throw a ZodError if validation fails based on the defined schema.
        ZodSchema.parse({ playlistLink });

        // Await the asynchronous call to the YouTubeID helper to extract the playlist ID.
        // Assuming YouTubeID can correctly extract a playlist ID from a link.
        const playlistId = await YouTubeID(playlistLink); // Assuming YouTubeID returns Promise<string | null>

        // Check if the playlist ID was successfully extracted.
        if (!playlistId) {
            // If YouTubeID returns null, throw an error indicating the link was incorrect.
            throw new Error(`${colors.red("@error: ")} Incorrect playlist link provided. Unable to extract playlist ID.`);
        }

        // Await the asynchronous call to the refactored playlistVideosHelper function.
        // This helper now throws errors or returns the data directly.
        const metaData: playlistVideosType | null = await playlistVideosHelper({ playlistId });

        // Check if metadata was successfully retrieved by the playlistVideosHelper.
        // Although playlistVideosHelper is refactored to throw on fetch failure, this check
        // handles the case where the helper might still return null in some edge cases
        // or if its internal logic changes.
        if (!metaData) {
            // If playlistVideosHelper returns null, throw an error.
            throw new Error(`${colors.red("@error: ")} Unable to retrieve playlist information after fetching.`);
        }

        // If successful, return the fetched metadata. The async function automatically wraps this in a resolved Promise.
        return metaData;
    } catch (error: any) {
        // Catch any errors that occurred during the process (Zod validation, YouTubeID extraction, playlistVideosHelper fetch).
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
