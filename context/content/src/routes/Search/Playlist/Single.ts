import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import YouTubeID from "../../../utils/YouTubeId";
const ZodSchema = z.object({ playlistLink: z.string().min(2), Verbose: z.boolean().optional() });
export interface playlistVideosType {
    id: string;
    title: string;
    videoCount: number;
    result: { id: string; title: string; isLive: boolean; duration: number; thumbnails: string[] }[];
}
async function playlistVideos({ PlaylistId }: { PlaylistId: string }): Promise<playlistVideosType | null> {
    try {
        const youtube = new Client();
        const playlistVideosData: any = await youtube.getPlaylist(PlaylistId);
        if (!playlistVideosData) throw new Error(`${colors.red("@error: ")} Unable to fetch playlist data.`);
        const result = playlistVideosData.videos.items.map((item: any) => ({ id: item.id, title: item.title, isLive: item.isLive, duration: item.duration, thumbnails: item.thumbnails?.[0] || null }));
        return { id: playlistVideosData.id, title: playlistVideosData.title, videoCount: playlistVideosData.videoCount, result };
    } catch (error: any) {
        throw new Error(`${colors.red("@error: ")} ${error.message}`);
    }
}
export default async function playlist_data({ playlistLink, Verbose }: z.infer<typeof ZodSchema>): Promise<{ data: playlistVideosType }> {
    try {
        ZodSchema.parse({ playlistLink, Verbose });
        const PlaylistId = await YouTubeID(playlistLink);
        if (!PlaylistId) throw new Error(`${colors.red("@error: ")} Incorrect playlist link provided.`);
        const metaData: playlistVideosType | null = await playlistVideos({ PlaylistId });
        if (!metaData) throw new Error(`${colors.red("@error: ")} Unable to retrieve playlist information.`);
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
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
