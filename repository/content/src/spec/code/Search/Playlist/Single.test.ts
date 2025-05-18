import * as vitest from "vitest";
import playlist_data from "../../../../routes/Search/Playlist/Single";
vitest.describe("playlist_data", () => {
    const validPlaylistLink = "https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID_HERE";
    const invalidPlaylistLink = "https://www.youtube.com/watch?v=SOME_VIDEO_ID";
    const nonExistentPlaylistLink = "https://www.youtube.com/playlist?list=NON_EXISTENT_PLAYLIST_ID_12345";
    vitest.it("should handle basic playlist data fetch", async () => {
        try {
            const result = await playlist_data({ playlistLink: validPlaylistLink });
            vitest.expect(result).toHaveProperty("data");
            vitest.expect(result.data).toHaveProperty("id");
            vitest.expect(typeof result.data.id).toBe("string");
            vitest.expect(result.data).toHaveProperty("title");
            vitest.expect(typeof result.data.title).toBe("string");
            vitest.expect(result.data).toHaveProperty("videoCount");
            vitest.expect(typeof result.data.videoCount).toBe("number");
            vitest.expect(result.data).toHaveProperty("result");
            vitest.expect(Array.isArray(result.data.result)).toBe(true);
            if (result.data.result.length > 0) {
                vitest.expect(result.data.result[0]).toHaveProperty("id");
                vitest.expect(result.data.result[0]).toHaveProperty("title");
            }
        } catch (error) {
            console.warn(`Basic playlist data fetch failed for ${validPlaylistLink}. This might require a real playlist link.`, error);
            throw error;
        }
    });
    vitest.it("should throw Zod error for missing playlistLink", async () => {
        await vitest.expect(playlist_data({} as any)).rejects.toThrowError(/playlistLink.*Required/);
    });
    vitest.it("should throw error for invalid playlist link format", async () => {
        await vitest.expect(playlist_data({ playlistLink: invalidPlaylistLink })).rejects.toThrowError(/Incorrect playlist link provided./);
    });
    vitest.it("should throw error for a non-existent playlist", async () => {
        try {
            await playlist_data({ playlistLink: nonExistentPlaylistLink });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/Unable to retrieve playlist information./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for a non-existent playlist.");
    });
});
