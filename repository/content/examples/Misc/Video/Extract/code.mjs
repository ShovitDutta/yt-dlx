/**
 * @shortdesc Extracts comprehensive information about a YouTube video.
 * @description This function extracts detailed data for a given YouTube video, including its metadata, available audio and video formats, comments, and transcript. It uses multiple internal tools to gather this information based on a search query or video URL. Optional parameters allow for using Tor and enabling verbose logging.
 *
 * The function requires a search query or video URL. It compiles data from various sources into a single, comprehensive output.
 *
 * It supports the following configuration options:
 * - **query:** A string representing the search query or video URL of the video to extract information from. This is a mandatory parameter.
 * - **useTor:** An optional boolean value. If true, the function will attempt to use Tor for certain network requests (specifically, those made by the internal Tuber agent), enhancing anonymity.
 * - **verbose:** An optional boolean value. If true, enables detailed logging to the console throughout the extraction process, including fetching metadata, comments, and transcript.
 *
 * The function returns an EventEmitter instance that emits events during the extraction process:
 * - "data": Emitted when all requested information is successfully extracted and compiled. The emitted data is a comprehensive object containing video formats, detailed metadata, comments (if available), and the transcript (if available).
 * - "error": Emitted when an error occurs at any stage, such as argument validation, failure to retrieve initial video data, or issues fetching comments or the transcript. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.query - The search query or video URL. **Required**.
 * @param {boolean} [options.useTor=false] - Whether to use Tor for certain requests.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 * @returns {EventEmitter} An EventEmitter instance for handling events during the extraction process.
 *
 */

import YouTubeDLX from "yt-dlx";

// 1. Extract information for a video using a query
YouTubeDLX.Misc.Video.Extract({ query: "your search query or url" })
  .on("data", data => console.log("Video Data:", data))
  .on("error", error => console.error("Error:", error));

// 2. Extract information using a query and enable verbose logging
YouTubeDLX.Misc.Video.Extract({ query: "your search query or url", verbose: true })
  .on("data", data => console.log("Video Data (Verbose):", data))
  .on("error", error => console.error("Error:", error));

// 3. Extract information using a query and attempt to use Tor
YouTubeDLX.Misc.Video.Extract({ query: "your search query or url", useTor: true })
  .on("data", data => console.log("Video Data (with Tor):", data))
  .on("error", error => console.error("Error:", error));

// 4. Extract information using a query with both verbose logging and Tor
YouTubeDLX.Misc.Video.Extract({ query: "your search query or url", verbose: true, useTor: true })
  .on("data", data => console.log("Video Data (Verbose, with Tor):", data))
  .on("error", error => console.error("Error:", error));

// 5. Missing required 'query' parameter (will result in an error)
YouTubeDLX.Misc.Video.Extract({}).on("error", error => console.error("Expected Error (missing query):", error));

// 6. Query results in no engine data
// Note: This scenario depends on the internal Tuber function's behavior.
// You can simulate by providing a query that is unlikely to return results.
YouTubeDLX.Misc.Video.Extract({ query: "a query that should return no results 12345abcde" }).on("error", error => console.error("Expected Error (no engine data):", error));

// 7. Engine data missing metadata
// Note: This is an internal error scenario, difficult to trigger via simple example call.
// The error emitted would be: "@error: Metadata not found in the response!"

// 8. Failed to parse upload date (internal error)
// Note: This is an internal error scenario, unlikely with standard YouTube data.
// The error emitted would be: "@error: Failed to parse upload date: ..."

// 9. Failed to fetch comments
// Note: This can happen if comments are disabled or due to network issues during comment fetching.
// The `comments` property in the output will be null, and an error might be logged if verbose is true.
// The main emitter will only emit an error if the *entire* process fails critically before fetching comments/transcript.
// If comments fetching fails but the rest succeeds, the 'data' event will fire with `comments: null`.
// Example showing data event even if comments fail:
YouTubeDLX.Misc.Video.Extract({ query: "a video where comments are disabled" })
  .on("data", data => console.log("Video Data (comments null):", data.comments === null))
  .on("error", error => console.error("Error:", error)); // This error is less likely unless the main data fetch fails

// 10. Failed to fetch transcript
// Note: This can happen if subtitles/transcripts are not available for the video or due to network issues.
// The `transcript` property in the output will be null, and an error might be logged if verbose is true.
// Similar to comments, the main emitter will only emit an error if the entire process fails critically before fetching comments/transcript.
// If transcript fetching fails but the rest succeeds, the 'data' event will fire with `transcript: null`.
// Example showing data event even if transcript fails:
YouTubeDLX.Misc.Video.Extract({ query: "a video with no transcript" })
  .on("data", data => console.log("Video Data (transcript null):", data.transcript === null))
  .on("error", error => console.error("Error:", error)); // This error is less likely unless the main data fetch fails

// 11. An unexpected error occurs during processing
// Note: This is a catch-all for unforeseen errors. The emitted error message will vary.
// YouTubeDLX.Misc.Video.Extract({...})
// .on("error", (error) => console.error("Unexpected Error:", error)); // Emits "@error: An unexpected error occurred: ..."
