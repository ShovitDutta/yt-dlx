import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/sanitizeContentItem";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional() });
type SubscriptionsFeedOptions = z.infer<typeof ZodSchema>;
/**
 * @shortdesc Fetches the user's YouTube subscriptions feed.
 *
 * @description This function retrieves the latest content from the channels the user is subscribed to,
 * authenticated via cookies. It processes the fetched feed and returns the contents.
 * Optional verbose logging can provide details during the process.
 *
 * Authentication is performed using the provided YouTube cookies, which are mandatory.
 * The fetched subscriptions feed data is returned as an array of sanitized content items.
 * The exact structure of items within the `contents` array can vary depending on the type of content
 * (e.g., videos, posts) and the structure returned by the YouTube API for subscription feeds.
 *
 * The function supports the following configuration options:
 * - **Cookies:** The user's cookies as a string, required for authentication.
 * - **Verbose:** An optional boolean flag that enables detailed console logging during the fetch and processing stages. Defaults to `false`.
 *
 * The function returns a Promise that resolves with an object containing the fetched and processed subscriptions feed data.
 *
 * @param {object} options - An object containing the configuration options for fetching the subscriptions feed.
 * @param {string} options.cookies - The YouTube authentication cookies as a string. **Required**.
 * @param {boolean} [options.verbose=false] - If set to true, enables verbose logging to the console.
 *
 * @returns {Promise<TubeResponse<{ contents: any[] }>>} A Promise that resolves with a `TubeResponse` object. The `TubeResponse`'s `data` property contains an object with a `contents` property, which is an array of sanitized feed items. The structure of items within the `contents` array depends on the content type in the feed.
 * The `TubeResponse` includes a `status` field indicating the outcome ('success' or 'error' implicitly handled by throwing).
 *
 * @throws {Error}
 * - Throws an `Error` if the `cookies` parameter is missing or empty.
 * - Throws a `ZodError` if the provided options fail schema validation.
 * - Throws an `Error` if the internal Tube client fails to initialize using the provided cookies.
 * - Throws an `Error` if fetching the subscriptions feed from the initialized client fails.
 * - Throws a generic `Error` for any other unexpected issues during the process.
 *
 * @example
 * // 1. Basic Subscriptions Feed Fetch
 * const cookies = "YOUR_COOKIES_HERE";
 * try {
 * const result = await subscriptionsFeed({ cookies });
 * console.log("Subscriptions Feed:", result);
 * } catch (error) {
 * console.error("Basic Subscriptions Feed Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Subscriptions Feed with Verbose Logging
 * const cookies = "YOUR_COOKIES_HERE";
 * try {
 * const result = await subscriptionsFeed({ cookies, verbose: true });
 * console.log("Subscriptions Feed:", result);
 * } catch (error) {
 * console.error("Verbose Subscriptions Feed Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Example of Missing Cookies (will throw an Error)
 * try {
 * await subscriptionsFeed({} as any);
 * } catch (error) {
 * console.error("Expected Error (Missing Cookies):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Example of Invalid Cookies (Client Initialization Failure)
 * // This scenario depends on the internal TubeLogin logic failing.
 * try {
 * await subscriptionsFeed({ cookies: "INVALID_OR_EXPIRED_COOKIES" });
 * } catch (error) {
 * console.error("Expected Error (Client Initialization Failed):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Example of Subscriptions Feed Fetch Failure
 * // This scenario depends on the client's getSubscriptionsFeed() method failing after initialization.
 * // It's harder to trigger predictably with just input options.
 * // try {
 * //    await subscriptionsFeed({ cookies: "VALID_COOKIES_BUT_FETCH_FAILS" });
 * // } catch (error) {
 * //    console.error("Expected Error (Subscriptions Feed Fetch Failed):", error instanceof Error ? error.message : error);
 * // }
 */
export default async function subscriptionsFeed({ cookies, verbose }: SubscriptionsFeedOptions): Promise<TubeResponse<{ contents: any[] }>> {
    try {
        ZodSchema.parse({ cookies, verbose });
        if (verbose) console.log(colors.green("@info:"), "Fetching subscriptions feed...");
        if (!cookies) {
            throw new Error(`${colors.red("@error:")} Cookies not provided!`);
        }
        const client: TubeType = await TubeLogin(cookies);
        if (!client) {
            throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        }
        const feed = await client.getSubscriptionsFeed();
        if (!feed) {
            throw new Error(`${colors.red("@error:")} Failed to fetch subscriptions feed.`);
        }
        const contents = (feed as any).contents?.map(sanitizeContentItem) || [];
        const result: TubeResponse<{ contents: any[] }> = { status: "success", data: { contents } };
        if (verbose) console.log(colors.green("@info:"), "Subscriptions feed fetched!");
        return result;
    } catch (error: any) {
        if (error instanceof ZodError) {
            const errorMessage = `${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        } else if (error instanceof Error) {
            console.error(error.message);
            throw error;
        } else {
            const unexpectedError = `${colors.red("@error:")} An unexpected error occurred: ${String(error)}`;
            console.error(unexpectedError);
            throw new Error(unexpectedError);
        }
    } finally {
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
(async () => {
    try {
        console.log("--- Running Basic Subscriptions Feed Example ---");
        const result = await subscriptionsFeed({ cookies: "YOUR_COOKIES_HERE" });
        console.log("Subscriptions Feed:", result);
    } catch (error) {
        console.error("Basic Subscriptions Feed Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Subscriptions Feed with Verbose Logging Example ---");
        const result = await subscriptionsFeed({ cookies: "YOUR_COOKIES_HERE", verbose: true });
        console.log("Subscriptions Feed:", result);
    } catch (error) {
        console.error("Verbose Subscriptions Feed Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Missing Cookies Example ---");
        await subscriptionsFeed({} as any);
        console.log("This should not be reached - Missing Cookies Example.");
    } catch (error) {
        console.error("Expected Error (Missing Cookies):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Invalid Cookies Example ---");
        await subscriptionsFeed({ cookies: "INVALID_OR_EXPIRED_COOKIES" });
        console.log("This should not be reached - Invalid Cookies Example.");
    } catch (error) {
        console.error("Expected Error (Client Initialization Failed):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
