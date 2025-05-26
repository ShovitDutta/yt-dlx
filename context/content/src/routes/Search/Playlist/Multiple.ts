import colors from "colors";
import { Client } from "youtubei";
import { z, ZodError } from "zod";
import YouTubeID from "../../../utils/YouTubeId";
const ZodSchema = z.object({ playlistLink: z.string().min(2), Verbose: z.boolean().optional() });
export interface searchPlaylistsType {
    id: string;
    title: string;
    videoCount: number;
    thumbnails: string[];
}
async function searchPlaylists({ Query }: { Query: string }): Promise<searchPlaylistsType[]> {
    try {
        const youtube = new Client();
        const searchPlaylists = await youtube.search(Query, { type: "playlist" });
        const result: searchPlaylistsType[] = searchPlaylists.items.map((item: any) => ({ id: item.id, title: item.title, videoCount: item.videoCount, thumbnails: item.thumbnails?.[0] || null }));
        return result;
    } catch (error: any) {
        throw new Error(`${colors.red("@error: ")} ${error.message}`);
    }
}
/**
 * @shortdesc Searches for YouTube playlists based on a query.
 *
 * @description This function allows you to search for YouTube playlists using a given search query.
 * It utilizes the `youtubei` library to perform the search and extracts relevant information for each found playlist,
 * including its ID, title, video count, and thumbnails.
 * **Important:** This function is designed for searching by keywords, not for retrieving data from a specific playlist URL.
 * If you have a playlist link (URL), you should use `playlist_data()` instead.
 *
 * @param options - An object containing the search query and optional verbose mode.
 * @param options.playlistLink - A string representing the search query for playlists. This is a mandatory parameter and must be at least 2 characters long. Note: This parameter name is somewhat misleading; it expects a search query, not a direct playlist URL.
 * @param options.Verbose - An optional boolean. If `true`, enables verbose logging, displaying additional information during execution. Defaults to `false`.
 *
 * @returns {Promise<searchPlaylistsType>} A promise that resolves to an object of type `searchPlaylistsType`.
 * The object represents the first found playlist that matches the query, with the following properties:
 * - `id`: The unique identifier of the playlist.
 * - `title`: The title of the playlist.
 * - `videoCount`: The number of videos in the playlist.
 * - `thumbnails`: An array of thumbnail URLs for the playlist. (Note: The current implementation only extracts the first thumbnail URL).
 *
 * @throws {Error}
 * - If the `playlistLink` parameter (interpreted as a query here) is actually a YouTube playlist ID (URL): `Error: @error: Use playlist_data() for playlist link!`
 * - If no playlists are found for the provided query: `Error: @error: No playlists found for the provided Query.`
 * - If unable to extract data for the first found playlist: `Error: @error: Unable to get playlist data.`
 * - If argument validation fails due to invalid `options` (e.g., incorrect type or missing required fields): `Error: @error: Argument validation failed: [path.to.field]: [message]`
 * - For any other unexpected errors during the process: `Error: @error: An unexpected error occurred: [error_message]`
 */
export default async function Search_Playlist_Multiple({ playlistLink, Verbose }: z.infer<typeof ZodSchema>): Promise<searchPlaylistsType> {
    try {
        ZodSchema.parse({ playlistLink, Verbose });
        const isID = await YouTubeID(playlistLink);
        if (isID) throw new Error(`${colors.red("@error: ")} Use playlist_data() for playlist link!`);
        const metaDataArray: searchPlaylistsType[] = await searchPlaylists({ Query: playlistLink });
        if (!metaDataArray.length) throw new Error(`${colors.red("@error: ")} No playlists found for the provided Query.`);
        const metaData: searchPlaylistsType = metaDataArray[0];
        if (!metaData) throw new Error(`${colors.red("@error: ")} Unable to get playlist data.`);
        return metaData;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw error;
        else throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
