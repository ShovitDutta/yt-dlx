import * as vitest from "vitest";
import searchVideos from "../../../../routes/Search/Video/Multiple";
vitest.describe("searchVideos", () => {
    const validQuery = "programming tutorials";
    const queryWithNoVideos = "very unlikely video search 1a2b3c4d5e f6g7h8i9j0";
    vitest.it("should handle basic video search", async () => {
        const result = await searchVideos({ query: validQuery });
        vitest.expect(Array.isArray(result)).toBe(true);
        vitest.expect(result.length).toBeGreaterThan(0);
        if (result.length > 0) {
            vitest.expect(result[0]).toHaveProperty("id");
            vitest.expect(result[0]).toHaveProperty("title");
            vitest.expect(result[0]).toHaveProperty("isLive");
        }
    });
    vitest.it("should handle search with verbose logging", async () => {
        const result = await searchVideos({ query: validQuery, verbose: true });
        vitest.expect(Array.isArray(result)).toBe(true);
        vitest.expect(result.length).toBeGreaterThan(0);
    });
    vitest.it("should handle search with minimum views", async () => {
        const result = await searchVideos({ query: validQuery, minViews: 1000 });
        vitest.expect(Array.isArray(result)).toBe(true);
    });
    vitest.it("should handle search with maximum views", async () => {
        const result = await searchVideos({ query: validQuery, maxViews: 10000 });
        vitest.expect(Array.isArray(result)).toBe(true);
    });
    vitest.it("should handle search with view range", async () => {
        const result = await searchVideos({ query: validQuery, minViews: 5000, maxViews: 50000 });
        vitest.expect(Array.isArray(result)).toBe(true);
    });
    vitest.it("should handle search sorted by relevance", async () => {
        const result = await searchVideos({ query: validQuery, orderBy: "relevance" });
        vitest.expect(Array.isArray(result)).toBe(true);
    });
    vitest.it("should handle search sorted by view count", async () => {
        const result = await searchVideos({ query: validQuery, orderBy: "viewCount" });
        vitest.expect(Array.isArray(result)).toBe(true);
    });
    vitest.it("should handle search sorted by date", async () => {
        const result = await searchVideos({ query: validQuery, orderBy: "date" });
        vitest.expect(Array.isArray(result)).toBe(true);
    });
    vitest.it("should throw Zod error for missing query", async () => {
        await vitest.expect(searchVideos({} as any)).rejects.toThrowError(/query.*Required/);
    });
    vitest.it("should throw Zod error for short query", async () => {
        await vitest.expect(searchVideos({ query: "a" })).rejects.toThrowError(/query.*should be at least 2 characters/);
    });
    vitest.it("should throw Zod error for invalid orderBy", async () => {
        await vitest.expect(searchVideos({ query: validQuery, orderBy: "popular" as any })).rejects.toThrowError(/orderBy.*invalid enum value/);
    });
    vitest.it("should throw error if no videos found for the query", async () => {
        try {
            await searchVideos({ query: queryWithNoVideos });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/No videos found with the given criteria./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no videos found.");
    });
    vitest.it("should throw error if no videos found after applying extreme view filter", async () => {
        try {
            await searchVideos({ query: validQuery, minViews: 1000000000000 });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/No videos found with the given criteria./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no videos after filtering.");
    });
});
