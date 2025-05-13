/**
 * @shortdesc Fetches the user's YouTube subscriptions feed.
 * @description This function retrieves the latest content from the channels a user is subscribed to, using their authentication cookies. It can optionally provide verbose logging to detail the fetching process.
 *
 * The function requires valid cookies for authentication to access the user's subscriptions feed.
 *
 * It supports the following configuration options:
 * - **Cookies:** The user's cookies as a string. This is a mandatory parameter required for authenticating the request.
 * - **Verbose:** An optional boolean value that, if true, enables detailed logging to the console, providing more information about the process of fetching and parsing the subscriptions feed.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - "data": Emitted when the subscriptions feed data is successfully fetched and processed. The emitted data is an object containing the status and an array of content items from the feed.
 * - "error": Emitted when an error occurs during any stage of the process, such as argument validation, cookie initialization, or network requests. The emitted data is the error message or object.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.cookies - The user's cookies as a string. **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 * @returns {EventEmitter} An EventEmitter instance for handling events during subscriptions feed fetching.
 *
 */

import YouTubeDLX from "yt-dlx";

// 1. Fetch subscriptions feed with provided cookies
YouTubeDLX.Account.SubscriptionsFeed({ cookies: "YOUR_COOKIES_HERE" })
  .on("data", data => console.log("Subscriptions Feed:", data))
  .on("error", error => console.error("Error:", error));

// 2. Fetch subscriptions feed with verbose logging
YouTubeDLX.Account.SubscriptionsFeed({ cookies: "YOUR_COOKIES_HERE", verbose: true })
  .on("data", data => console.log("Subscriptions Feed:", data))
  .on("error", error => console.error("Error:", error));

// 3. Missing required 'cookies' parameter (will result in an error)
YouTubeDLX.Account.SubscriptionsFeed({}).on("error", error => console.error("Expected Error (missing cookies):", error));

// 4. Failed to initialize Tube client (e.g., invalid cookies)
// Note: This scenario depends on the internal TubeLogin logic.
// The error emitted would be: "@error: Could not initialize Tube client."
YouTubeDLX.Account.SubscriptionsFeed({ cookies: "INVALID_OR_EXPIRED_COOKIES" }).on("error", error => console.error("Expected Error (client initialization failed):", error));

// 5. Failed to fetch subscriptions feed after client initialization
// Note: This is an internal error scenario, difficult to trigger via simple example.
// The error emitted would be: "@error: Failed to fetch subscriptions feed."
// YouTubeDLX.Account.SubscriptionsFeed({ cookies: "VALID_COOKIES_BUT_FETCH_FAILS" })
// .on("error", (error) => console.error("Expected Error (fetch failed):", error));
