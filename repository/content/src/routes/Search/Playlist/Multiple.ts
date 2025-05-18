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
import { describe, it, expect } from "vitest";
describe("search_playlists", () => {
    const validQuery = "lofi hip hop";
    const anotherValidQuery = "workout music";
    const shortQuery = "a";
    const playlistLinkInput = "https://www.youtube.com/playlist?list=PLys0_41fX5XgI7P9Q07L4B_I3D8M4qG4z";
    const videoLinkInput = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const queryWithNoResults = "very unlikely playlist search 1a2b3c4d5e";
    it("should handle basic playlist search", async () => {
        const result = await search_playlists({ playlistLink: validQuery });
        expect(result).toHaveProperty("data");
        expect(result.data).toHaveProperty("id");
        expect(typeof result.data.id).toBe("string");
        expect(result.data).toHaveProperty("title");
        expect(typeof result.data.title).toBe("string");
        expect(result.data).toHaveProperty("videoCount");
        expect(typeof result.data.videoCount).toBe("number");
        expect(result.data).toHaveProperty("thumbnails");
        expect(Array.isArray(result.data.thumbnails)).toBe(true);
    });
    it("should handle playlist search with a different query", async () => {
        const result = await search_playlists({ playlistLink: anotherValidQuery });
        expect(result).toHaveProperty("data");
        expect(result.data).toHaveProperty("id");
    });
    it("should throw Zod error for missing playlistLink", async () => {
        await expect(search_playlists({} as any)).rejects.toThrowError(/playlistLink.*Required/);
    });
    it("should throw Zod error for short playlistLink query", async () => {
        await expect(search_playlists({ playlistLink: shortQuery })).rejects.toThrowError(/playlistLink.*should be at least 2 characters/);
    });
    it("should throw error if input is detected as a YouTube ID (playlist link)", async () => {
        await expect(search_playlists({ playlistLink: playlistLinkInput })).rejects.toThrowError(/Use playlist_data\(\) for playlist link!/);
    });
    it("should throw error if input is detected as a YouTube ID (video link)", async () => {
        await expect(search_playlists({ playlistLink: videoLinkInput })).rejects.toThrowError(/Use playlist_data\(\) for playlist link!/);
    });
    it("should throw error if no playlists found for the query", async () => {
        try {
            await search_playlists({ playlistLink: queryWithNoResults });
        } catch (error: any) {
            if (error instanceof Error) {
                expect(error.message).toMatch(/No playlists found for the provided query./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no playlists found.");
    });
});
