import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
const ZodSchema = z.object({ VIdeoID: z.string().min(2), Verbose: z.boolean().optional() });
export interface RelatedVideosType {
    id: string;
    title: string;
    isLive: boolean;
    duration: number;
    uploadDate: string;
    thumbnails: string[];
}
async function relatedVideos({ VIdeoID }: { VIdeoID: string }): Promise<RelatedVideosType[]> {
    try {
        const youtube = new Client();
        const videoData: any = await youtube.getVideo(VIdeoID);
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
export default async function relatedVideosFn({ VIdeoID, Verbose }: RelatedVideosOptions): Promise<RelatedVideosType[]> {
    try {
        ZodSchema.parse({ VIdeoID, Verbose });
        const videos = await relatedVideos({ VIdeoID });
        if (!videos || videos.length === 0) throw new Error(`${colors.red("@error:")} No related videos found for the provided video ID.`);
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
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
