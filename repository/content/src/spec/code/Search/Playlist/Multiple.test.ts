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
        const result = await search_playlists({ playlistLink: validQuery });
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toHaveProperty("id");
        vitest.expect(typeof result.data.id).toBe("string");
        vitest.expect(result.data).toHaveProperty("title");
        vitest.expect(typeof result.data.title).toBe("string");
        vitest.expect(result.data).toHaveProperty("videoCount");
        vitest.expect(typeof result.data.videoCount).toBe("number");
        vitest.expect(result.data).toHaveProperty("thumbnails");
        vitest.expect(Array.isArray(result.data.thumbnails)).toBe(true);
    });
    vitest.it("should handle playlist search with a different query", async () => {
        const result = await search_playlists({ playlistLink: anotherValidQuery });
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toHaveProperty("id");
    });
    vitest.it("should throw Zod error for missing playlistLink", async () => {
        await vitest.expect(search_playlists({} as any)).rejects.toThrowError(/playlistLink.*Required/);
    });
    vitest.it("should throw Zod error for short playlistLink query", async () => {
        await vitest.expect(search_playlists({ playlistLink: shortQuery })).rejects.toThrowError(/playlistLink.*should be at least 2 characters/);
    });
    vitest.it("should throw error if input is detected as a YouTube ID (playlist link)", async () => {
        await vitest.expect(search_playlists({ playlistLink: playlistLinkInput })).rejects.toThrowError(/Use playlist_data\(\) for playlist link!/);
    });
    vitest.it("should throw error if input is detected as a YouTube ID (video link)", async () => {
        await vitest.expect(search_playlists({ playlistLink: videoLinkInput })).rejects.toThrowError(/Use playlist_data\(\) for playlist link!/);
    });
    vitest.it("should throw error if no playlists found for the query", async () => {
        try {
            await search_playlists({ playlistLink: queryWithNoResults });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/No playlists found for the provided query./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no playlists found.");
    });
});
