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
/**
 * @shortdesc Searches for YouTube videos based on a query with options for filtering by view count and sorting.
 *
 * @description This function performs a search for YouTube videos using a provided query.
 * It allows filtering the search results based on minimum and maximum view counts
 * and sorting the results by relevance, view count, rating, or upload date.
 * The function uses the `youtubei.js` library for the initial search.
 *
 * The function supports the following configuration options:
 * - **Query:** A string representing the search term for videos. Must be at least 2 characters long. **Required**.
 * - **MinViews:** An optional number specifying the minimum view count a video must have to be included in the results after the initial search.
 * - **MaxViews:** An optional number specifying the maximum view count a video can have to be included in the results after the initial search.
 * - **OrderBy:** An optional string to specify the sorting criteria for the results. Defaults to `"relevance"`.
 * - `"relevance"`: Sorts by relevance (handled by the initial search).
 * - `"viewCount"`: Sorts results in descending order of view count (most views first).
 * - `"rating"`: Sorts by rating (handled by the initial search).
 * - `"date"`: Sorts results in descending order of upload date (newest first).
 * *Note: Explicit sorting for "viewCount" and "date" is applied after fetching. "relevance" and "rating" rely on the underlying search client's default ordering or capabilities.*
 * - **Verbose:** An optional boolean value that, if true, enables verbose logging during the process. Defaults to `false`. (Note: Verbose logging is included in the Zod schema but not explicitly used in the provided function body).
 *
 * The function returns a Promise that resolves with an array of simplified video objects matching the criteria. Each video object contains properties like `id`, `title`, `viewCount`, `uploadDate`, `channelname`, `thumbnails`, etc.
 *
 * @param {object} options - The configuration options for the video search.
 * @param {string} options.query - The search query (minimum 2 characters). **Required**.
 * @param {number} [options.minViews] - Minimum view count filter.
 * @param {number} [options.maxViews] - Maximum view count filter.
 * @param {"relevance" | "viewCount" | "rating" | "date"} [options.orderBy="relevance"] - Sorting criteria.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 *
 * @returns {Promise<any[]>} A Promise that resolves with an array of video objects. Returns an empty array or throws an error if no videos match the criteria after filtering.
 * The video objects include: `id`, `title`, `isLive`, `duration`, `viewCount`, `uploadDate`, `channelid`, `thumbnails`, `description`, `channelname`.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing `query`, `query` is less than 2 characters, invalid value for `orderBy`, `minViews` or `maxViews` are not numbers).
 * - Throws an `Error` if the initial search yields no results or if no videos match the specified `minViews` or `maxViews` filters after the search.
 * - Throws a generic `Error` for any other unexpected issues during the search or processing.
 *
 * @example
 * // 1. Running Basic Video Search Example
 * try {
 * const result = await searchVideos({ query: "programming tutorials" });
 * console.log("Found Videos:", result);
 * } catch (error) {
 * console.error("Basic Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Search with Verbose Logging Example
 * try {
 * const result = await searchVideos({ query: "cats compilation", verbose: true });
 * console.log("Found Videos:", result);
 * } catch (error) {
 * console.error("Verbose Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Search with Minimum Views Example
 * try {
 * const result = await searchVideos({ query: "popular songs", minViews: 1000000 });
 * console.log("Videos with Over 1M Views:", result);
 * } catch (error) {
 * console.error("Min Views Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Search with Maximum Views Example
 * try {
 * const result = await searchVideos({ query: "new channels", maxViews: 1000 });
 * console.log("Videos with Under 1k Views:", result);
 * } catch (error) {
 * console.error("Max Views Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Running Search with View Range Example
 * try {
 * const result = await searchVideos({ query: "gaming highlights", minViews: 50000, maxViews: 500000 });
 * console.log("Videos with Views Between 50k and 500k:", result);
 * } catch (error) {
 * console.error("View Range Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Running Search Sorted by View Count Example (Descending)
 * try {
 * const result = await searchVideos({ query: "funny moments", orderBy: "viewCount" });
 * console.log("Videos Sorted by View Count:", result);
 * } catch (error) {
 * console.error("View Count Sort Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 7. Running Search Sorted by Date Example (Descending)
 * try {
 * const result = await searchVideos({ query: "latest news", orderBy: "date" });
 * console.log("Videos Sorted by Date:", result);
 * } catch (error) {
 * console.error("Date Sort Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 8. Running Search with Min Views and View Count Sort Example
 * try {
 * const result = await searchVideos({ query: "viral videos", minViews: 10000000, orderBy: "viewCount" });
 * console.log("Viral Videos Sorted by View Count:", result);
 * } catch (error) {
 * console.error("Min Views and Sort Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 9. Running Search with Max Views and Date Sort Example
 * try {
 * const result = await searchVideos({ query: "recent uploads", maxViews: 5000, orderBy: "date" });
 * console.log("Recent Uploads with Few Views, Sorted by Date:", result);
 * } catch (error) {
 * console.error("Max Views and Date Sort Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 10. Running Search with View Range and Date Sort Example
 * try {
 * const result = await searchVideos({ query: "documentaries", minViews: 10000, maxViews: 1000000, orderBy: "date" });
 * console.log("Documentaries within View Range, Sorted by Date:", result);
 * } catch (error) {
 * console.error("View Range and Date Sort Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 11. Running Search with Verbose, View Range, and View Count Sort Example
 * try {
 * const result = await searchVideos({ query: "music videos", verbose: true, minViews: 500000, maxViews: 5000000, orderBy: "viewCount" });
 * console.log("Music Videos (Verbose, Filtered, Sorted):", result);
 * } catch (error) {
 * console.error("Verbose, View Range, and Sort Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 12. Running Search with Relevance Sort Example (Default)
 * try {
 * const result = await searchVideos({ query: "how to knit", orderBy: "relevance" });
 * console.log("Videos Sorted by Relevance:", result);
 * } catch (error) {
 * console.error("Relevance Sort Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 13. Running Zod Validation Error Example (Missing Query - will throw ZodError)
 * try {
 * await searchVideos({} as any); // Using 'as any' to simulate missing required parameter
 * console.log("This should not be reached - Missing Query Example.");
 * } catch (error) {
 * console.error("Expected Error (Missing Query):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 14. Running Zod Validation Error Example (Short Query - will throw ZodError)
 * try {
 * await searchVideos({ query: "a" }); // Query is less than minimum length (2)
 * console.log("This should not be reached - Short Query Example.");
 * } catch (error) {
 * console.error("Expected Error (Query Too Short):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 15. Running Zod Validation Error Example (Invalid orderBy - will throw ZodError)
 * try {
 * await searchVideos({ query: "test", orderBy: "popular" as any }); // Invalid enum value
 * console.log("This should not be reached - Invalid orderBy Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Invalid orderBy):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 16. Running No Results Query Example (will throw Error after filter if initial search finds nothing)
 * // Use a query very unlikely to match any video.
 * try {
 * const result = await searchVideos({ query: "a query that should return no results 12345abcde" });
 * // If the underlying search client returns an empty list, this will throw.
 * console.log("Search Returned Videos:", result); // This line might not be reached
 * } catch (error) {
 * console.error("Expected Error (No Results Found):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 17. Running Extreme View Filter Example (will throw Error if no videos match filter)
 * try {
 * const result = await searchVideos({ query: "short video", minViews: 1000000000 });
 * console.log("Videos After Extreme Filtering:", result); // This line might not be reached if no videos match
 * } catch (error) {
 * console.error("Expected Error (No Videos After Filter):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 18. Example of an Unexpected Error during search (e.g., network issue, API change in youtubei.js)
 * // This is harder to trigger predictably with a simple example.
 * // try {
 * //    // Use a query or environment that might cause an unexpected issue with the internal client
 * //    await searchVideos({ query: "query causing internal error" });
 * // } catch (error) {
 * //    console.error("Expected Unexpected Error:", error instanceof Error ? error.message : error);
 * // }
 */
export default async function searchVideos({ query, minViews, maxViews, orderBy, verbose }: SearchVideosOptions): Promise<any[]> {
    try {
        ZodSchema.parse({ query, minViews, maxViews, orderBy, verbose });
        const youtube = new Client();
        const searchResults = await youtube.search(query, { type: "video" });
        let videos = searchResults.items.map((item: any) => ({
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
        if (minViews !== undefined) videos = videos.filter(video => video.viewCount >= minViews);
        if (maxViews !== undefined) videos = videos.filter(video => video.viewCount <= maxViews);
        if (orderBy) {
            if (orderBy === "viewCount") videos.sort((a, b) => b.viewCount - a.viewCount);
            else if (orderBy === "date") videos.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
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
