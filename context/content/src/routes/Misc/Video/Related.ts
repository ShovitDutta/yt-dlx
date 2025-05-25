import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
const ZodSchema = z.object({ VideoId: z.string().min(2), Verbose: z.boolean().optional() });
export interface RelatedVideosType {
    id: string;
    title: string;
    isLive: boolean;
    duration: number;
    uploadDate: string;
    thumbnails: string[];
}
async function relatedVideos({ VideoId }: { VideoId: string }): Promise<RelatedVideosType[]> {
    try {
        const youtube = new Client();
        const videoData: any = await youtube.getVideo(VideoId);
        if (!videoData?.related?.items) return [];
        return videoData.related.items.map((item: any) => ({
            id: item.id,
            title: item.title,
            isLive: item.isLive,
            duration: item.duration,
            uploadDate: item.uploadDate,
            thumbnails: item.thumbnails?.[0] || null,
        }));
    } catch (error: any) {
        throw new Error(error.message);
    }
}
type RelatedVideosOptions = z.infer<typeof ZodSchema>;
export default async function relatedVideosFn({ VideoId, Verbose }: RelatedVideosOptions): Promise<RelatedVideosType[]> {
    try {
        ZodSchema.parse({ VideoId, Verbose });
        const videos = await relatedVideos({ VideoId });
        if (!videos || videos.length === 0) throw new Error(colors.red("@error:") + ` No related videos found for the provided video ID.`);
        return videos;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(colors.red("@error:") + ` Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw error;
        else throw new Error(colors.red("@error:") + ` An unexpected error occurred: ${String(error)}`);
    } finally {
        if (Verbose) console.log(colors.green("@info:"), `❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.`);
    }
}
