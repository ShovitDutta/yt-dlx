import playlist_data from "../../../../routes/Search/Playlist/Single";
import * as vitest from "vitest";
vitest.describe("playlist_data", () => {
    const validPlaylistLink = "https://www.youtube.com/playlist?list=PLFgquLnLkJ29B3V1jtfyzJTg0NgjqvZVJ";
    const invalidPlaylistLink = "https://www.youtube.com/watch?v=SOME_VIDEO_ID";
    const nonExistentPlaylistLink = "https://www.youtube.com/playlist?list=NON_EXISTENT_PLAYLIST_ID_12345";
    vitest.it("should handle basic playlist data fetch", async () => {
        try {
            const result = await playlist_data({ playlistLink: validPlaylistLink });
            if (result) {
                vitest.expect(result).toHaveProperty("id");
                vitest.expect(typeof result.id).toBe("string");
                vitest.expect(result).toHaveProperty("title");
                vitest.expect(typeof result.title).toBe("string");
                vitest.expect(result).toHaveProperty("videoCount");
                vitest.expect(typeof result.videoCount).toBe("number");
                vitest.expect(result).toHaveProperty("result");
                vitest.expect(Array.isArray(result.result)).toBe(true);
                if (result.result && result.result.length > 0) {
                    vitest.expect(result.result[0]).toHaveProperty("id");
                    vitest.expect(result.result[0]).toHaveProperty("title");
                }
            }
        } catch (error) {
            console.warn("Basic playlist data fetch failed for " + validPlaylistLink + ". This might require a real playlist link. " + error);
            throw error;
        }
    });
});
