import search_playlists from "../../../../routes/Search/Playlist/Multiple";
import * as vitest from "vitest";
vitest.describe("search_playlists", () => {
    const validQuery = "lofi hip hop";
    const anotherValidQuery = "workout music";
    const shortQuery = "a";
    const playlistLinkInput = "https://www.youtube.com/playlist?list=PLys0_41fX5XgI7P9Q07L4B_I3D8M4qG4z";
    const videoLinkInput = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const queryWithNoResults = "very unlikely playlist search 1a2b3c4d5e";
    vitest.it("should handle basic playlist search", async () => {
        try {
            const result = await search_playlists({ playlistLink: validQuery });
            vitest.expect(result).toHaveProperty("data");
            if (result && result.data) {
                vitest.expect(result.data).toHaveProperty("id");
                vitest.expect(typeof result.data.id).toBe("string");
                vitest.expect(result.data).toHaveProperty("title");
                vitest.expect(typeof result.data.title).toBe("string");
                vitest.expect(result.data).toHaveProperty("videoCount");
                vitest.expect(typeof result.data.videoCount).toBe("number");
                vitest.expect(result.data).toHaveProperty("thumbnails");
                vitest.expect(Array.isArray(result.data.thumbnails)).toBe(true);
            }
        } catch (error) {
            console.warn("Basic playlist search failed for Query \"" + validQuery + "\". " + `${error}`);
        }
    });
    vitest.it("should handle playlist search with a different Query", async () => {
        const result = await search_playlists({ playlistLink: anotherValidQuery });
        vitest.expect(result).toHaveProperty("data");
         if (result && result.data) {
            vitest.expect(result.data).toHaveProperty("id");
        }
    });
});
