import colors from "colors";
import { Client } from "youtubei";
import { z, ZodError } from "zod";
import YouTubeID from "../../../utils/YouTubeId";
const ZodSchema = z.object({ playlistLink: z.string().min(2) });
export interface searchPlaylistsType {
    id: string;
    title: string;
    videoCount: number;
    thumbnails: string[];
}
async function searchPlaylists({ query }: { query: string }): Promise<searchPlaylistsType[]> {
    try {
        const youtube = new Client();
        const searchPlaylists = await youtube.search(query, { type: "playlist" });
        const result: searchPlaylistsType[] = searchPlaylists.items.map((item: any) => ({ id: item.id, title: item.title, videoCount: item.videoCount, thumbnails: item.thumbnails }));
        return result;
    } catch (error: any) {
        throw new Error(`${colors.red("@error: ")} ${error.message}`);
    }
}
/**
 * @shortdesc Searches for YouTube playlists based on a text query.
 *
 * @description This function searches YouTube for playlists that match the provided text query.
 * It returns detailed information about the first playlist found in the search results.
 *
 * It uses the `youtubei.js` library internally to perform the playlist search.
 * Note that the input parameter `playlistLink` is used as a *search query*, not a direct playlist URL or ID.
 * If the input string appears to be a YouTube video or playlist ID/URL, the function will throw an error,
 * advising the use of a dedicated function for fetching data by ID/URL (`playlist_data()`).
 *
 * The function requires a query string of at least 2 characters.
 *
 * The function supports the following configuration options:
 * - **PlaylistLink:** A string representing the search query for playlists. Must be at least 2 characters long. **Required**.
 * - **Verbose:** An optional boolean value. While defined in the schema, this parameter is currently not used in the function's logic. Defaults to `false`.
 *
 * The function returns a Promise that resolves with an object containing the data of the first matching playlist (`{ data: searchPlaylistsType }`).
 * The `searchPlaylistsType` object includes the playlist's `id`, `title`, `videoCount`, and `thumbnails`.
 *
 * @param {object} options - The configuration options for searching playlists.
 * @param {string} options.playlistLink - The search query for YouTube playlists (minimum 2 characters). **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging (Note: Currently not used in function logic).
 *
 * @returns {Promise<{ data: searchPlaylistsType }>} A Promise that resolves with an object containing the data of the first playlist found.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing required `playlistLink`, `playlistLink` is less than 2 characters).
 * - Throws an `Error` if the provided `playlistLink` is detected as a YouTube video or playlist ID/URL, suggesting `playlist_data()` instead.
 * - Throws an `Error` if the search returns no playlists for the provided query.
 * - Throws an `Error` if the internal `youtubei.js` client fails during the search operation.
 * - Throws an `Error` if processing the search results fails to extract the expected playlist data.
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Performing a basic playlist search
 * try {
 * const result = await search_playlists({ playlistLink: "lofi hip hop" });
 * console.log("First found playlist:", result.data);
 * } catch (error) {
 * console.error("Basic Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Performing a playlist search with a different query
 * try {
 * const result = await search_playlists({ playlistLink: "workout music" });
 * console.log("First found playlist:", result.data);
 * } catch (error) {
 * console.error("Another Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Example of Zod Validation Error (Missing playlistLink - will throw ZodError)
 * try {
 * await search_playlists({} as any); // Using 'as any' to simulate missing required parameter
 * } catch (error) {
 * console.error("Expected Error (Missing playlistLink):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Example of Zod Validation Error (Short playlistLink query - will throw ZodError)
 * try {
 * await search_playlists({ playlistLink: "a" }); // Query is less than minimum length (2)
 * } catch (error) {
 * console.error("Expected Error (Query Too Short):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Example of input detected as a YouTube ID (will throw Error)
 * // This function is for searching, not fetching data by ID/URL.
 * try {
 * await search_playlists({ playlistLink: "PLynO1h3t3nJ62R63IjfV5o6d6f6d6f6d6" }); // Example playlist ID
 * } catch (error) {
 * console.error("Expected Error (Input is a YouTube ID):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Example of no playlists found for the query (will throw Error)
 * // Use a query very unlikely to match any playlist.
 * try {
 * await search_playlists({ playlistLink: "very unlikely playlist search 1a2b3c4d5e" });
 * } catch (error) {
 * console.error("Expected Error (No Playlists Found):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 7. Example of an unexpected error during the search process
 * // This is harder to trigger predictably with a simple example.
 * // try {
 * //    // Use a query that might somehow cause an internal issue with the client
 * //    await search_playlists({ playlistLink: "query causing internal error" });
 * // } catch (error) {
 * //    console.error("Expected Unexpected Error:", error instanceof Error ? error.message : error);
 * // }
 */
export default async function search_playlists({ playlistLink }: z.infer<typeof ZodSchema>): Promise<{ data: searchPlaylistsType }> {
    try {
        ZodSchema.parse({ playlistLink });
        const isID = await YouTubeID(playlistLink);
        if (isID) {
            throw new Error(`${colors.red("@error: ")} Use playlist_data() for playlist link!`);
        }
        const metaDataArray: searchPlaylistsType[] = await searchPlaylists({ query: playlistLink });
        if (!metaDataArray.length) {
            throw new Error(`${colors.red("@error: ")} No playlists found for the provided query.`);
        }
        const metaData: searchPlaylistsType = metaDataArray[0];
        if (!metaData) {
            throw new Error(`${colors.red("@error: ")} Unable to get playlist data.`);
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
vitest.describe("search_playlists", () => {
    const validQuery = "lofi hip hop";
    const anotherValidQuery = "workout music";
    const shortQuery = "a";
    const playlistLinkInput = "https://www.youtube.com/playlist?list=PLys0_41fX5XgI7P9Q07L4B_I3D8M4qG4z";
    const videoLinkInput = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const queryWithNoResults = "very unlikely playlist search 1a2b3c4d5e";
    vitest.it("should handle basic playlist search", async () => {
        const result = await search_playlists({ playlistLink: validQuery });
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toHaveProperty("id");
        vitest.expect(typeof result.data.id).toBe("string");
        vitest.expect(result.data).toHaveProperty("title");
        vitest.expect(typeof result.data.title).toBe("string");
        vitest.expect(result.data).toHaveProperty("videoCount");
        vitest.expect(typeof result.data.videoCount).toBe("number");
        vitest.expect(result.data).toHaveProperty("thumbnails");
        vitest.expect(Array.isArray(result.data.thumbnails)).toBe(true);
    });
    vitest.it("should handle playlist search with a different query", async () => {
        const result = await search_playlists({ playlistLink: anotherValidQuery });
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toHaveProperty("id");
    });
    vitest.it("should throw Zod error for missing playlistLink", async () => {
        await vitest.expect(search_playlists({} as any)).rejects.toThrowError(/playlistLink.*Required/);
    });
    vitest.it("should throw Zod error for short playlistLink query", async () => {
        await vitest.expect(search_playlists({ playlistLink: shortQuery })).rejects.toThrowError(/playlistLink.*should be at least 2 characters/);
    });
    vitest.it("should throw error if input is detected as a YouTube ID (playlist link)", async () => {
        await vitest.expect(search_playlists({ playlistLink: playlistLinkInput })).rejects.toThrowError(/Use playlist_data\(\) for playlist link!/);
    });
    vitest.it("should throw error if input is detected as a YouTube ID (video link)", async () => {
        await vitest.expect(search_playlists({ playlistLink: videoLinkInput })).rejects.toThrowError(/Use playlist_data\(\) for playlist link!/);
    });
    vitest.it("should throw error if no playlists found for the query", async () => {
        try {
            await search_playlists({ playlistLink: queryWithNoResults });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/No playlists found for the provided query./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no playlists found.");
    });
});
