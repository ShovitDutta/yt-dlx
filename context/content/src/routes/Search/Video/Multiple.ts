import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
const ZodSchema = z.object({
    Query: z.string().min(2),
    minViews: z.number().optional(),
    maxViews: z.number().optional(),
    Verbose: z.boolean().optional(),
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
export default async function searchVideos({ Query, minViews, maxViews, orderBy, Verbose }: SearchVideosOptions): Promise<VideoSearchResult[]> {
    try {
        ZodSchema.parse({ Query, minViews, maxViews, orderBy, Verbose });
        const youtube = new Client();
        const searchResults = await youtube.search(Query, { type: "video" });
        let videos: VideoSearchResult[] = searchResults.items.map((item: any) => ({
            id: item.id,
            title: item.title,
            isLive: item.isLive,
            duration: item.duration,
            viewCount: item.viewCount,
            uploadDate: item.uploadDate,
            channelid: item.channel?.id,
            thumbnails: item.thumbnails?.[0]?.Highest?.url || null,
            description: item.description,
            channelname: item.channel?.name,
        }));
        if (minViews !== undefined) videos = videos.filter(video => (video.viewCount ?? 0) >= minViews);
        if (maxViews !== undefined) videos = videos.filter(video => (video.viewCount ?? 0) <= maxViews);
        if (orderBy) {
            if (orderBy === "viewCount") videos.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
            else if (orderBy === "date") videos.sort((a, b) => new Date(b.uploadDate ?? 0).getTime() - new Date(a.uploadDate ?? 0).getTime());
        }
        if (videos.length === 0) throw new Error(colors.red("@error: ") + " No videos found with the given criteria.");
        return videos;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(colors.red("@error: ") + " Argument validation failed: " + error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", "));
        else if (error instanceof Error) throw error;
        else throw new Error(colors.red("@error: ") + " An unexpected error occurred: " + String(error));
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
