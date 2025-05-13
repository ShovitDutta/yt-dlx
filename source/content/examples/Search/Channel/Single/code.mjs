/**
 * @shortdesc Fetches data for a single YouTube channel.
 * @description This function retrieves detailed information about a specific YouTube channel using its link or ID. It utilizes the 'youtubei' library to interact with the YouTube API.
 *
 * The function requires the link or ID of the YouTube channel you want to fetch data for.
 *
 * It supports the following configuration options:
 * - **channelLink:** A string representing the link or ID of the YouTube channel. This is a mandatory parameter.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - "data": Emitted when the channel data is successfully fetched. The emitted data is an object containing detailed information about the channel.
 * - "error": Emitted when an error occurs during any stage of the process, such as argument validation or failure to fetch channel data. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.channelLink - The link or ID of the YouTube channel. **Required**.
 * @returns {EventEmitter} An EventEmitter instance for handling events during channel data fetching.
 *
 */

import YouTubeDLX from "yt-dlx";

// 1. Fetch data for a channel using its link
YouTubeDLX.Search.Channel.Single({ channelLink: "https://www.youtube.com/channel/UC-9-kyTW8ZkZNSB7LxqIENA" })
  .on("data", data => console.log("Channel Data:", data))
  .on("error", error => console.error("Error:", error));

// 2. Fetch data for a channel using its ID
YouTubeDLX.Search.Channel.Single({ channelLink: "UC-9-kyTW8ZkZNSB7LxqIENA" })
  .on("data", data => console.log("Channel Data:", data))
  .on("error", error => console.error("Error:", error));

// 3. Missing required 'channelLink' parameter (will result in an error)
YouTubeDLX.Search.Channel.Single({}).on("error", error => console.error("Expected Error (missing channelLink):", error));

// 4. Invalid 'channelLink' parameter (e.g., too short - will result in an error - Zod validation)
YouTubeDLX.Search.Channel.Single({ channelLink: "ab" }).on("error", error => console.error("Expected Error (invalid channelLink length):", error));

// 5. Channel not found or unable to fetch data for the provided link
// Note: This scenario depends on the 'youtubei' library's getChannel method behavior for invalid/non-existent links.
// The error emitted would be: "@error: Unable to fetch channel data for the provided link."
YouTubeDLX.Search.Channel.Single({ channelLink: "https://www.youtube.com/channel/NON_EXISTENT_CHANNEL_ID" }).on("error", error => console.error("Expected Error (channel not found):", error));
