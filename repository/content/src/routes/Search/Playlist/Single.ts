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
import { describe, it, expect } from "vitest";
describe("playlist_data", () => {
    const validPlaylistLink = "https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID_HERE";
    const invalidPlaylistLink = "https://www.youtube.com/watch?v=SOME_VIDEO_ID";
    const nonExistentPlaylistLink = "https://www.youtube.com/playlist?list=NON_EXISTENT_PLAYLIST_ID_12345";
    it("should handle basic playlist data fetch", async () => {
        try {
            const result = await playlist_data({ playlistLink: validPlaylistLink });
            expect(result).toHaveProperty("data");
            expect(result.data).toHaveProperty("id");
            expect(typeof result.data.id).toBe("string");
            expect(result.data).toHaveProperty("title");
            expect(typeof result.data.title).toBe("string");
            expect(result.data).toHaveProperty("videoCount");
            expect(typeof result.data.videoCount).toBe("number");
            expect(result.data).toHaveProperty("result");
            expect(Array.isArray(result.data.result)).toBe(true);
            if (result.data.result.length > 0) {
                expect(result.data.result[0]).toHaveProperty("id");
                expect(result.data.result[0]).toHaveProperty("title");
            }
        } catch (error) {
            console.warn(`Basic playlist data fetch failed for ${validPlaylistLink}. This might require a real playlist link.`, error);
            throw error;
        }
    });
    it("should throw Zod error for missing playlistLink", async () => {
        await expect(playlist_data({} as any)).rejects.toThrowError(/playlistLink.*Required/);
    });
    it("should throw error for invalid playlist link format", async () => {
        await expect(playlist_data({ playlistLink: invalidPlaylistLink })).rejects.toThrowError(/Incorrect playlist link provided./);
    });
    it("should throw error for a non-existent playlist", async () => {
        try {
            await playlist_data({ playlistLink: nonExistentPlaylistLink });
        } catch (error: any) {
            if (error instanceof Error) {
                expect(error.message).toMatch(/Unable to retrieve playlist information./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for a non-existent playlist.");
    });
});
