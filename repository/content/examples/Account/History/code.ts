/**
 * @shortdesc Fetches the user's watch history, including videos and shorts, with optional sorting.
 * @description This function allows you to retrieve a user's watch history from the platform. It requires valid cookies for authentication and can fetch both regular videos and short videos from the history. The function supports optional verbose logging to provide more details during the process. Additionally, it offers various sorting options to organize the fetched history according to your needs.
 *
 * The function provides the following configuration options:
 * - **Cookies:** The user's cookies as a string. This is a mandatory parameter required for authenticating the request and accessing the watch history.
 * - **Verbose:** An optional boolean value that, if true, enables detailed logging to the console, providing more information about the steps taken during the history fetching process.
 * - **Sort:** An optional string specifying how the watch history should be sorted. Available options include:
 * - "oldest": Keeps only the oldest viewed video and the oldest viewed short in the history.
 * - "newest": Keeps only the newest viewed video and the newest viewed short in the history.
 * - "old-to-new": Sorts both videos and shorts by their video ID in ascending order, effectively showing the oldest watched items first.
 * - "new-to-old": Sorts both videos and shorts by their video ID in descending order, showing the newest watched items first.
 *
 * The function returns an EventEmitter instance that emits events during the history fetching process:
 * - "data": Emitted when the watch history data is successfully fetched and processed. The emitted data is an object containing the status and the fetched history, separated into `Shorts` and `Videos` arrays.
 * - "error": Emitted when an error occurs during any stage of the process, such as argument validation, cookie initialization, or network requests. The emitted data is the error message or object.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.cookies - The user's cookies as a string. **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 * @param {("oldest" | "newest" | "old-to-new" | "new-to-old")} [options.sort] - Specify how the watch history should be sorted.
 * @returns {EventEmitter} An EventEmitter instance for handling events during watch history fetching.
 *
 */

import YouTubeDLX from "yt-dlx";

// 1. Fetch watch history with provided cookies
YouTubeDLX.Account.History({ cookies: "YOUR_COOKIES_HERE" })
  .on("data", data => console.log("Watch History:", data))
  .on("error", error => console.error("Error:", error));

// 2. Fetch watch history with verbose logging
YouTubeDLX.Account.History({ cookies: "YOUR_COOKIES_HERE", verbose: true })
  .on("data", data => console.log("Watch History:", data))
  .on("error", error => console.error("Error:", error));

// 3. Fetch watch history and sort by oldest
YouTubeDLX.Account.History({ cookies: "YOUR_COOKIES_HERE", sort: "oldest" })
  .on("data", data => console.log("Oldest Watched:", data))
  .on("error", error => console.error("Error:", error));

// 4. Fetch watch history and keep only the newest watched items
YouTubeDLX.Account.History({ cookies: "YOUR_COOKIES_HERE", sort: "newest" })
  .on("data", data => console.log("Newest Watched:", data))
  .on("error", error => console.error("Error:", error));

// 5. Fetch watch history and sort from oldest to newest
YouTubeDLX.Account.History({ cookies: "YOUR_COOKIES_HERE", sort: "old-to-new" })
  .on("data", data => console.log("Watch History (Old to New):", data))
  .on("error", error => console.error("Error:", error));

// 6. Fetch watch history and sort from newest to oldest
YouTubeDLX.Account.History({ cookies: "YOUR_COOKIES_HERE", sort: "new-to-old" })
  .on("data", data => console.log("Watch History (New to Old):", data))
  .on("error", error => console.error("Error:", error));

// 7. Fetch watch history with verbose logging and sort by oldest
YouTubeDLX.Account.History({ cookies: "YOUR_COOKIES_HERE", verbose: true, sort: "oldest" })
  .on("data", data => console.log("Oldest Watched (Verbose):", data))
  .on("error", error => console.error("Error:", error));

// 8. Fetch watch history with verbose logging and keep only the newest watched items
YouTubeDLX.Account.History({ cookies: "YOUR_COOKIES_HERE", verbose: true, sort: "newest" })
  .on("data", data => console.log("Newest Watched (Verbose):", data))
  .on("error", error => console.error("Error:", error));

// 9. Fetch watch history with verbose logging and sort from oldest to newest
YouTubeDLX.Account.History({ cookies: "YOUR_COOKIES_HERE", verbose: true, sort: "old-to-new" })
  .on("data", data => console.log("Watch History (Old to New, Verbose):", data))
  .on("error", error => console.error("Error:", error));

// 10. Fetch watch history with verbose logging and sort from newest to oldest
YouTubeDLX.Account.History({ cookies: "YOUR_COOKIES_HERE", verbose: true, sort: "new-to-old" })
  .on("data", data => console.log("Watch History (New to Old, Verbose):", data))
  .on("error", error => console.error("Error:", error));
