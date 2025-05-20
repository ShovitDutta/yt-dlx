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
        if (verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
