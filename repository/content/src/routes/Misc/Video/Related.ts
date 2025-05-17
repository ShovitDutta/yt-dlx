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
(async () => {
    try {
        console.log("--- Running Basic Related Videos Fetch Example ---");
        const result = await relatedVideosFn({ videoId: "dQw4w9WgXcQ" });
        console.log("Related Videos:", result);
    } catch (error) {
        console.error("Basic Related Videos Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Missing videoId Example ---");
        await relatedVideosFn({} as any);
        console.log("This should not be reached - Missing videoId Example.");
    } catch (error) {
        console.error("Expected Error (Missing videoId):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Short videoId Example ---");
        await relatedVideosFn({ videoId: "a" });
        console.log("This should not be reached - Short videoId Example.");
    } catch (error) {
        console.error("Expected Error (Short videoId):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Nonexistent videoId Example ---");
        await relatedVideosFn({ videoId: "nonexistentvideoid123" });
        console.log("This should not be reached - Nonexistent videoId Example.");
    } catch (error) {
        console.error("Expected Error (No Related Videos Found):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
