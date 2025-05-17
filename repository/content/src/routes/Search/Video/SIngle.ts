import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import YouTubeID from "../../../utils/YouTubeId";
const ZodSchema = z.object({ videoLink: z.string().min(2) });
export interface SingleVideoType {
    id: string;
    title: string;
    thumbnails: string[];
    uploadDate: string;
    description: string;
    duration: number;
    isLive: boolean;
    viewCount: number;
    channelid: string;
    channelname: string;
    tags: string;
    likeCount: number;
}
async function singleVideo({ videoId }: { videoId: string }): Promise<SingleVideoType> {
    try {
        const youtube = new Client();
        const singleVideoData: any = await youtube.getVideo(videoId);
        if (!singleVideoData) {
            throw new Error(`${colors.red("@error:")} Unable to fetch video data.`);
        }
        return {
            id: singleVideoData.id,
            title: singleVideoData.title,
            thumbnails: singleVideoData.thumbnails,
            uploadDate: singleVideoData.uploadDate,
            description: singleVideoData.description,
            duration: singleVideoData.duration,
            isLive: singleVideoData.isLiveContent,
            viewCount: singleVideoData.viewCount,
            channelid: singleVideoData.channel?.id,
            channelname: singleVideoData.channel?.name,
            tags: singleVideoData.tags,
            likeCount: singleVideoData.likeCount,
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
}
type VideoDataOptions = z.infer<typeof ZodSchema>;
export default async function videoData({ videoLink }: VideoDataOptions): Promise<SingleVideoType> {
    try {
        ZodSchema.parse({ videoLink });
        const vId = await YouTubeID(videoLink);
        if (!vId) {
            throw new Error(`${colors.red("@error:")} Incorrect video link provided.`);
        }
        const metaData = await singleVideo({ videoId: vId });
        return metaData;
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
        console.log("--- Running Basic Video Data Fetch Example ---");
        const result = await videoData({ videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
        console.log("Video Data:", result);
    } catch (error) {
        console.error("Basic Video Data Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Video Data Fetch with Shortened URL Example ---");
        const result = await videoData({ videoLink: "https://youtu.be/dQw4w9WgXcQ" });
        console.log("Video Data:", result);
    } catch (error) {
        console.error("Shortened URL Video Data Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Video Data Fetch with Video ID Example ---");
        const result = await videoData({ videoLink: "dQw4w9WgXcQ" });
        console.log("Video Data:", result);
    } catch (error) {
        console.error("Video ID Video Data Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Missing videoLink Example ---");
        await videoData({} as any);
        console.log("This should not be reached - Missing videoLink Example.");
    } catch (error) {
        console.error("Expected Error (Missing videoLink):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Invalid videoLink Example ---");
        await videoData({ videoLink: "this is not a youtube link" });
        console.log("This should not be reached - Invalid videoLink Example.");
    } catch (error) {
        console.error("Expected Error (Incorrect videoLink):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Nonexistent Video Example ---");
        await videoData({ videoLink: "https://www.youtube.com/watch?v=nonexistentvideo123" });
        console.log("This should not be reached - Nonexistent Video Example.");
    } catch (error) {
        console.error("Expected Error (Unable to Fetch Video Data):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
