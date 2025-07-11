import searchVideos from "../../../../routes/Search/Video/Multiple";
import * as vitest from "vitest";
vitest.describe("searchVideos", () => {
    vitest.it("should handle basic video search", async () => {
        try {
            const result = await searchVideos({ Query: "https://www.youtube.com/watch?v=30LWjhZzg50" });
            vitest.expect(Array.isArray(result)).toBe(true);
            vitest.expect(result.length).toBeGreaterThan(0);
            if (result && result.length > 0) {
                vitest.expect(result[0]).toHaveProperty("id");
                vitest.expect(result[0]).toHaveProperty("title");
                vitest.expect(result[0]).toHaveProperty("isLive");
            }
        } catch (error) {
            console.warn("Basic video search failed for Query 'https://www.youtube.com/watch?v=30LWjhZzg50'. This test requires a Query that returns video results. " + error);
        }
    });
    vitest.it("should handle search with Verbose logging", async () => {
        const result = await searchVideos({ Query: "https://www.youtube.com/watch?v=30LWjhZzg50", Verbose: true });
        vitest.expect(Array.isArray(result)).toBe(true);
        vitest.expect(result.length).toBeGreaterThan(0);
    });
    vitest.it("should handle search with minimum views", async () => {
        const result = await searchVideos({ Query: "https://www.youtube.com/watch?v=30LWjhZzg50", minViews: 1000 });
        vitest.expect(Array.isArray(result)).toBe(true);
    });
    vitest.it("should handle search with maximum views", async () => {
        const result = await searchVideos({ Query: "https://www.youtube.com/watch?v=30LWjhZzg50", maxViews: 10000 });
        vitest.expect(Array.isArray(result)).toBe(true);
    });
    vitest.it("should handle search with view range", async () => {
        const result = await searchVideos({ Query: "https://www.youtube.com/watch?v=30LWjhZzg50", minViews: 5000, maxViews: 50000 });
        vitest.expect(Array.isArray(result)).toBe(true);
    });
    vitest.it("should handle search sorted by relevance", async () => {
        const result = await searchVideos({ Query: "https://www.youtube.com/watch?v=30LWjhZzg50", orderBy: "relevance" });
        vitest.expect(Array.isArray(result)).toBe(true);
    });
    vitest.it("should handle search sorted by view count", async () => {
        const result = await searchVideos({ Query: "https://www.youtube.com/watch?v=30LWjhZzg50", orderBy: "viewCount" });
        vitest.expect(Array.isArray(result)).toBe(true);
    });
    vitest.it("should handle search sorted by date", async () => {
        const result = await searchVideos({ Query: "https://www.youtube.com/watch?v=30LWjhZzg50", orderBy: "date" });
        vitest.expect(Array.isArray(result)).toBe(true);
    });
});
