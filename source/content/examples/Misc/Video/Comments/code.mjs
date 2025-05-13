/**
 * @shortdesc Fetches comments for a YouTube video based on a search query.
 * @description This function searches for a YouTube video using the provided query and, if a video is found, retrieves its comments. It provides the comments as a structured list. Optional verbose logging is available to show details about the search and fetching process.
 *
 * The function first searches for a video matching the `query` and then attempts to fetch comments for the first video found.
 *
 * It supports the following configuration options:
 * - **query:** A string representing the search query to find the video. This is a mandatory parameter and must be at least 2 characters long.
 * - **verbose:** An optional boolean value that, if true, enables detailed logging to the console, showing the search query, found video ID, and comment fetching progress.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - "data": Emitted when comments are successfully fetched and processed. The emitted data is an array of comment objects (`CommentType`).
 * - "error": Emitted when an error occurs at any stage, such as argument validation, no video found for the query, no comments found for the video, or internal library errors during search or fetching. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.query - The search query to find the video. Must be at least 2 characters long. **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 * @returns {EventEmitter} An EventEmitter instance for handling events during comment fetching.
 *
 */

import YouTubeDLX from "yt-dlx";

// 1. Fetch comments for a video by search query
YouTubeDLX.Misc.Video.Comments({ query: "video title or topic" })
  .on("data", comments => console.log("Comments:", comments))
  .on("error", error => console.error("Error:", error));

// 2. Fetch comments for a video by search query with verbose logging
YouTubeDLX.Misc.Video.Comments({ query: "another video query", verbose: true })
  .on("data", comments => console.log("Comments (Verbose):", comments))
  .on("error", error => console.error("Error:", error));

// 3. Missing required 'query' parameter (will result in an error - Zod validation)
YouTubeDLX.Misc.Video.Comments({}).on("error", error => console.error("Expected Error (missing query):", error));

// 4. 'query' parameter is too short (will result in an error - Zod validation)
YouTubeDLX.Misc.Video.Comments({ query: "a" }).on("error", error => console.error("Expected Error (query too short):", error));

// 5. Query finds no videos
// Note: Provide a query unlikely to return any YouTube videos.
YouTubeDLX.Misc.Video.Comments({ query: "very unlikely video search 1a2b3c4d5e" }).on("error", error => console.error("Expected Error (no videos found):", error));

// 6. Query finds a video but it has no comments
// Note: Finding a video with absolutely no comments might be difficult.
// The error emitted would be: "@error: No videos or comments found for the query" if fetchVideoComments returns null.
// Internally, fetchVideoComments first checks for comments array length and returns null if empty.
// YouTubeDLX.Misc.Video.Comments({ query: "a video known to have no comments" })
// .on("error", (error) => console.error("Expected Error (no comments found):", error));

// 7. An unexpected error occurs during the process (e.g., network issues, library errors)
// Note: This is a general catch-all error handler.
// The error emitted will vary depending on the cause.
// YouTubeDLX.Misc.Video.Comments({ query: "query that might cause an internal error" })
// .on("error", (error) => console.error("Expected Error (unexpected error):", error));
