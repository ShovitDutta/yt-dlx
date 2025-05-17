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
