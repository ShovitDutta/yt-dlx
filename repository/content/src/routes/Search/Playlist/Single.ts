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
 * @shortdesc Fetches data and the list of videos for a given YouTube playlist link.
 *
 * @description This function takes a YouTube playlist link, extracts the playlist ID,
 * and then fetches detailed information about the playlist, including its title,
 * video count, and a list of the videos it contains.
 * It uses the `youtubei.js` library internally for fetching playlist data and a utility (`YouTubeID`)
 * to parse the playlist ID from various link formats.
 *
 * The function requires a valid playlist link as input.
 *
 * The process involves:
 * 1. Validating the input playlist link using Zod.
 * 2. Extracting the playlist ID from the link using the `YouTubeID` utility.
 * 3. Fetching playlist data using the extracted playlist ID via the internal `youtubei.js` client.
 * 4. Structuring the fetched playlist data and video list into a `playlistVideosType` object.
 *
 * The function supports the following configuration options:
 * - **PlaylistLink:** A string representing the YouTube playlist URL. Must be at least 2 characters long. **Required**.
 *
 * It returns a Promise that resolves with an object containing the playlist data (`{ data: playlistVideosType }`) if successful.
 *
 * @param {object} options - The configuration options for fetching playlist data.
 * @param {string} options.playlistLink - The YouTube playlist URL (minimum 2 characters). **Required**.
 *
 * @returns {Promise<{ data: playlistVideosType }>} A Promise that resolves with an object containing the fetched playlist data, including the playlist ID, title, video count, and an array of video details (`id`, `title`, `isLive`, `duration`, `thumbnails`).
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing `playlistLink`, `playlistLink` is less than 2 characters).
 * - Throws an `Error` if the provided `playlistLink` format is incorrect and the playlist ID cannot be extracted.
 * - Throws an `Error` if the internal `youtubei.js` client is unable to fetch data for the given playlist ID (e.g., the playlist does not exist, is private, or there's a network issue).
 * - Throws an `Error` for any underlying issues during playlist data fetching.
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Running Basic Playlist Data Fetch Example
 * // Replace with a real YouTube playlist link
 * const validPlaylistLink = "https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID";
 * try {
 * const result = await playlist_data({ playlistLink: validPlaylistLink });
 * console.log("Playlist Data:", result.data);
 * console.log("Playlist Title:", result.data.title);
 * console.log("Number of Videos:", result.data.videoCount);
 * console.log("First Video Title:", result.data.result[0]?.title);
 * } catch (error) {
 * console.error("Basic Playlist Data Fetch Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Zod Validation Error Example (Missing playlistLink - will throw ZodError)
 * try {
 * await playlist_data({} as any); // Using 'as any' to simulate missing required parameter
 * console.log("This should not be reached - Missing playlistLink Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Missing playlistLink):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Zod Validation Error Example (Short playlistLink - will throw ZodError)
 * try {
 * await playlist_data({ playlistLink: "a" }); // Link is less than minimum length (2)
 * console.log("This should not be reached - Short playlistLink Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Short playlistLink):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Error Example for Invalid Playlist Link Format
 * // Use a string that is not a valid YouTube playlist link format
 * const invalidPlaylistLinkFormat = "this_is_not_a_playlist_link";
 * try {
 * await playlist_data({ playlistLink: invalidPlaylistLinkFormat });
 * console.log("This should not be reached - Invalid Link Format Example.");
 * } catch (error) {
 * console.error("Expected Error (Incorrect playlist link provided):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Running Error Example for a Non-Existent Playlist
 * // Use a link with a playlist ID that is highly unlikely to exist
 * const nonExistentPlaylistLink = "https://www.youtube.com/playlist?list=PL_NON_EXISTENT_ID_12345";
 * try {
 * await playlist_data({ playlistLink: nonExistentPlaylistLink });
 * console.log("This should not be reached - Non-Existent Playlist Example.");
 * } catch (error) {
 * console.error("Expected Error (Unable to retrieve playlist information):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Example of an Unexpected Error during fetch (e.g., network issue, API change)
 * // This is harder to trigger predictably with a simple example.
 * // try {
 * //    // Use a link that might somehow cause an unexpected issue with the internal client
 * //    await playlist_data({ playlistLink: "https://www.youtube.com/playlist?list=PLAYLIST_ID_CAUSING_ERROR" });
 * // } catch (error) {
 * //    console.error("Expected Unexpected Error:", error instanceof Error ? error.message : error);
 * // }
 */
// Definition for the structure of the returned playlist data
export interface playlistVideosType {
    id: string;
    title: string;
    videoCount: number;
    result: {
        id: string;
        title: string;
        isLive: boolean;
        duration: number;
        thumbnails: string[];
    }[];
}
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
import * as vitest from "vitest";
vitest.describe("playlist_data", () => {
    const validPlaylistLink = "https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID_HERE";
    const invalidPlaylistLink = "https://www.youtube.com/watch?v=SOME_VIDEO_ID";
    const nonExistentPlaylistLink = "https://www.youtube.com/playlist?list=NON_EXISTENT_PLAYLIST_ID_12345";
    vitest.it("should handle basic playlist data fetch", async () => {
        try {
            const result = await playlist_data({ playlistLink: validPlaylistLink });
            vitest.expect(result).toHaveProperty("data");
            vitest.expect(result.data).toHaveProperty("id");
            vitest.expect(typeof result.data.id).toBe("string");
            vitest.expect(result.data).toHaveProperty("title");
            vitest.expect(typeof result.data.title).toBe("string");
            vitest.expect(result.data).toHaveProperty("videoCount");
            vitest.expect(typeof result.data.videoCount).toBe("number");
            vitest.expect(result.data).toHaveProperty("result");
            vitest.expect(Array.isArray(result.data.result)).toBe(true);
            if (result.data.result.length > 0) {
                vitest.expect(result.data.result[0]).toHaveProperty("id");
                vitest.expect(result.data.result[0]).toHaveProperty("title");
            }
        } catch (error) {
            console.warn(`Basic playlist data fetch failed for ${validPlaylistLink}. This might require a real playlist link.`, error);
            throw error;
        }
    });
    vitest.it("should throw Zod error for missing playlistLink", async () => {
        await vitest.expect(playlist_data({} as any)).rejects.toThrowError(/playlistLink.*Required/);
    });
    vitest.it("should throw error for invalid playlist link format", async () => {
        await vitest.expect(playlist_data({ playlistLink: invalidPlaylistLink })).rejects.toThrowError(/Incorrect playlist link provided./);
    });
    vitest.it("should throw error for a non-existent playlist", async () => {
        try {
            await playlist_data({ playlistLink: nonExistentPlaylistLink });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/Unable to retrieve playlist information./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for a non-existent playlist.");
    });
});
