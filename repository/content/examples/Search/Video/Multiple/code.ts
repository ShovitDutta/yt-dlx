/**
 * @shortdesc Searches for YouTube videos with filtering and sorting options.
 * @description This function performs a video search on YouTube based on a provided query. It allows filtering results by minimum and maximum view counts and sorting the results by view count or upload date.
 *
 * The function requires a search query.
 *
 * It supports the following configuration options:
 * - **query:** A string representing the search term for videos. This is a mandatory parameter and must be at least 2 characters long.
 * - **minViews:** An optional number specifying the minimum view count a video must have to be included in the results.
 * - **maxViews:** An optional number specifying the maximum view count a video can have to be included in the results.
 * - **verbose:** An optional boolean value that, if true, enables detailed logging to the console during the search and processing.
 * - **orderBy:** An optional string specifying how the search results should be sorted. Available options are:
 * - "relevance": (Handled by the underlying search library, explicit sorting by this function is not applied).
 * - "viewCount": Sorts videos by view count in descending order (highest view count first).
 * - "rating": (Handled by the underlying search library, explicit sorting by this function is not applied).
 * - "date": Sorts videos by upload date in descending order (newest first).
 * If no `orderBy` is specified, results are typically ordered by relevance by the underlying search library.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - "data": Emitted when the search is successful and results are processed. The emitted data is an array of video objects matching the criteria.
 * - "error": Emitted when an error occurs during any stage, such as argument validation, search request failure, or if no videos are found matching the specified criteria. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.query - The search term. **Required**, min 2 characters.
 * @param {number} [options.minViews] - Minimum view count filter.
 * @param {number} [options.maxViews] - Maximum view count filter.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 * @param {("relevance" | "viewCount" | "rating" | "date")} [options.orderBy] - Specify the sorting order. Implemented sorts are by `viewCount` (desc) and `date` (desc).
 * @returns {EventEmitter} An EventEmitter instance for handling events during the video search.
 *
 */

import YouTubeDLX from "yt-dlx";

// 1. Basic video search
YouTubeDLX.Search.Video.Multiple({ query: "programming tutorials" })
  .on("data", videos => console.log("Found videos:", videos))
  .on("error", error => console.error("Error:", error));

// 2. Search with verbose logging
YouTubeDLX.Search.Video.Multiple({ query: "cats compilation", verbose: true })
  .on("data", videos => console.log("Found videos:", videos))
  .on("error", error => console.error("Error:", error));

// 3. Search and filter by minimum views
YouTubeDLX.Search.Video.Multiple({ query: "popular songs", minViews: 1000000 })
  .on("data", videos => console.log("Videos with over 1M views:", videos))
  .on("error", error => console.error("Error:", error));

// 4. Search and filter by maximum views
YouTubeDLX.Search.Video.Multiple({ query: "new channels", maxViews: 1000 })
  .on("data", videos => console.log("Videos with under 1k views:", videos))
  .on("error", error => console.error("Error:", error));

// 5. Search and filter by a range of views
YouTubeDLX.Search.Video.Multiple({ query: "gaming highlights", minViews: 50000, maxViews: 500000 })
  .on("data", videos => console.log("Videos with views between 50k and 500k:", videos))
  .on("error", error => console.error("Error:", error));

// 6. Search and sort by view count (highest first)
YouTubeDLX.Search.Video.Multiple({ query: "funny moments", orderBy: "viewCount" })
  .on("data", videos => console.log("Videos sorted by view count:", videos))
  .on("error", error => console.error("Error:", error));

// 7. Search and sort by date (newest first)
YouTubeDLX.Search.Video.Multiple({ query: "latest news", orderBy: "date" })
  .on("data", videos => console.log("Videos sorted by date:", videos))
  .on("error", error => console.error("Error:", error));

// 8. Search, filter by minimum views, and sort by view count
YouTubeDLX.Search.Video.Multiple({ query: "viral videos", minViews: 10000000, orderBy: "viewCount" })
  .on("data", videos => console.log("Viral videos sorted by view count:", videos))
  .on("error", error => console.error("Error:", error));

// 9. Search, filter by maximum views, and sort by date
YouTubeDLX.Search.Video.Multiple({ query: "recent uploads", maxViews: 5000, orderBy: "date" })
  .on("data", videos => console.log("Recent uploads with few views, sorted by date:", videos))
  .on("error", error => console.error("Error:", error));

// 10. Search, filter by view range, and sort by date
YouTubeDLX.Search.Video.Multiple({ query: "documentaries", minViews: 10000, maxViews: 1000000, orderBy: "date" })
  .on("data", videos => console.log("Documentaries within view range, sorted by date:", videos))
  .on("error", error => console.error("Error:", error));

// 11. Search with verbose logging, filter by view range, and sort by view count
YouTubeDLX.Search.Video.Multiple({ query: "music videos", verbose: true, minViews: 500000, maxViews: 5000000, orderBy: "viewCount" })
  .on("data", videos => console.log("Music videos (verbose, filtered, sorted):", videos))
  .on("error", error => console.error("Error:", error));

// 12. Search with orderBy set to "relevance" (note: explicit sorting by this function is not applied)
YouTubeDLX.Search.Video.Multiple({ query: "how to knit", orderBy: "relevance" })
  .on("data", videos => console.log("Videos sorted by relevance (default):", videos))
  .on("error", error => console.error("Error:", error));

// 13. Missing required 'query' parameter (will result in an error)
YouTubeDLX.Search.Video.Multiple({} as any).on("error", error => console.error("Expected Error (missing query):", error));

// 14. 'query' parameter too short (will result in an error - Zod validation)
YouTubeDLX.Search.Video.Multiple({ query: "a" }).on("error", error => console.error("Expected Error (query too short):", error));

// 15. Invalid 'orderBy' value (will result in an error - Zod validation)
YouTubeDLX.Search.Video.Multiple({ query: "test", orderBy: "popular" as any }).on("error", error => console.error("Expected Error (invalid orderBy):", error));

// 16. Search query returns no results from the YouTube API
// Note: This depends on the underlying search API's response.
YouTubeDLX.Search.Video.Multiple({ query: "a query that should return no results 12345abcde" })
  .on("data", videos => console.log("Search returned no videos:", videos)) // Might return empty array
  .on("error", error => console.error("Error:", error)); // Or might emit error if API fails

// 17. Search returns results, but none match the view count filters
YouTubeDLX.Search.Video.Multiple({ query: "short video", minViews: 1000000000 })
  .on("data", videos => console.log("Videos after extreme filtering:", videos)) // Will likely be empty
  .on("error", error => console.error("Expected Error (no videos after filter):", error)); // Emits if video list is empty after filtering

// 18. Underlying YouTube API search fails
// Note: This is an internal error scenario, difficult to trigger via simple example.
// The error emitted would be related to the search request failure.
// YouTubeDLX.Search.Video.Multiple({ query: "test" })
// .on("error", (error) => console.error("Expected Error (search API failed):", error));
