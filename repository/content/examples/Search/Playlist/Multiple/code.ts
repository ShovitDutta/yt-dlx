/**
 * @shortdesc Searches for YouTube playlists based on a query string.
 * @description This function performs a search on YouTube for playlists using a given query string. It returns the data of the first playlist found in the search results. Note that this function is intended for searching by keywords, not for fetching data of a known playlist ID or URL; use the `playlist_data()` function for that purpose.
 *
 * The function requires a search query string.
 *
 * It supports the following configuration options:
 * - **playlistLink:** A string representing the search query for playlists. Despite the parameter name, this should be a search term (e.g., "lofi hip hop playlist"), not a playlist URL or ID. This is a mandatory parameter with a minimum length of 2 characters.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - "data": Emitted when a playlist is successfully found based on the query. The emitted data is an object containing details about the first matching playlist, including its ID, title, video count, and thumbnails.
 * - "error": Emitted when an error occurs at any stage, such as argument validation, if the input is detected as a playlist ID, if no playlists are found for the query, or if there is an internal search or data retrieval issue. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.playlistLink - The search query string for playlists. **Required**.
 * @returns {EventEmitter} An EventEmitter instance for handling events during the playlist search.
 *
 */

import YouTubeDLX from "yt-dlx";

// 1. Search for playlists using a query string
YouTubeDLX.Search.Playlist.Multiple({ playlistLink: "lofi hip hop" })
  .on("data", data => console.log("First Playlist Found:", data))
  .on("error", error => console.error("Error:", error));

// 2. Search for playlists using a different query string
YouTubeDLX.Search.Playlist.Multiple({ playlistLink: "workout music" })
  .on("data", data => console.log("First Playlist Found:", data))
  .on("error", error => console.error("Error:", error));

// 3. Provide a query that is too short (will result in a Zod error)
YouTubeDLX.Search.Playlist.Multiple({ playlistLink: "a" } as any).on("error", error => console.error("Expected Error (short query):", error));

// 4. Provide a playlist URL or ID instead of a search query (will result in an error)
YouTubeDLX.Search.Playlist.Multiple({ playlistLink: "https://www.youtube.com/playlist?list=SOME_PLAYLIST_ID" }).on("error", error => console.error("Expected Error (input is playlist link):", error));

// 5. Provide a query that yields no playlist results
YouTubeDLX.Search.Playlist.Multiple({ playlistLink: "a query with no playlist results 12345xyz" }).on("error", error => console.error("Expected Error (no playlists found):", error));

// 6. Missing required 'playlistLink' parameter (will result in a Zod error)
YouTubeDLX.Search.Playlist.Multiple({} as any).on("error", error => console.error("Expected Error (missing playlistLink):", error));

// 7. An internal search or data retrieval error occurs
// Note: This is an internal error scenario, difficult to trigger directly via a simple example call.
// The errors emitted could include: "Engine error: ...", "Unable to retrieve a response from the engine.", "Metadata was not found...", "Unable to get playlist data."
// YouTubeDLX.Search.Playlist.Multiple({ playlistLink: "query that causes internal error" })
// .on("error", (error) => console.error("Expected Error (internal search error):", error));
