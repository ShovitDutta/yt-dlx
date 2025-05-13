/**
 * @shortdesc Fetches data for a YouTube playlist.
 * @description This function retrieves details about a YouTube playlist, including its title, video count, and a list of videos within the playlist. It requires a valid YouTube playlist link as input.
 *
 * The function takes the playlist link, extracts the playlist ID, and then uses the YouTube API (via the youtubei library) to fetch the playlist information and the list of videos it contains.
 *
 * It supports the following configuration options:
 * - **playlistLink:** A string containing the URL of the YouTube playlist. This is a mandatory parameter. The function will attempt to extract the playlist ID from this link.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - "data": Emitted when the playlist data is successfully fetched and processed. The emitted data is an object containing the playlist's ID, title, video count, and an array of video objects (each with id, title, isLive, duration, and thumbnails).
 * - "error": Emitted when an error occurs at any stage, such as argument validation, failure to extract the playlist ID from the link, or failure to fetch data from the YouTube API. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.playlistLink - The URL of the YouTube playlist. **Required**.
 * @returns {EventEmitter} An EventEmitter instance for handling events during playlist data fetching.
 *
 */

import YouTubeDLX from "yt-dlx";

// 1. Fetch data for a valid playlist link
const playlistLink = "https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID_HERE";
YouTubeDLX.Search.Playlist.Single({ playlistLink })
  .on("data", data => console.log("Playlist Data:", data))
  .on("error", error => console.error("Error:", error));

// 2. Missing required 'playlistLink' parameter (will result in a Zod error)
YouTubeDLX.Search.Playlist.Single({}).on("error", error => console.error("Expected Error (missing playlistLink):", error));

// 3. Invalid playlist link provided (fails YouTubeID extraction)
const invalidLink = "https://www.youtube.com/watch?v=SOME_VIDEO_ID"; // Not a playlist link
YouTubeDLX.Search.Playlist.Single({ playlistLink: invalidLink }).on("error", error => console.error("Expected Error (incorrect playlist link):", error));

// 4. Playlist data fetching fails (e.g., playlist is private or doesn't exist)
// Note: This scenario depends on the youtubei library's behavior for inaccessible/non-existent playlists.
// The error emitted would likely be: "@error: Unable to fetch playlist data." or an error from youtubei.
const nonExistentPlaylistLink = "https://www.youtube.com/playlist?list=NON_EXISTENT_PLAYLIST_ID_12345";
YouTubeDLX.Search.Playlist.Single({ playlistLink: nonExistentPlaylistLink }).on("error", error => console.error("Expected Error (unable to retrieve playlist information):", error));
