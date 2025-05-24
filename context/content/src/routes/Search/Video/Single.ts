import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import YouTubeID from "../../../utils/YouTubeId";
const ZodSchema = z.object({ VideoLink: z.string().min(2), Verbose: z.boolean().optional() });
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
async function singleVideo({ VideoId }: { VideoId: string }): Promise<SingleVideoType> {
    try {
        const youtube = new Client();
        const singleVideoData: any = await youtube.getVideo(VideoId);
        if (!singleVideoData) {
            throw new Error(`${colors.red("@error:")} Unable to fetch video data.`);
        }
        return {
            id: singleVideoData.id,
            title: singleVideoData.title,
            thumbnails: singleVideoData.thumbnails?.[0] || null,
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
export default async function videoData({ VideoLink, Verbose }: VideoDataOptions): Promise<SingleVideoType> {
    try {
        ZodSchema.parse({ VideoLink, Verbose });
        const vId = await YouTubeID(VideoLink);
        if (!vId) throw new Error(`${colors.red("@error:")} Incorrect video link provided.`);
        const metaData = await singleVideo({ VideoId: vId });
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
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
