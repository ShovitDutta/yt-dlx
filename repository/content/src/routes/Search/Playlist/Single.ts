import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import YouTubeID from "../../../utils/YouTubeId";
const ZodSchema = z.object({ playlistLink: z.string().min(2) });
export interface playlistVideosType {
    id: string;
    title: string;
    videoCount: number;
    result: { id: string; title: string; isLive: boolean; duration: number; thumbnails: string[] }[];
}
async function playlistVideos({ playlistId }: { playlistId: string }): Promise<playlistVideosType | null> {
    try {
        const youtube = new Client();
        const playlistVideosData: any = await youtube.getPlaylist(playlistId);
        if (!playlistVideosData) {
            throw new Error(`${colors.red("@error: ")} Unable to fetch playlist data.`);
        }
        const result = playlistVideosData.videos.items.map((item: any) => ({ id: item.id, title: item.title, isLive: item.isLive, duration: item.duration, thumbnails: item.thumbnails }));
        return { id: playlistVideosData.id, title: playlistVideosData.title, videoCount: playlistVideosData.videoCount, result };
    } catch (error: any) {
        throw new Error(`${colors.red("@error: ")} ${error.message}`);
    }
}
/**
 * @shortdesc Fetches data for a YouTube playlist using its link, including details of the videos within the playlist.
 *
 * @description This function takes a YouTube playlist link, extracts the playlist ID,
 * and then uses the `youtubei.js` library to fetch comprehensive data for that playlist,
 * including information about each video it contains.
 *
 * The process involves:
 * 1. Validating the input `playlistLink`.
 * 2. Extracting the playlist ID from the link using the `YouTubeID` utility.
 * 3. Fetching playlist data using the extracted ID via the `youtubei.js` client.
 * 4. Processing the fetched data to structure the playlist and video information.
 *
 * The function supports the following configuration option:
 * - **Playlist Link:** A string representing the YouTube playlist URL. Must be at least 2 characters long. **Required**.
 *
 * The function returns a Promise that resolves with an object containing the playlist data (`{ data: playlistVideosType }`) if successful. The `playlistVideosType` object includes the playlist's ID, title, video count, and a result array containing details for each video in the playlist.
 *
 * @param {object} options - The configuration option for fetching playlist data.
 * @param {string} options.playlistLink - The YouTube playlist URL (minimum 2 characters). **Required**.
 *
 * @returns {Promise<{ data: playlistVideosType }>} A Promise that resolves with an object containing the playlist data in the `data` property. The `playlistVideosType` object includes `id`, `title`, `videoCount`, and `result` (an array of video objects with `id`, `title`, `isLive`, `duration`, and `thumbnails`).
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing `playlistLink`, `playlistLink` is less than 2 characters).
 * - Throws an `Error` if the provided `playlistLink` is incorrect and a valid playlist ID cannot be extracted.
 * - Throws an `Error` if fetching playlist data from the `youtubei.js` client fails.
 * - Throws an `Error` if the fetched playlist data is null or cannot be processed (e.g., the playlist does not exist or is private/deleted).
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Running Basic Playlist Data Fetch
 * // Replace with a real YouTube playlist link
 * const playlistLink = "https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID";
 * try {
 * const result = await playlist_data({ playlistLink });
 * console.log("Playlist Data:", result.data);
 * // Example of accessing video titles:
 * // result.data.result.forEach(video => console.log(video.title));
 * } catch (error) {
 * console.error("Basic Playlist Data Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Zod Validation Error Example (Missing playlistLink - will throw ZodError)
 * try {
 * await playlist_data({} as any); // Using 'as any' to simulate missing required parameter
 * console.log("This should not be reached - Missing playlistLink Error.");
 * } catch (error) {
 * console.error("Expected Error (Missing playlistLink):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Zod Validation Error Example (Short playlistLink - will throw ZodError)
 * try {
 * await playlist_data({ playlistLink: "a" }); // Link is less than minimum length (2)
 * console.log("This should not be reached - Short playlistLink Error.");
 * } catch (error) {
 * console.error("Expected Error (playlistLink Too Short):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Error Example for Incorrect Playlist Link Format
 * // Use a string that is not a valid YouTube playlist URL format
 * const invalidLink = "this is not a playlist link";
 * try {
 * await playlist_data({ playlistLink: invalidLink });
 * console.log("This should not be reached - Invalid Playlist Link Error.");
 * } catch (error) {
 * console.error("Expected Error (Incorrect Playlist Link):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Running Error Example for Non-Existent or Private Playlist
 * // Use a link format that is correct but for a playlist ID that doesn't exist or is private/deleted.
 * // Replace with a link you know won't work, e.g., a random string as ID.
 * const nonExistentPlaylistLink = "https://www.youtube.com/playlist?list=PL_RANDOM_NON_EXISTENT_ID";
 * try {
 * await playlist_data({ playlistLink: nonExistentPlaylistLink });
 * console.log("This should not be reached - Non-Existent Playlist Error.");
 * } catch (error) {
 * console.error("Expected Error (Unable to Retrieve Playlist Information):", error instanceof Error ? error.message : error);
 * // This might also manifest as "Unable to fetch playlist data." depending on youtubei.js behavior
 * }
 *
 * @example
 * // 6. Example of a Generic Error during fetch (e.g., network issue, API change)
 * // This is harder to trigger predictably with a simple example.
 * // try {
 * //    // Use a link that might somehow cause an unexpected issue with the youtubei.js client
 * //    await playlist_data({ playlistLink: "link-causing-internal-error" });
 * // } catch (error) {
 * //    console.error("Expected Unexpected Error:", error instanceof Error ? error.message : error);
 * // }
 */
export default async function playlist_data({ playlistLink }: z.infer<typeof ZodSchema>): Promise<{ data: playlistVideosType }> {
    try {
        ZodSchema.parse({ playlistLink });
        const playlistId = await YouTubeID(playlistLink);
        if (!playlistId) {
            throw new Error(`${colors.red("@error: ")} Incorrect playlist link provided.`);
        }
        const metaData: playlistVideosType | null = await playlistVideos({ playlistId });
        if (!metaData) {
            throw new Error(`${colors.red("@error: ")} Unable to retrieve playlist information.`);
        }
        return { data: metaData };
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
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
(async () => {
    const playlistLink = "https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID_HERE";
    try {
        console.log("--- Running Basic Playlist Data Fetch ---");
        const result = await playlist_data({ playlistLink });
        console.log("Playlist Data:", result.data);
    } catch (error) {
        console.error("Basic Playlist Data Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Missing playlistLink Error ---");
        await playlist_data({} as any);
        console.log("This should not be reached - Missing playlistLink Error.");
    } catch (error) {
        console.error("Expected Error (Missing playlistLink):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Invalid Playlist Link Error ---");
        const invalidLink = "https://www.youtube.com/watch?v=SOME_VIDEO_ID";
        await playlist_data({ playlistLink: invalidLink });
        console.log("This should not be reached - Invalid Playlist Link Error.");
    } catch (error) {
        console.error("Expected Error (Incorrect Playlist Link):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Non-Existent Playlist Error ---");
        const nonExistentPlaylistLink = "https://www.youtube.com/playlist?list=NON_EXISTENT_PLAYLIST_ID_12345";
        await playlist_data({ playlistLink: nonExistentPlaylistLink });
        console.log("This should not be reached - Non-Existent Playlist Error.");
    } catch (error) {
        console.error("Expected Error (Unable to Retrieve Playlist Information):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
