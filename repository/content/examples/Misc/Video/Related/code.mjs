/**
 * @shortdesc Fetches related videos for a given YouTube video ID.
 * @description This function retrieves a list of videos that are related to a specified YouTube video ID. It uses the `youtubei` library to interact with the YouTube API and find relevant videos.
 *
 * The function requires a valid YouTube video ID.
 *
 * It supports the following configuration option:
 * - **videoId:** A string representing the YouTube video ID for which to find related videos. This is a mandatory parameter and must have a minimum length of 2 characters.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - "data": Emitted when related video data is successfully fetched and found. The emitted data is an array of objects, each representing a related video with properties like `id`, `title`, `isLive`, `duration`, `uploadDate`, and `thumbnails`.
 * - "error": Emitted when an error occurs at any stage, such as argument validation, issues with the YouTube API request, or if no related videos are found for the provided ID. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.videoId - The YouTube video ID. **Required**, minimum length 2.
 * @returns {EventEmitter} An EventEmitter instance for handling events during the related videos fetching process.
 *
 */

import YouTubeDLX from "yt-dlx";

// 1. Fetch related videos for a valid video ID
YouTubeDLX.Misc.Video.Related({ videoId: "dQw4w9WgXcQ" })
  .on("data", relatedVideos => console.log("Related Videos:", relatedVideos))
  .on("error", error => console.error("Error fetching related videos:", error));

// 2. Missing required 'videoId' parameter (will result in an error)
YouTubeDLX.Misc.Video.Related({}).on("error", error => console.error("Expected Error (missing videoId):", error));

// 3. 'videoId' parameter is too short (will result in a Zod error)
YouTubeDLX.Misc.Video.Related({ videoId: "a" }).on("error", error => console.error("Expected Error (short videoId):", error));

// 4. 'videoId' that might not exist or has no public related videos
YouTubeDLX.Misc.Video.Related({ videoId: "nonexistentvideoid123" }).on("error", error => console.error("Expected Error (no related videos found):", error));
// Note: The specific error message for this case is "@error: No related videos found for the provided video ID."

// 5. Handle potential API errors during fetching
// Note: This scenario depends on external factors like network issues or YouTube API changes.
// The error emitted would typically be prefixed with "@error: " followed by the API error message.
// YouTubeDLX.Misc.Video.Related({ videoId: "dQw4w9WgXcQ" }) // Assuming a scenario where the API call fails
// .on("error", (error) => console.error("Expected Error (API error):", error));
