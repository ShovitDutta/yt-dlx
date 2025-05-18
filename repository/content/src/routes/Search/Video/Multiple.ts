import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
const ZodSchema = z.object({
    query: z.string().min(2),
    minViews: z.number().optional(),
    maxViews: z.number().optional(),
    verbose: z.boolean().optional(),
    orderBy: z.enum(["relevance", "viewCount", "rating", "date"]).optional(),
});
type SearchVideosOptions = z.infer<typeof ZodSchema>;
interface VideoSearchResult {
    id: string;
    title: string;
    isLive: boolean;
    duration?: number;
    viewCount?: number;
    uploadDate?: string;
    channelid?: string;
    thumbnails?: any[];
    description?: string;
    channelname?: string;
}
export default async function searchVideos({ query, minViews, maxViews, orderBy, verbose }: SearchVideosOptions): Promise<VideoSearchResult[]> {
    try {
        ZodSchema.parse({ query, minViews, maxViews, orderBy, verbose });
        const youtube = new Client();
        const searchResults = await youtube.search(query, { type: "video" });
        let videos: VideoSearchResult[] = searchResults.items.map((item: any) => ({
            id: item.id,
            title: item.title,
            isLive: item.isLive,
            duration: item.duration,
            viewCount: item.viewCount,
            uploadDate: item.uploadDate,
            channelid: item.channel?.id,
            thumbnails: item.thumbnails,
            description: item.description,
            channelname: item.channel?.name,
        }));
        if (minViews !== undefined) videos = videos.filter(video => (video.viewCount ?? 0) >= minViews);
        if (maxViews !== undefined) videos = videos.filter(video => (video.viewCount ?? 0) <= maxViews);
        if (orderBy) {
            if (orderBy === "viewCount") videos.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
            else if (orderBy === "date") videos.sort((a, b) => new Date(b.uploadDate ?? 0).getTime() - new Date(a.uploadDate ?? 0).getTime());
        }
        if (videos.length === 0) {
            throw new Error(`${colors.red("@error:")} No videos found with the given criteria.`);
        }
        return videos;
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
describe("searchVideos", () => {
    const validQuery = "programming tutorials";
    const queryWithNoVideos = "very unlikely video search 1a2b3c4d5e f6g7h8i9j0";
    it("should handle basic video search", async () => {
        const result = await searchVideos({ query: validQuery });
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        if (result.length > 0) {
            expect(result[0]).toHaveProperty("id");
            expect(result[0]).toHaveProperty("title");
            expect(result[0]).toHaveProperty("isLive");
        }
    });
    it("should handle search with verbose logging", async () => {
        const result = await searchVideos({ query: validQuery, verbose: true });
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
    });
    it("should handle search with minimum views", async () => {
        const result = await searchVideos({ query: validQuery, minViews: 1000 });
        expect(Array.isArray(result)).toBe(true);
    });
    it("should handle search with maximum views", async () => {
        const result = await searchVideos({ query: validQuery, maxViews: 10000 });
        expect(Array.isArray(result)).toBe(true);
    });
    it("should handle search with view range", async () => {
        const result = await searchVideos({ query: validQuery, minViews: 5000, maxViews: 50000 });
        expect(Array.isArray(result)).toBe(true);
    });
    it("should handle search sorted by relevance", async () => {
        const result = await searchVideos({ query: validQuery, orderBy: "relevance" });
        expect(Array.isArray(result)).toBe(true);
    });
    it("should handle search sorted by view count", async () => {
        const result = await searchVideos({ query: validQuery, orderBy: "viewCount" });
        expect(Array.isArray(result)).toBe(true);
    });
    it("should handle search sorted by date", async () => {
        const result = await searchVideos({ query: validQuery, orderBy: "date" });
        expect(Array.isArray(result)).toBe(true);
    });
    it("should throw Zod error for missing query", async () => {
        await expect(searchVideos({} as any)).rejects.toThrowError(/query.*Required/);
    });
    it("should throw Zod error for short query", async () => {
        await expect(searchVideos({ query: "a" })).rejects.toThrowError(/query.*should be at least 2 characters/);
    });
    it("should throw Zod error for invalid orderBy", async () => {
        await expect(searchVideos({ query: validQuery, orderBy: "popular" as any })).rejects.toThrowError(/orderBy.*invalid enum value/);
    });
    it("should throw error if no videos found for the query", async () => {
        try {
            await searchVideos({ query: queryWithNoVideos });
        } catch (error: any) {
            if (error instanceof Error) {
                expect(error.message).toMatch(/No videos found with the given criteria./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no videos found.");
    });
    it("should throw error if no videos found after applying extreme view filter", async () => {
        try {
            await searchVideos({ query: validQuery, minViews: 1000000000000 });
        } catch (error: any) {
            if (error instanceof Error) {
                expect(error.message).toMatch(/No videos found with the given criteria./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no videos after filtering.");
    });
});
