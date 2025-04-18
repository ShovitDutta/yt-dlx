import { z } from "zod";
import { EventEmitter } from "events";
declare const ZodSchema: z.ZodObject<{
    cookies: z.ZodString;
    verbose: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    cookies: string;
    verbose?: boolean | undefined;
}, {
    cookies: string;
    verbose?: boolean | undefined;
}>;
/**
 * @shortdesc Fetches the count of unseen YouTube notifications for the user.
 *
 * @description This function retrieves the number of unseen notifications for a user using their authentication cookies. It can optionally provide verbose logging to detail the fetching process.
 *
 * The function requires valid cookies for authentication to access the user's notification information.
 *
 * It supports the following configuration options:
 * - **Cookies:** The user's cookies as a string. This is a mandatory parameter required for authenticating the request.
 * - **Verbose:** An optional boolean value that, if true, enables detailed logging to the console, providing more information about the process of fetching the notification count.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - `"data"`: Emitted when the unseen notification count is successfully fetched. The emitted data is an object containing the status and the fetched count.
 * - `"error"`: Emitted when an error occurs during any stage of the process, such as argument validation, cookie initialization, or network requests. The emitted data is the error message or object.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.cookies - The user's cookies as a string. **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 *
 * @returns {EventEmitter} An EventEmitter instance for handling events during notification count fetching.
 *
 * @example
 * // 1. Fetch unseen notifications count with provided cookies
 * const cookies = "YOUR_COOKIES_HERE";
 * YouTubeDLX.Account.UnseenNotifications({ cookies })
 * .on("data", (data) => console.log("Unseen Notifications Count:", data.data.count))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 2. Fetch unseen notifications count with verbose logging
 * const cookies = "YOUR_COOKIES_HERE";
 * YouTubeDLX.Account.UnseenNotifications({ cookies, verbose: true })
 * .on("data", (data) => console.log("Unseen Notifications Count (Verbose):", data.data.count))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 3. Missing required 'cookies' parameter (will result in an error)
 * YouTubeDLX.Account.UnseenNotifications({} as any)
 * .on("error", (error) => console.error("Expected Error (missing cookies):", error));
 *
 * @example
 * // 4. Failed to initialize Tube client (e.g., invalid cookies)
 * // Note: This scenario depends on the internal TubeLogin logic.
 * // The error emitted would be: "@error: Could not initialize Tube client."
 * YouTubeDLX.Account.UnseenNotifications({ cookies: "INVALID_OR_EXPIRED_COOKIES" })
 * .on("error", (error) => console.error("Expected Error (client initialization failed):", error));
 *
 * @example
 * // 5. Failed to fetch unseen notifications count after client initialization
 * // Note: This is an internal error scenario, difficult to trigger via simple example.
 * // The error emitted would be: "@error: Failed to fetch unseen notifications count."
 * // YouTubeDLX.Account.UnseenNotifications({ cookies: "VALID_COOKIES_BUT_FETCH_FAILS" })
 * // .on("error", (error) => console.error("Expected Error (fetch failed):", error));
 *
 */
export default function unseen_notifications(options: z.infer<typeof ZodSchema>): EventEmitter;
export {};
//# sourceMappingURL=UnseenNotifications.d.ts.map