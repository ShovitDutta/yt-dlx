import relatedVideosFn from "../../../../routes/Misc/Video/Related";
import * as vitest from "vitest";
vitest.describe("relatedVideosFn", () => {
    const videoIdWithRelated = "dQw4w9WgXcQ";
    const videoIdWithNoRelated = "nonexistentvideoid123abc";
    vitest.it("should handle basic related videos fetch", async () => {
        try {
            const result = await relatedVideosFn({ videoId: videoIdWithRelated });
            vitest.expect(Array.isArray(result)).toBe(true);
            vitest.expect(result.length).toBeGreaterThan(0);
            if (result.length > 0) {
                vitest.expect(result[0]).toHaveProperty("id");
                vitest.expect(result[0]).toHaveProperty("title");
                vitest.expect(result[0]).toHaveProperty("isLive");
                vitest.expect(result[0]).toHaveProperty("duration");
                vitest.expect(result[0]).toHaveProperty("uploadDate");
                vitest.expect(result[0]).toHaveProperty("thumbnails");
                vitest.expect(Array.isArray(result[0].thumbnails)).toBe(true);
            }
        } catch (error) {
            console.warn(`Basic related videos fetch failed for ${videoIdWithRelated}. This test requires a real video ID with related videos.`, error);
            throw error;
        }
    });
    vitest.it("should throw Zod error for missing videoId", async () => {
        await vitest.expect(relatedVideosFn({} as any)).rejects.toThrowError(/videoId.*Required/);
    });
    vitest.it("should throw Zod error for short videoId", async () => {
        await vitest.expect(relatedVideosFn({ videoId: "a" })).rejects.toThrowError(/videoId.*should be at least 2 characters/);
    });
    vitest.it("should throw error if no related videos are found", async () => {
        try {
            await relatedVideosFn({ videoId: videoIdWithNoRelated });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/No related videos found for the provided video ID./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no related videos found.");
    });
});
