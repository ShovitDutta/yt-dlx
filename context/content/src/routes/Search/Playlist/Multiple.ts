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
export default async function search_playlists({ playlistLink, Verbose }: z.infer<typeof ZodSchema>): Promise<{ data: searchPlaylistsType }> {
    try {
        ZodSchema.parse({ playlistLink, Verbose });
        const isID = await YouTubeID(playlistLink);
        if (isID) throw new Error(`${colors.red("@error: ")} Use playlist_data() for playlist link!`);
        const metaDataArray: searchPlaylistsType[] = await searchPlaylists({ Query: playlistLink });
        if (!metaDataArray.length) throw new Error(`${colors.red("@error: ")} No playlists found for the provided Query.`);
        const metaData: searchPlaylistsType = metaDataArray[0];
        if (!metaData) throw new Error(`${colors.red("@error: ")} Unable to get playlist data.`);
        return { data: metaData };
    } catch (error) {
        if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw error;
        else throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
