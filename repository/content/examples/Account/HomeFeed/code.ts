/**
 * @shortdesc Fetches the user's YouTube home feed.
 * @description This function retrieves the personalized home feed for a user using their authentication cookies. It can fetch both regular videos and short videos displayed on the home feed. Optional verbose logging is available, and the results can be sorted according to different criteria.
 *
 * The function requires valid cookies for authentication to access the user's home feed.
 *
 * It supports the following configuration options:
 * - **Cookies:** The user's cookies as a string. This is a mandatory parameter required for authenticating the request.
 * - **Verbose:** An optional boolean value that, if true, enables detailed logging to the console, providing more information about the process of fetching and parsing the home feed.
 * - **Sort:** An optional string specifying how the home feed items should be sorted or filtered. Available options include:
 * - "oldest": Keeps only the oldest video and the oldest short found in the fetched feed data.
 * - "newest": Keeps only the newest video and the newest short found in the fetched feed data.
 * - "old-to-new": Sorts both videos and shorts by their video ID in ascending order. Note: The concept of "oldest" or "newest" by video ID might not strictly align with publication date for home feed items, as the feed is curated. This sort orders by the internal video identifier.
 * - "new-to-old": Sorts both videos and shorts by their video ID in descending order. Similar note about sorting by video ID applies.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - "data": Emitted when the home feed data is successfully fetched and processed. The emitted data is an object containing the status and the fetched feed items, separated into `Shorts` and `Videos` arrays.
 * - "error": Emitted when an error occurs during any stage of the process, such as argument validation, cookie initialization, or network requests. The emitted data is the error message or object.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.cookies - The user's cookies as a string. **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 * @param {("oldest" | "newest" | "old-to-new" | "new-to-old")} [options.sort] - Specify how the home feed items should be sorted.
 * @returns {EventEmitter} An EventEmitter instance for handling events during home feed fetching.
 *
 */

import YouTubeDLX from "yt-dlx";

// 1. Fetch home feed with provided cookies
YouTubeDLX.Account.HomeFeed({ cookies: "YOUR_COOKIES_HERE" })
  .on("data", data => console.log("Home Feed:", data))
  .on("error", error => console.error("Error:", error));

// 2. Fetch home feed with verbose logging
YouTubeDLX.Account.HomeFeed({ cookies: "YOUR_COOKIES_HERE", verbose: true })
  .on("data", data => console.log("Home Feed:", data))
  .on("error", error => console.error("Error:", error));

// 3. Fetch home feed and keep only the oldest item of each type
YouTubeDLX.Account.HomeFeed({ cookies: "YOUR_COOKIES_HERE", sort: "oldest" })
  .on("data", data => console.log("Oldest Feed Items:", data))
  .on("error", error => console.error("Error:", error));

// 4. Fetch home feed and keep only the newest item of each type
YouTubeDLX.Account.HomeFeed({ cookies: "YOUR_COOKIES_HERE", sort: "newest" })
  .on("data", data => console.log("Newest Feed Items:", data))
  .on("error", error => console.error("Error:", error));

// 5. Fetch home feed and sort from oldest to newest by video ID
YouTubeDLX.Account.HomeFeed({ cookies: "YOUR_COOKIES_HERE", sort: "old-to-new" })
  .on("data", data => console.log("Home Feed (Old to New by ID):", data))
  .on("error", error => console.error("Error:", error));

// 6. Fetch home feed and sort from newest to oldest by video ID
YouTubeDLX.Account.HomeFeed({ cookies: "YOUR_COOKIES_HERE", sort: "new-to-old" })
  .on("data", data => console.log("Home Feed (New to Old by ID):", data))
  .on("error", error => console.error("Error:", error));

// 7. Fetch home feed with verbose logging and keep only the oldest item of each type
YouTubeDLX.Account.HomeFeed({ cookies: "YOUR_COOKIES_HERE", verbose: true, sort: "oldest" })
  .on("data", data => console.log("Oldest Feed Items (Verbose):", data))
  .on("error", error => console.error("Error:", error));

// 8. Fetch home feed with verbose logging and keep only the newest item of each type
YouTubeDLX.Account.HomeFeed({ cookies: "YOUR_COOKIES_HERE", verbose: true, sort: "newest" })
  .on("data", data => console.log("Newest Feed Items (Verbose):", data))
  .on("error", error => console.error("Error:", error));

// 9. Fetch home feed with verbose logging and sort from oldest to newest by video ID
YouTubeDLX.Account.HomeFeed({ cookies: "YOUR_COOKIES_HERE", verbose: true, sort: "old-to-new" })
  .on("data", data => console.log("Home Feed (Old to New by ID, Verbose):", data))
  .on("error", error => console.error("Error:", error));

// 10. Fetch home feed with verbose logging and sort from newest to oldest by video ID
YouTubeDLX.Account.HomeFeed({ cookies: "YOUR_COOKIES_HERE", verbose: true, sort: "new-to-old" })
  .on("data", data => console.log("Home Feed (New to Old by ID, Verbose):", data))
  .on("error", error => console.error("Error:", error));

// 11. Missing required 'cookies' parameter (will result in an error)
YouTubeDLX.Account.HomeFeed({} as any).on("error", error => console.error("Expected Error (missing cookies):", error));

// 12. Invalid 'sort' value (will result in an error - Zod validation)
YouTubeDLX.Account.HomeFeed({ cookies: "YOUR_COOKIES_HERE", sort: "invalid_sort" as any }).on("error", error => console.error("Expected Error (invalid sort):", error));

// 13. Failed to initialize Tube client (e.g., invalid cookies)
// Note: This scenario depends on the internal TubeLogin logic.
// The error emitted would be: "@error: Could not initialize Tube client."
YouTubeDLX.Account.HomeFeed({ cookies: "INVALID_OR_EXPIRED_COOKIES" }).on("error", error => console.error("Expected Error (client initialization failed):", error));

// 14. Failed to fetch home feed after client initialization
// Note: This is an internal error scenario, difficult to trigger via simple example.
// The error emitted would be: "@error: Failed to fetch home feed."
// YouTubeDLX.Account.HomeFeed({ cookies: "VALID_COOKIES_BUT_FETCH_FAILS" })
// .on("error", (error) => console.error("Expected Error (fetch failed):", error));
