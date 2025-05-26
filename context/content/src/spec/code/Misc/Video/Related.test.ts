import relatedVideosFn from "../../../../routes/Misc/Video/Related";
import * as vitest from "vitest";
vitest.describe("relatedVideosFn", () => {
    vitest.it("should handle basic related videos fetch", async () => {
        try {
            const result = await relatedVideosFn({ VideoId: "https://www.youtube.com/watch?v=30LWjhZzg50" });
            vitest.expect(Array.isArray(result)).toBe(true);
            vitest.expect(result.length).toBeGreaterThan(0);
            if (result && result.length > 0) {
                vitest.expect(result[0]).toHaveProperty("id");
                vitest.expect(result[0]).toHaveProperty("title");
                vitest.expect(result[0]).toHaveProperty("isLive");
                vitest.expect(result[0]).toHaveProperty("duration");
                vitest.expect(result[0]).toHaveProperty("uploadDate");
                vitest.expect(result[0]).toHaveProperty("thumbnails");
                vitest.expect(Array.isArray(result[0].thumbnails)).toBe(true);
            }
        } catch (error) {
            console.warn('Basic related videos fetch failed for "https://www.youtube.com/watch?v=30LWjhZzg50". This test requires a real video ID with related videos. ' + error);
            throw error;
        }
    });
});
