import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/SanitizeContentItem";
const ZodSchema = z.object({ Cookies: z.string(), Verbose: z.boolean().optional() });
type subscriptions_feedOptions = z.infer<typeof ZodSchema>;
interface Content {
    type: string;
    title: string;
    videoId: string;
    authorId: string;
    authorUrl: string;
    viewCount: string;
    authorName: string;
    description: string;
    authorBadges: {
        text: string;
    }[];
    shortViewCount: string;
    thumbnails: {
        url: string;
        width: number;
        height: number;
    }[];
    authorThumbnails: {
        url: string;
        width: number;
        height: number;
    }[];
}
/**
 * @shortdesc Fetches a user's YouTube subscriptions feed.
 *
 * @description This function retrieves the latest videos and content from a user's YouTube subscriptions.
 * It authenticates using provided cookies and processes the raw feed data into a structured format.
 *
 * Authentication is handled by an internal `TubeLogin` utility, which requires valid
 * YouTube authentication cookies to successfully access the subscriptions feed.
 *
 * The function returns a list of `Content` objects, each representing a video or other
 * subscription item, including details like title, video ID, author information,
 * thumbnails, and view counts.
 *
 * @param {object} options - The configuration options for fetching the subscriptions feed.
 * @param {string} options.Cookies - Your YouTube authentication cookies. These are essential for authentication.
 * @param {boolean} [options.Verbose=false] - If true, enables verbose logging throughout the process.
 *
 * @returns {Promise<TubeResponse<{ contents: Content[] }>>} A Promise that resolves to a `TubeResponse` object.
 * - On success (`status: "success"`), the `data` property contains an object with a `contents` array:
 * - `contents`: An array of `Content` objects, each representing an item from the subscriptions feed.
 * - On failure (`status: "error"`), an error message will be available.
 *
 * @throws {Error}
 * - Throws an `Error` if `Cookies` are not provided.
 * - Throws an `Error` if the internal Tube client fails to initialize (e.g., due to invalid cookies).
 * - Throws an `Error` if fetching the subscriptions feed from YouTube fails.
 * - Throws a `ZodError` if the provided options do not conform to the expected schema.
 * - Throws a generic `Error` for any other unexpected issues during execution.
 *
 * @example
 * // 1. Fetching the basic subscriptions feed
 * // Replace 'YOUR_YOUTUBE_COOKIES_STRING' with your actual YouTube authentication cookies.
 * // You can typically obtain these from your browser's developer tools when logged into YouTube.
 * try {
 * const myCookies = "YOUR_YOUTUBE_COOKIES_STRING";
 * const feed = await subscriptions_feed({ Cookies: myCookies });
 * console.log("Fetched Subscriptions Feed Contents:", feed.data?.contents);
 * } catch (error) {
 * console.error("Error fetching subscriptions feed:", error);
 * }
 *
 * @example
 * // 2. Fetching the subscriptions feed with verbose logging enabled
 * // Replace 'YOUR_YOUTUBE_COOKIES_STRING' with your actual YouTube cookies.
 * try {
 * const myCookies = "YOUR_YOUTUBE_COOKIES_STRING";
 * const feed = await subscriptions_feed({ Cookies: myCookies, Verbose: true });
 * console.log("Fetched Subscriptions Feed (Verbose) Contents:", feed.data?.contents);
 * } catch (error) {
 * console.error("Error fetching subscriptions feed with verbose logging:", error);
 * }
 */
export default async function subscriptions_feed({ Cookies, Verbose = false }: subscriptions_feedOptions): Promise<TubeResponse<{ contents: Content[] }>> {
    try {
        ZodSchema.parse({ Cookies, Verbose });
        if (Verbose) console.log(colors.green("@info:"), "Fetching subscriptions feed...");
        if (!Cookies) throw new Error(`${colors.red("@error:")} Cookies not provided!`);
        const client: TubeType = await TubeLogin(Cookies);
        if (!client) throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        const feed = await client.getSubscriptionsFeed();
        if (!feed) throw new Error(`${colors.red("@error:")} Failed to fetch subscriptions feed.`);
        const contents =
            (feed as any).contents?.map((item: any) => {
                const sanitized = sanitizeContentItem(item);
                return {
                    type: sanitized?.type || "",
                    title: sanitized?.title?.text || "",
                    videoId: sanitized?.videoId || "",
                    thumbnails: sanitized?.thumbnails?.[0]?.Highest?.url || [],
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
        return result;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw error;
        else throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
