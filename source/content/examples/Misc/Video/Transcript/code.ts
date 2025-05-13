/**
 * @shortdesc Fetches the transcript of a YouTube video.
 * @description This function retrieves the available transcript (captions) for a given YouTube video link.
 * It requires a valid video link as input.
 *
 * The function requires the following configuration option:
 * - **videoLink:** A string representing the URL of the YouTube video from which to fetch the transcript. This is a mandatory parameter.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - "data": Emitted when the transcript data is successfully fetched and processed. The emitted data is an array of transcript segments.
 * - "error": Emitted when an error occurs at any stage, such as argument validation, providing an incorrect video link, or failure to retrieve the transcript. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.videoLink - The URL of the YouTube video. **Required**.
 * @returns {EventEmitter} An EventEmitter instance for handling events during transcript fetching.
 *
 */

import YouTubeDLX from "yt-dlx";

// 1. Fetch transcript for a valid video link
YouTubeDLX.Misc.Video.Transcript({ videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" })
  .on("data", transcript => console.log("Video Transcript:", transcript))
  .on("error", error => console.error("Error fetching transcript:", error));

// 2. Fetch transcript using a shortened video URL
YouTubeDLX.Misc.Video.Transcript({ videoLink: "https://youtu.be/dQw4w9WgXcQ" })
  .on("data", transcript => console.log("Video Transcript:", transcript))
  .on("error", error => console.error("Error fetching transcript:", error));

// 3. Missing required 'videoLink' parameter (will result in a Zod error)
YouTubeDLX.Misc.Video.Transcript({} as any).on("error", error => console.error("Expected Error (missing videoLink):", error));

// 4. Invalid 'videoLink' format (will result in an error from YouTubeID)
YouTubeDLX.Misc.Video.Transcript({ videoLink: "this is not a video link" }).on("error", error => console.error("Expected Error (incorrect video link):", error));

// 5. Video link for a video without a transcript
// Note: This scenario depends on the specific video.
// The error emitted would be: "@error: Unable to get transcript for this video!"
YouTubeDLX.Misc.Video.Transcript({ videoLink: "https://www.youtube.com/watch?v=VIDEO_ID_WITHOUT_TRANSCRIPT" }).on("error", error => console.error("Expected Error (no transcript available):", error));

// 6. An unexpected error occurs during fetching (e.g., network issue, API change)
// Note: This scenario simulates a potential internal error during the fetching process.
// The error emitted would be: "@error: " followed by the underlying error message.
// YouTubeDLX.Misc.Video.Transcript({ videoLink: "valid_link_but_fetch_fails" })
// .on("error", (error) => console.error("Expected Error (fetch failed):", error));
