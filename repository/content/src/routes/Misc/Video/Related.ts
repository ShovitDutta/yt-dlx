import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
const ZodSchema = z.object({ videoId: z.string().min(2) });
export interface RelatedVideosType {
    id: string;
    title: string;
    isLive: boolean;
    duration: number;
    uploadDate: string;
    thumbnails: string[];
}
async function relatedVideos({ videoId }: { videoId: string }): Promise<RelatedVideosType[]> {
    try {
        const youtube = new Client();
        const videoData: any = await youtube.getVideo(videoId);
        if (!videoData?.related?.items) {
            return [];
        }
        return videoData.related.items.map((item: any) => ({ id: item.id, title: item.title, isLive: item.isLive, duration: item.duration, uploadDate: item.uploadDate, thumbnails: item.thumbnails }));
    } catch (error: any) {
        throw new Error(error.message);
    }
}
type RelatedVideosOptions = z.infer<typeof ZodSchema>;
export default async function relatedVideosFn({ videoId }: RelatedVideosOptions): Promise<RelatedVideosType[]> {
    try {
        ZodSchema.parse({ videoId });
        const videos = await relatedVideos({ videoId });
        if (!videos || videos.length === 0) {
            throw new Error(`${colors.red("@error:")} No related videos found for the provided video ID.`);
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
describe("relatedVideosFn", () => {
    const videoIdWithRelated = "dQw4w9WgXcQ";
    const videoIdWithNoRelated = "nonexistentvideoid123abc";
    it("should handle basic related videos fetch", async () => {
        try {
            const result = await relatedVideosFn({ videoId: videoIdWithRelated });
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
            if (result.length > 0) {
                expect(result[0]).toHaveProperty("id");
                expect(result[0]).toHaveProperty("title");
                expect(result[0]).toHaveProperty("isLive");
                expect(result[0]).toHaveProperty("duration");
                expect(result[0]).toHaveProperty("uploadDate");
                expect(result[0]).toHaveProperty("thumbnails");
                expect(Array.isArray(result[0].thumbnails)).toBe(true);
            }
        } catch (error) {
            console.warn(`Basic related videos fetch failed for ${videoIdWithRelated}. This test requires a real video ID with related videos.`, error);
            throw error;
        }
    });
    it("should throw Zod error for missing videoId", async () => {
        await expect(relatedVideosFn({} as any)).rejects.toThrowError(/videoId.*Required/);
    });
    it("should throw Zod error for short videoId", async () => {
        await expect(relatedVideosFn({ videoId: "a" })).rejects.toThrowError(/videoId.*should be at least 2 characters/);
    });
    it("should throw error if no related videos are found", async () => {
        try {
            await relatedVideosFn({ videoId: videoIdWithNoRelated });
        } catch (error: any) {
            if (error instanceof Error) {
                expect(error.message).toMatch(/No related videos found for the provided video ID./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no related videos found.");
    });
});
