import colors from "colors";
import { z, ZodError } from "zod";
import { EventEmitter } from "events";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/sanitizeContentItem";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional() });
/**
 * @shortdesc Fetches the user's YouTube subscriptions feed.
 *
 * @description This function retrieves the latest content from the channels a user is subscribed to, using their authentication cookies. It can optionally provide verbose logging to detail the fetching process.
 *
 * The function requires valid cookies for authentication to access the user's subscriptions feed.
 *
 * It supports the following configuration options:
 * - **Cookies:** The user's cookies as a string. This is a mandatory parameter required for authenticating the request.
 * - **Verbose:** An optional boolean value that, if true, enables detailed logging to the console, providing more information about the process of fetching and parsing the subscriptions feed.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - `"data"`: Emitted when the subscriptions feed data is successfully fetched and processed. The emitted data is an object containing the status and an array of content items from the feed.
 * - `"error"`: Emitted when an error occurs during any stage of the process, such as argument validation, cookie initialization, or network requests. The emitted data is the error message or object.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.cookies - The user's cookies as a string. **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 *
 * @returns {EventEmitter} An EventEmitter instance for handling events during subscriptions feed fetching.
 *
 * @example
 * // 1. Fetch subscriptions feed with provided cookies
 * const cookies = "YOUR_COOKIES_HERE";
 * YouTubeDLX.Account.SubscriptionsFeed({ cookies })
 * .on("data", (data) => console.log("Subscriptions Feed:", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 2. Fetch subscriptions feed with verbose logging
 * const cookies = "YOUR_COOKIES_HERE";
 * YouTubeDLX.Account.SubscriptionsFeed({ cookies, verbose: true })
 * .on("data", (data) => console.log("Subscriptions Feed:", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 3. Missing required 'cookies' parameter (will result in an error)
 * YouTubeDLX.Account.SubscriptionsFeed({} as any)
 * .on("error", (error) => console.error("Expected Error (missing cookies):", error));
 *
 * @example
 * // 4. Failed to initialize Tube client (e.g., invalid cookies)
 * // Note: This scenario depends on the internal TubeLogin logic.
 * // The error emitted would be: "@error: Could not initialize Tube client."
 * YouTubeDLX.Account.SubscriptionsFeed({ cookies: "INVALID_OR_EXPIRED_COOKIES" })
 * .on("error", (error) => console.error("Expected Error (client initialization failed):", error));
 *
 * @example
 * // 5. Failed to fetch subscriptions feed after client initialization
 * // Note: This is an internal error scenario, difficult to trigger via simple example.
 * // The error emitted would be: "@error: Failed to fetch subscriptions feed."
 * // YouTubeDLX.Account.SubscriptionsFeed({ cookies: "VALID_COOKIES_BUT_FETCH_FAILS" })
 * // .on("error", (error) => console.error("Expected Error (fetch failed):", error));
 *
 */
export default function subscriptions_feed(options: z.infer<typeof ZodSchema>): EventEmitter {
  const emitter = new EventEmitter();
  (async () => {
    try {
      ZodSchema.parse(options);
      const { verbose, cookies } = options;
      if (verbose) console.log(colors.green("@info:"), "Fetching subscriptions feed...");
      if (!cookies) {
        emitter.emit("error", `${colors.red("@error:")} cookies not provided!`);
        return;
      }
      const client: TubeType = await TubeLogin(cookies);
      if (!client) {
        emitter.emit("error", `${colors.red("@error:")} Could not initialize Tube client.`);
        return;
      }
      const feed = await client.getSubscriptionsFeed();
      if (!feed) {
        emitter.emit("error", `${colors.red("@error:")} Failed to fetch subscriptions feed.`);
        return;
      }
      const contents = (feed as any).contents?.map(sanitizeContentItem) || [];
      const result: TubeResponse<{ contents: any[] }> = { status: "success", data: { contents } };
      if (verbose) console.log(colors.green("@info:"), "Subscriptions feed fetched!");
      emitter.emit("data", result);
    } catch (error) {
      if (error instanceof ZodError) emitter.emit("error", `${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
      else if (error instanceof Error) emitter.emit("error", `${colors.red("@error:")} ${error.message}`);
      else emitter.emit("error", `${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
      console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
  })();
  return emitter;
}
