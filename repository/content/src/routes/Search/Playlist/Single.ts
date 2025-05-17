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
