import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/sanitizeContentItem";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional() });
type subscriptions_feedOptions = z.infer<typeof ZodSchema>;
interface Content {
    type: string;
    title: string;
    videoId: string;
    thumbnails: any[];
    description: string;
    authorId: string;
    authorName: string;
    authorThumbnails: any[];
    authorBadges: any[];
    authorUrl: string;
    viewCount: string;
    shortViewCount: string;
}
/**
 * @shortdesc Fetches the authenticated user's YouTube subscriptions feed.
 *
 * @description This function retrieves the personalized subscriptions feed for a user
 * authenticated using YouTube cookies. It lists recent videos from channels the user is subscribed to.
 * The fetched data is processed and returned as an array of content items (videos).
 *
 * This function requires valid cookies for authentication to access the user's subscriptions.
 *
 * The function supports the following configuration options:
 * - **Cookies:** The user's cookies as a string, required for authentication. **Required**.
 * - **Verbose:** An optional boolean flag that, if true, enables detailed console logging during the fetch and processing stages. Defaults to `false`.
 *
 * The function returns a Promise that resolves with a `TubeResponse` object containing the subscriptions feed data.
 * The data includes an array of `Content` objects, each representing a video from a subscription.
 * Each `Content` object provides details like video type, title, ID, thumbnails, description, author information, and view counts.
 *
 * @param {object} options - The configuration options for fetching the subscriptions feed.
 * @param {string} options.cookies - The YouTube authentication cookies as a string. **Required**.
 * @param {boolean} [options.verbose=false] - If set to true, enables verbose logging.
 *
 * @returns {Promise<TubeResponse<{ contents: Content[] }>>} A Promise that resolves with a `TubeResponse` object. The `data` property of this object contains a `contents` array.
 * Each item in the `contents` array is a `Content` object with properties such as `type`, `title`, `videoId`, `thumbnails`, `description`, `authorId`, `authorName`, `authorThumbnails`, `authorBadges`, `authorUrl`, `viewCount`, and `shortViewCount`.
 * The `TubeResponse` also includes a `status` field ('success' or 'error' implicitly handled by throwing).
 *
 * @typedef {object} Content
 * @property {string} type - The type of content (e.g., "Video").
 * @property {string} title - The title of the video.
 * @property {string} videoId - The ID of the video.
 * @property {any[]} thumbnails - An array of thumbnail objects for the video.
 * @property {string} description - A snippet of the video description.
 * @property {string} authorId - The channel ID of the author.
 * @property {string} authorName - The name of the channel author.
 * @property {any[]} authorThumbnails - An array of thumbnail objects for the author's channel.
 * @property {any[]} authorBadges - An array of badge objects for the author (e.g., verification).
 * @property {string} authorUrl - The URL of the author's channel.
 * @property {string} viewCount - The formatted view count of the video (e.g., "1.2M views").
 * @property {string} shortViewCount - A shorter formatted view count (e.g., "1.2M").
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing required `cookies`).
 * - Throws an `Error` if the `cookies` parameter is missing or empty (explicit check).
 * - Throws an `Error` if the internal Tube client fails to initialize using the provided cookies (e.g., invalid or expired cookies).
 * - Throws an `Error` if fetching the subscriptions feed from the initialized client fails.
 * - Throws a generic `Error` for any other unexpected issues during the process.
 *
 * @example
 * // 1. Running Basic Subscriptions Feed Fetch Example
 * // Replace 'YOUR_COOKIES_HERE' with your actual YouTube cookies.
 * const cookies = "YOUR_COOKIES_HERE";
 * try {
 * const result = await subscriptions_feed({ cookies });
 * console.log("Subscriptions Feed:", result.data.contents.slice(0, 5)); // Log first 5 items
 * } catch (error) {
 * console.error("Basic Fetch Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Subscriptions Feed Fetch with Verbose Logging Example
 * // Replace 'YOUR_COOKIES_HERE' with your actual YouTube cookies.
 * const cookies = "YOUR_COOKIES_HERE";
 * try {
 * const result = await subscriptions_feed({ cookies, verbose: true });
 * console.log("Subscriptions Feed (Verbose):", result.data.contents.slice(0, 5)); // Log first 5 items
 * } catch (error) {
 * console.error("Verbose Fetch Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Example of Missing Cookies (handled by explicit check - will throw Error)
 * try {
 * await subscriptions_feed({ cookies: "" });
 * } catch (error) {
 * console.error("Expected Error (Missing Cookies - Explicit Check):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Example of Zod Validation Error (Missing Cookies - will throw ZodError)
 * try {
 * await subscriptions_feed({} as any); // Using 'as any' to simulate missing required parameter for Zod
 * } catch (error) {
 * console.error("Expected Zod Error (Missing Cookies - Zod):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Example of Client Initialization Failure (e.g., invalid or expired cookies)
 * // Replace 'INVALID_OR_EXPIRED_COOKIES' with cookies that are known to be invalid.
 * try {
 * await subscriptions_feed({ cookies: "INVALID_OR_EXPIRED_COOKIES" });
 * } catch (error) {
 * console.error("Expected Error (Client Initialization Failed):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Example of Subscriptions Feed Fetch Failure
 * // This scenario depends on the client's getSubscriptionsFeed() method failing after initialization.
 * // It's harder to trigger predictably with just input options.
 * // try {
 * //    // Use cookies and conditions known to cause fetch failure
 * //    await subscriptions_feed({ cookies: "VALID_COOKIES_BUT_FETCH_FAILS" });
 * // } catch (error) {
 * //    console.error("Expected Error (Feed Fetch Failed):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 7. Example of an Unexpected Error during the process
 * // This would catch any errors not explicitly handled by the specific catches.
 * // try {
 * //    // Introduce a condition here that might cause an unexpected error (e.g., a null pointer if the data structure changes unexpectedly)
 * //    // await subscriptions_feed({ cookies: "..." });
 * // } catch (error) {
 * //    console.error("Expected Unexpected Error:", error instanceof Error ? error.message : error);
 * // }
 */
export default async function subscriptions_feed({ cookies, verbose }: subscriptions_feedOptions): Promise<TubeResponse<{ contents: Content[] }>> {
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
        const contents =
            (feed as any).contents?.map((item: any) => {
                const sanitized = sanitizeContentItem(item);
                return {
                    type: sanitized?.type || "",
                    title: sanitized?.title?.text || "",
                    videoId: sanitized?.videoId || "",
                    thumbnails: sanitized?.thumbnails || [],
                    description: sanitized?.description?.text || "",
                    authorId: sanitized?.author?.id || "",
                    authorName: sanitized?.author?.name || "",
                    authorThumbnails: sanitized?.author?.thumbnails || [],
                    authorBadges: sanitized?.author?.badges || [],
                    authorUrl: sanitized?.author?.url || "",
                    viewCount: sanitized?.view_count?.text || "",
                    shortViewCount: sanitized?.short_view_count?.text || "",
                };
            }) || [];
        const result: TubeResponse<{ contents: Content[] }> = { status: "success", data: { contents } };
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
