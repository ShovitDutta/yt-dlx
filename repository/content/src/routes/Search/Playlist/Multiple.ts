import colors from "colors";
import { Client } from "youtubei";
import { z, ZodError } from "zod";
import { EventEmitter } from "events";
import YouTubeID from "../../../utils/YouTubeId";
const ZodSchema = z.object({ playlistLink: z.string().min(2) });
export interface searchPlaylistsType {
    id: string;
    title: string;
    videoCount: number;
    thumbnails: string[];
}
async function searchPlaylists({ query }: { query: string }, emitter: EventEmitter): Promise<searchPlaylistsType[]> {
    try {
        const youtube = new Client();
        const searchPlaylists = await youtube.search(query, { type: "playlist" });
        const result: searchPlaylistsType[] = searchPlaylists.items.map((item: any) => ({
            id: item.id,
            title: item.title,
            videoCount: item.videoCount,
            thumbnails: item.thumbnails,
        }));
        return result;
    } catch (error: any) {
        emitter.emit("error", `${colors.red("@error: ")} ${error.message}`);
        return [];
    }
}
/**
 * @shortdesc Searches for YouTube playlists based on a query string.
 *
 * @description This function performs a search on YouTube for playlists using a given query string. It returns the data of the first playlist found in the search results. Note that this function is intended for searching by keywords, not for fetching data of a known playlist ID or URL; use the `playlist_data()` function for that purpose.
 *
 * The function requires a search query string.
 *
 * It supports the following configuration options:
 * - **playlistLink:** A string representing the search query for playlists. Despite the parameter name, this should be a search term (e.g., "lofi hip hop playlist"), not a playlist URL or ID. This is a mandatory parameter with a minimum length of 2 characters.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - `"data"`: Emitted when a playlist is successfully found based on the query. The emitted data is an object containing details about the first matching playlist, including its ID, title, video count, and thumbnails.
 * - `"error"`: Emitted when an error occurs at any stage, such as argument validation, if the input is detected as a playlist ID, if no playlists are found for the query, or if there is an internal search or data retrieval issue. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.playlistLink - The search query string for playlists. **Required**.
 *
 * @returns {EventEmitter} An EventEmitter instance for handling events during the playlist search.
 *
 * @example
 * // 1. Search for playlists using a query string
 * YouTubeDLX.Search.Playlist.Multiple({ playlistLink: "lofi hip hop" })
 * .on("data", (data) => console.log("First Playlist Found:", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 2. Search for playlists using a different query string
 * YouTubeDLX.Search.Playlist.Multiple({ playlistLink: "workout music" })
 * .on("data", (data) => console.log("First Playlist Found:", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 3. Provide a query that is too short (will result in a Zod error)
 * YouTubeDLX.Search.Playlist.Multiple({ playlistLink: "a" } as any)
 * .on("error", (error) => console.error("Expected Error (short query):", error));
 *
 * @example
 * // 4. Provide a playlist URL or ID instead of a search query (will result in an error)
 * YouTubeDLX.Search.Playlist.Multiple({ playlistLink: "https://www.youtube.com/playlist?list=SOME_PLAYLIST_ID" })
 * .on("error", (error) => console.error("Expected Error (input is playlist link):", error));
 *
 * @example
 * // 5. Provide a query that yields no playlist results
 * YouTubeDLX.Search.Playlist.Multiple({ playlistLink: "a query with no playlist results 12345xyz" })
 * .on("error", (error) => console.error("Expected Error (no playlists found):", error));
 *
 * @example
 * // 6. Missing required 'playlistLink' parameter (will result in a Zod error)
 * YouTubeDLX.Search.Playlist.Multiple({} as any)
 * .on("error", (error) => console.error("Expected Error (missing playlistLink):", error));
 *
 * @example
 * // 7. An internal search or data retrieval error occurs
 * // Note: This is an internal error scenario, difficult to trigger directly via a simple example call.
 * // The errors emitted could include: "Engine error: ...", "Unable to retrieve a response from the engine.", "Metadata was not found...", "Unable to get playlist data."
 * // YouTubeDLX.Search.Playlist.Multiple({ playlistLink: "query that causes internal error" })
 * // .on("error", (error) => console.error("Expected Error (internal search error):", error));
 *
 */
export default function search_playlists({ playlistLink }: z.infer<typeof ZodSchema>): EventEmitter {
    const emitter = new EventEmitter();
    (async () => {
        try {
            ZodSchema.parse({ playlistLink });
            const isID = await YouTubeID(playlistLink);
            if (isID) {
                emitter.emit("error", `${colors.red("@error: ")} Use playlist_data() for playlist link!`);
                return;
            }
            const metaDataArray: searchPlaylistsType[] = await searchPlaylists({ query: playlistLink }, emitter);
            if (!metaDataArray.length) {
                emitter.emit("error", `${colors.red("@error: ")} No playlists found for the provided query.`);
                return;
            }
            const metaData: searchPlaylistsType = metaDataArray[0];
            if (!metaData) {
                emitter.emit("error", `${colors.red("@error: ")} Unable to get playlist data.`);
                return;
            }
            emitter.emit("data", metaData);
        } catch (error) {
            if (error instanceof ZodError) emitter.emit("error", `${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
            else if (error instanceof Error) emitter.emit("error", `${colors.red("@error:")} ${error.message}`);
            else emitter.emit("error", `${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
        } finally {
            console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
        }
    })();
    return emitter;
}
