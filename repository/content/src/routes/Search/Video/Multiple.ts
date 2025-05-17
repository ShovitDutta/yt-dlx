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
(async () => {
    try {
        console.log("--- Running Basic Video Search Example ---");
        const result = await searchVideos({ query: "programming tutorials" });
        console.log("Found Videos:", result);
    } catch (error) {
        console.error("Basic Search Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Search with Verbose Logging Example ---");
        const result = await searchVideos({ query: "cats compilation", verbose: true });
        console.log("Found Videos:", result);
    } catch (error) {
        console.error("Verbose Search Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Search with Minimum Views Example ---");
        const result = await searchVideos({ query: "popular songs", minViews: 1000000 });
        console.log("Videos with Over 1M Views:", result);
    } catch (error) {
        console.error("Min Views Search Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Search with Maximum Views Example ---");
        const result = await searchVideos({ query: "new channels", maxViews: 1000 });
        console.log("Videos with Under 1k Views:", result);
    } catch (error) {
        console.error("Max Views Search Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Search with View Range Example ---");
        const result = await searchVideos({ query: "gaming highlights", minViews: 50000, maxViews: 500000 });
        console.log("Videos with Views Between 50k and 500k:", result);
    } catch (error) {
        console.error("View Range Search Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Search Sorted by View Count Example ---");
        const result = await searchVideos({ query: "funny moments", orderBy: "viewCount" });
        console.log("Videos Sorted by View Count:", result);
    } catch (error) {
        console.error("View Count Sort Search Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Search Sorted by Date Example ---");
        const result = await searchVideos({ query: "latest news", orderBy: "date" });
        console.log("Videos Sorted by Date:", result);
    } catch (error) {
        console.error("Date Sort Search Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Search with Min Views and View Count Sort Example ---");
        const result = await searchVideos({ query: "viral videos", minViews: 10000000, orderBy: "viewCount" });
        console.log("Viral Videos Sorted by View Count:", result);
    } catch (error) {
        console.error("Min Views and Sort Search Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Search with Max Views and Date Sort Example ---");
        const result = await searchVideos({ query: "recent uploads", maxViews: 5000, orderBy: "date" });
        console.log("Recent Uploads with Few Views, Sorted by Date:", result);
    } catch (error) {
        console.error("Max Views and Date Sort Search Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Search with View Range and Date Sort Example ---");
        const result = await searchVideos({ query: "documentaries", minViews: 10000, maxViews: 1000000, orderBy: "date" });
        console.log("Documentaries within View Range, Sorted by Date:", result);
    } catch (error) {
        console.error("View Range and Date Sort Search Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Search with Verbose, View Range, and View Count Sort Example ---");
        const result = await searchVideos({ query: "music videos", verbose: true, minViews: 500000, maxViews: 5000000, orderBy: "viewCount" });
        console.log("Music Videos (Verbose, Filtered, Sorted):", result);
    } catch (error) {
        console.error("Verbose, View Range, and Sort Search Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Search with Relevance Sort Example ---");
        const result = await searchVideos({ query: "how to knit", orderBy: "relevance" });
        console.log("Videos Sorted by Relevance:", result);
    } catch (error) {
        console.error("Relevance Sort Search Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Missing Query Example ---");
        await searchVideos({} as any);
        console.log("This should not be reached - Missing Query Example.");
    } catch (error) {
        console.error("Expected Error (Missing Query):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Short Query Example ---");
        await searchVideos({ query: "a" });
        console.log("This should not be reached - Short Query Example.");
    } catch (error) {
        console.error("Expected Error (Query Too Short):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Invalid orderBy Example ---");
        await searchVideos({ query: "test", orderBy: "popular" as any });
        console.log("This should not be reached - Invalid orderBy Example.");
    } catch (error) {
        console.error("Expected Error (Invalid orderBy):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running No Results Query Example ---");
        const result = await searchVideos({ query: "a query that should return no results 12345abcde" });
        console.log("Search Returned No Videos:", result);
    } catch (error) {
        console.error("Expected Error (No Results):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Extreme View Filter Example ---");
        const result = await searchVideos({ query: "short video", minViews: 1000000000 });
        console.log("Videos After Extreme Filtering:", result);
    } catch (error) {
        console.error("Expected Error (No Videos After Filter):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
