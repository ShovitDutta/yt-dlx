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
/**
 * @shortdesc Searches for YouTube videos with filtering and sorting options.
 *
 * @description This function performs a search for YouTube videos based on a provided query.
 * It utilizes the `youtubei.js` library to execute the search.
 * The results can be filtered by minimum and maximum view counts and optionally sorted
 * by relevance, view count, rating, or upload date.
 *
 * It requires a valid search query string as input.
 *
 * The function supports the following configuration options:
 * - **Query:** A string representing the Youtube query. Must be at least 2 characters long. **Required**.
 * - **MinViews:** An optional number specifying the minimum view count a video must have to be included in the results.
 * - **MaxViews:** An optional number specifying the maximum view count a video can have to be included in the results.
 * - **Verbose:** An optional boolean value that, if true, enables detailed console logging during the process. Defaults to `false`. *Note: This parameter is accepted but not actively used for logging in the current function implementation.*
 * - **OrderBy:** An optional string specifying the order of the search results.
 * - `"relevance"`: Sort by relevance (default behavior of the underlying search).
 * - `"viewCount"`: Sort by view count in descending order.
 * - `"rating"`: Sort by rating (handled by the underlying search, not explicitly sorted post-fetch).
 * - `"date"`: Sort by upload date in descending order (newest first).
 * *Note: Sorting is explicitly implemented for "viewCount" and "date" after fetching; "relevance" and "rating" rely on the underlying search results order.*
 *
 * The function returns a Promise that resolves with an array of `VideoSearchResult` objects.
 *
 * @param {object} options - The configuration options for the video search.
 * @param {string} options.query - The Youtube query (minimum 2 characters). **Required**.
 * @param {number} [options.minViews] - Minimum view count filter.
 * @param {number} [options.maxViews] - Maximum view count filter.
 * @param {boolean} [options.verbose=false] - Enable verbose logging. (Currently not used in function logic).
 * @param {"relevance" | "viewCount" | "rating" | "date"} [options.orderBy] - Sorting criteria for the results.
 *
 * @returns {Promise<VideoSearchResult[]>} A Promise that resolves with an array of `VideoSearchResult` objects matching the criteria. Returns an empty array or throws an error if no videos are found.
 * Each `VideoSearchResult` object includes properties like `id`, `title`, `isLive`, `duration`, `viewCount`, `uploadDate`, `channelid`, `thumbnails`, `description`, and `channelname`.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing required `query`, `query` is less than 2 characters, invalid enum value for `orderBy`).
 * - Throws an `Error` if no videos are found matching the initial query or after applying the `minViews` and `maxViews` filters.
 * - Throws an `Error` for any underlying issues during the video search operation using the internal `youtubei.js` client.
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Running Basic Video Search Example
 * try {
 * const result = await searchVideos({ query: "programming tutorials" });
 * console.log("Search Results:", result);
 * console.log(`Found ${result.length} videos.`);
 * if (result.length > 0) {
 * console.log("First video title:", result[0].title);
 * }
 * } catch (error) {
 * console.error("Basic Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Video Search with Verbose Logging Example
 * try {
 * const result = await searchVideos({ query: "another video query", verbose: true });
 * console.log("Search Results (Verbose):", result);
 * console.log(`Found ${result.length} videos.`);
 * } catch (error) {
 * console.error("Verbose Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Video Search with Minimum Views Filter Example
 * try {
 * const result = await searchVideos({ query: "popular songs", minViews: 1000000 }); // Videos with at least 1 million views
 * console.log("Search Results (Min Views):", result);
 * console.log(`Found ${result.length} videos with at least 1M views.`);
 * } catch (error) {
 * console.error("Min Views Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Video Search with Maximum Views Filter Example
 * try {
 * const result = await searchVideos({ query: "recent uploads", maxViews: 10000 }); // Videos with at most 10,000 views
 * console.log("Search Results (Max Views):", result);
 * console.log(`Found ${result.length} videos with at most 10K views.`);
 * } catch (error) {
 * console.error("Max Views Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Running Video Search with View Range Filter Example
 * try {
 * const result = await searchVideos({ query: "tech reviews", minViews: 50000, maxViews: 500000 }); // Videos between 50K and 500K views
 * console.log("Search Results (View Range):", result);
 * console.log(`Found ${result.length} videos between 50K and 500K views.`);
 * } catch (error) {
 * console.error("View Range Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Running Video Search Sorted by View Count Example
 * try {
 * const result = await searchVideos({ query: "top trending", orderBy: "viewCount" }); // Should return highest view count first
 * console.log("Search Results (Sorted by View Count):", result);
 * console.log(`Found ${result.length} videos, sorted by view count.`);
 * } catch (error) {
 * console.error("Sort by View Count Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 7. Running Video Search Sorted by Date Example
 * try {
 * const result = await searchVideos({ query: "news updates", orderBy: "date" }); // Should return newest uploads first
 * console.log("Search Results (Sorted by Date):", result);
 * console.log(`Found ${result.length} videos, sorted by date.`);
 * } catch (error) {
 * console.error("Sort by Date Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 8. Running Zod Validation Error Example (Missing Query - will throw ZodError)
 * try {
 * await searchVideos({} as any); // Using 'as any' to simulate missing required parameter
 * } catch (error) {
 * console.error("Expected Zod Error (Missing Query):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 9. Running Zod Validation Error Example (Short Query - will throw ZodError)
 * try {
 * await searchVideos({ query: "a" }); // Query is less than minimum length (2)
 * } catch (error) {
 * console.error("Expected Zod Error (Query Too Short):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 10. Running Zod Validation Error Example (Invalid OrderBy Value - will throw ZodError)
 * try {
 * await searchVideos({ query: "videos", orderBy: "popular" as any }); // "popular" is not a valid enum value
 * } catch (error) {
 * console.error("Expected Zod Error (Invalid OrderBy):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 11. Running Example Where No Videos Are Found for the Query (will throw Error)
 * // Use a query very unlikely to match any video.
 * try {
 * await searchVideos({ query: "very unlikely video search 1a2b3c4d5e f6g7h8i9j0" });
 * } catch (error) {
 * console.error("Expected Error (No Videos Found for Query):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 12. Running Example Where All Videos Are Filtered Out (will throw Error)
 * // Use a query and view filter that guarantees no videos will match.
 * try {
 * await searchVideos({ query: "short clips", minViews: 1000000000000 }); // Filter for an extremely high view count
 * } catch (error) {
 * console.error("Expected Error (No Videos Found After Filtering):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 13. Example of an Unexpected Error during search (e.g., network issue, API change)
 * // This is harder to trigger predictably with a simple example.
 * // try {
 * //    // Use a query that might somehow cause an unexpected issue with the internal client
 * //    await searchVideos({ query: "query causing internal error" });
 * // } catch (error) {
 * //    console.error("Expected Unexpected Error:", error instanceof Error ? error.message : error);
 * // }
 */
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
