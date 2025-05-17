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
 * @shortdesc Searches for YouTube playlists using a query and returns the data of the first result.
 *
 * @description This function performs a search on YouTube specifically for playlists based on the provided query string.
 * It returns the metadata (ID, title, video count, thumbnails) of the *first* playlist found in the search results.
 * This function is intended for searching using keywords, not for retrieving data from a known playlist link.
 * If the input looks like a YouTube playlist ID or link, an error is thrown directing the user to a different function (`playlist_data`).
 *
 * It utilizes the `youtubei.js` library for performing the playlist search.
 *
 * The function supports the following configuration options:
 * - **playlistLink:** A string representing the search query for playlists. Note that despite the parameter name, this should be a search term (e.g., "lofi hip hop playlist"), not a direct YouTube playlist URL or ID. The query must be at least 2 characters long. **Required**.
 *
 * The function returns a Promise that resolves with an object containing the metadata of the first playlist found.
 *
 * @param {object} options - The configuration options for searching playlists.
 * @param {string} options.playlistLink - The search query string for YouTube playlists (minimum 2 characters). **Required**.
 *
 * @returns {Promise<{ data: searchPlaylistsType }>} A Promise that resolves with an object. The object has a `data` property containing the `searchPlaylistsType` object for the first playlist found.
 * The `searchPlaylistsType` includes the `id`, `title`, `videoCount`, and `thumbnails` of the playlist.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., `playlistLink` is missing or less than 2 characters).
 * - Throws an `Error` if the provided `playlistLink` input appears to be a YouTube playlist ID or link, instructing the user to use the correct function.
 * - Throws an `Error` if the search for playlists returns no results for the provided query.
 * - Throws an `Error` if the internal search process fails to return playlist data.
 * - Throws an `Error` for any underlying issues during the search process using the internal `youtubei.js` client.
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Running Basic Playlist Search with a query
 * try {
 * const result = await search_playlists({ playlistLink: "lofi hip hop" });
 * console.log("First Playlist Found:", result.data);
 * } catch (error) {
 * console.error("Basic Playlist Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Playlist Search with a Different Query
 * try {
 * const result = await search_playlists({ playlistLink: "workout music" });
 * console.log("First Playlist Found:", result.data);
 * } catch (error) {
 * console.error("Playlist Search with Different Query Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Zod Validation Error Example (Short Query - will throw ZodError)
 * try {
 * await search_playlists({ playlistLink: "a" } as any); // Query is less than minimum length (2)
 * console.log("This should not be reached - Short Query Error.");
 * } catch (error) {
 * console.error("Expected Error (Short Query):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Error Example (Input is interpreted as a Playlist Link/ID - will throw Error)
 * // Use an input that looks like a YouTube ID or URL.
 * try {
 * await search_playlists({ playlistLink: "PLFgquLnL59alcyQqJNj_P1C1uL975T8Lz" }); // Example playlist ID
 * console.log("This should not be reached - Playlist Link Error.");
 * } catch (error) {
 * console.error("Expected Error (Input is Playlist Link):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Running No Results Query Example (will throw Error)
 * // Use a query very unlikely to return any playlist results.
 * try {
 * await search_playlists({ playlistLink: "a query with no playlist results 12345xyz" });
 * console.log("This should not be reached - No Results Query.");
 * } catch (error) {
 * console.error("Expected Error (No Playlists Found):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Running Zod Validation Error Example (Missing playlistLink - will throw ZodError)
 * try {
 * await search_playlists({} as any); // Using 'as any' to simulate missing required parameter
 * console.log("This should not be reached - Missing playlistLink Error.");
 * } catch (error) {
 * console.error("Expected Error (Missing playlistLink):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 7. Example of an Unexpected Error during search (e.g., network issue, API change)
 * // This is harder to trigger predictably with a simple example.
 * // try {
 * //    // Use a query that might somehow cause an unexpected issue with the internal client
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
(async () => {
    try {
        console.log("--- Running Basic Playlist Search ---");
        const result = await search_playlists({ playlistLink: "lofi hip hop" });
        console.log("First Playlist Found:", result.data);
    } catch (error) {
        console.error("Basic Playlist Search Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Playlist Search with Different Query ---");
        const result = await search_playlists({ playlistLink: "workout music" });
        console.log("First Playlist Found:", result.data);
    } catch (error) {
        console.error("Playlist Search with Different Query Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Short Query Error ---");
        await search_playlists({ playlistLink: "a" } as any);
        console.log("This should not be reached - Short Query Error.");
    } catch (error) {
        console.error("Expected Error (Short Query):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Playlist Link Error ---");
        await search_playlists({ playlistLink: "https://www.youtube.com/playlist?list=SOME_PLAYLIST_ID" });
        console.log("This should not be reached - Playlist Link Error.");
    } catch (error) {
        console.error("Expected Error (Input is Playlist Link):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running No Results Query ---");
        await search_playlists({ playlistLink: "a query with no playlist results 12345xyz" });
        console.log("This should not be reached - No Results Query.");
    } catch (error) {
        console.error("Expected Error (No Playlists Found):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Missing playlistLink Error ---");
        await search_playlists({} as any);
        console.log("This should not be reached - Missing playlistLink Error.");
    } catch (error) {
        console.error("Expected Error (Missing playlistLink):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
