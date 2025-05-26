import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/SanitizeContentItem";
const ZodSchema = z.object({ Cookies: z.string(), Verbose: z.boolean().optional(), Sort: z.enum(["oldest", "newest", "old-to-new", "new-to-old"]).optional() });
type HomeFeedOptions = z.infer<typeof ZodSchema>;
interface Short {
    title: string;
    videoId: string;
    thumbnails: {
        url: string;
        width: number;
        height: number;
    }[];
}
interface Video {
    type: string;
    title: string;
    videoId: string;
    description: string;
    thumbnails: {
        url: string;
        width: number;
        height: number;
    }[];
    authorId: string;
    authorName: string;
    authorThumbnails: {
        url: string;
        width: number;
        height: number;
    }[];
    authorBadges: {
        text: string;
    }[];
    authorUrl: string;
    viewCount: string;
    shortViewCount: string;
}
/**
 * @shortdesc Fetches a user's YouTube home feed, separating content into Shorts and Videos.
 *
 * @description This function retrieves a user's personalized home feed from YouTube by
 * authenticating with provided cookies. It processes the feed data to categorize items
 * into separate lists for YouTube Shorts and regular videos.
 *
 * Authentication is managed by an internal `TubeLogin` utility, which requires valid
 * YouTube authentication cookies to successfully access the home feed.
 *
 * The `Sort` option provides filtering capabilities for the retrieved feed items:
 * - `"oldest"`: Attempts to retrieve only the single oldest video and short in the home feed.
 * - `"newest"`: Attempts to retrieve only the single newest video and short in the home feed.
 * - `"old-to-new"`: Sorts items by their `videoId` in ascending lexicographical order.
 * - `"new-to-old"`: Sorts items by their `videoId` in descending lexicographical order.
 * Note: The "oldest" and "newest" sorting options are designed to extract only the single
 * oldest or newest item based on the internal structure of the home feed data.
 * The "old-to-new" and "new-to-old" sorts are based on string comparison of video IDs,
 * which may not directly correlate with chronological order in the dynamic home feed.
 *
 * @param {object} options - The configuration options for fetching the home feed.
 * @param {string} options.Cookies - Your YouTube authentication cookies. These are essential for authentication.
 * @param {boolean} [options.Verbose=false] - If true, enables verbose logging throughout the process.
 * @param {"oldest" | "newest" | "old-to-new" | "new-to-old"} [options.Sort] - An optional sorting order for the feed items.
 *
 * @returns {Promise<TubeResponse<{ Shorts: Short[]; Videos: Video[] }>>} A Promise that resolves to a `TubeResponse` object.
 * - On success (`status: "success"`), the `data` property contains an object with two arrays:
 * - `Shorts`: An array of `Short` objects, each containing `title`, `videoId`, and `thumbnails`.
 * - `Videos`: An array of `Video` objects, each containing comprehensive details like `title`, `videoId`, `description`, `thumbnails`, `author` information, and `viewCount`.
 * - On failure (`status: "error"`), an error message will be available.
 *
 * @throws {Error}
 * - Throws an `Error` if `Cookies` are not provided.
 * - Throws an `Error` if the internal Tube client fails to initialize (e.g., due to invalid cookies).
 * - Throws an `Error` if fetching the home feed from YouTube fails.
 * - Throws a `ZodError` if the provided options do not conform to the expected schema (e.g., `Sort` has an invalid enum value).
 * - Throws a generic `Error` for any other unexpected issues during execution.
 *
 * @example
 * // 1. Fetching basic home feed (default order, no sorting)
 * // Replace 'YOUR_YOUTUBE_COOKIES_STRING' with your actual YouTube authentication cookies.
 * // These can usually be obtained from your browser's developer tools when logged into YouTube.
 * try {
 * const myCookies = "YOUR_YOUTUBE_COOKIES_STRING";
 * const feed = await home_feed({ Cookies: myCookies });
 * console.log("Fetched Home Feed (Shorts):", feed.data?.Shorts);
 * console.log("Fetched Home Feed (Videos):", feed.data?.Videos);
 * } catch (error) {
 * console.error("Error fetching home feed:", error);
 * }
 *
 * @example
 * // 2. Fetching home feed with verbose logging enabled
 * // Replace 'YOUR_YOUTUBE_COOKIES_STRING' with your actual YouTube cookies.
 * try {
 * const myCookies = "YOUR_YOUTUBE_COOKIES_STRING";
 * const feed = await home_feed({ Cookies: myCookies, Verbose: true });
 * console.log("Fetched Home Feed (Verbose) (Shorts):", feed.data?.Shorts);
 * console.log("Fetched Home Feed (Verbose) (Videos):", feed.data?.Videos);
 * } catch (error) {
 * console.error("Error fetching home feed with verbose logging:", error);
 * }
 *
 * @example
 * // 3. Fetching home feed and attempting to get the single newest item
 * // This will return only the single most recent Short and Video found in the initial feed.
 * // Replace 'YOUR_YOUTUBE_COOKIES_STRING' with your actual YouTube cookies.
 * try {
 * const myCookies = "YOUR_YOUTUBE_COOKIES_STRING";
 * const feed = await home_feed({ Cookies: myCookies, Sort: "newest" });
 * console.log("Newest Home Feed Item (Shorts):", feed.data?.Shorts);
 * console.log("Newest Home Feed Item (Videos):", feed.data?.Videos);
 * } catch (error) {
 * console.error("Error fetching and sorting by newest:", error);
 * }
 *
 * @example
 * // 4. Fetching home feed and sorting all items by video ID from old-to-new
 * // This sorts all retrieved shorts and videos lexicographically by their video ID string.
 * // Replace 'YOUR_YOUTUBE_COOKIES_STRING' with your actual YouTube cookies.
 * try {
 * const myCookies = "YOUR_YOUTUBE_COOKIES_STRING";
 * const feed = await home_feed({ Cookies: myCookies, Sort: "old-to-new" });
 * console.log("Home Feed (Shorts) sorted old-to-new:", feed.data?.Shorts);
 * console.log("Home Feed (Videos) sorted old-to-new:", feed.data?.Videos);
 * } catch (error) {
 * console.error("Error fetching and sorting old-to-new:", error);
 * }
 */
export default async function home_feed(options: HomeFeedOptions): Promise<TubeResponse<{ Shorts: Short[]; Videos: Video[] }>> {
    let Verbose = false;
    try {
        ZodSchema.parse(options);
        const { Verbose: parsedVerbose, Cookies, Sort } = options;
        Verbose = parsedVerbose ?? false;
        if (!Cookies) throw new Error(`${colors.red("@error:")} Cookies not provided!`);
        const client: TubeType = await TubeLogin(Cookies);
        if (!client) throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        const homeFeed = await client.getHomeFeed();
        if (!homeFeed) throw new Error(`${colors.red("@error:")} Failed to fetch home feed.`);
        const result: TubeResponse<{ Shorts: Short[]; Videos: Video[] }> = { status: "success", data: { Shorts: [], Videos: [] } };
        homeFeed.contents?.contents?.forEach((section: any) => {
            if (section?.type === "RichItem" && section?.content?.type === "Video") {
                const sanitized = sanitizeContentItem(section);
                if (sanitized?.content) {
                    result.data?.Videos.push({
                        type: sanitized.content.type || "",
                        title: sanitized.content.title?.text || "",
                        videoId: sanitized.content.video_id || "",
                        description: sanitized.content.description_snippet?.text || "",
                        thumbnails: sanitized.content.thumbnails?.[0]?.Highest?.url || [],
                        authorId: sanitized.content.author?.id || "",
                        authorName: sanitized.content.author?.name || "",
                        authorThumbnails: sanitized.content.author.thumbnails || [],
                        authorBadges: sanitized.content.author.badges || [],
                        authorUrl: sanitized.content.author.url || "",
                        viewCount: sanitized.content.view_count?.text || "",
                        shortViewCount: sanitized.content.short_view_count?.text || "",
                    });
                }
            } else if (section?.type === "RichSection" && section?.content?.type === "RichShelf") {
                section.content.contents?.forEach((item: any) => {
                    if (item?.content?.type === "ShortsLockupView") {
                        const short = {
                            title: item.content.accessibility_text || "",
                            videoId: item.content.on_tap_endpoint?.payload?.videoId,
                            thumbnails: item.content.thumbnail?.Highest?.url || null,
                        };
                        result.data?.Shorts.push(short);
                    }
                });
            }
        });
        switch (Sort) {
            case "oldest":
                if (result.data?.Shorts) result.data.Shorts.splice(0, result.data.Shorts.length - 1);
                if (result.data?.Videos) result.data.Videos.splice(0, result.data.Videos.length - 1);
                break;
            case "newest":
                if (result.data?.Shorts) result.data.Shorts.splice(1);
                if (result.data?.Videos) result.data.Videos.splice(1);
                break;
            case "old-to-new":
                if (result.data?.Shorts)
                    result.data.Shorts.sort((a, b) => {
                        if (!a.videoId || !b.videoId) return 0;
                        return a.videoId.localeCompare(b.videoId);
                    });
                if (result.data?.Videos) result.data.Videos.sort((a, b) => a.videoId.localeCompare(b.videoId));
                break;
            case "new-to-old":
                if (result.data?.Shorts)
                    result.data.Shorts.sort((a, b) => {
                        if (!a.videoId || !b.videoId) return 0;
                        return b.videoId.localeCompare(a.videoId);
                    });
                if (result.data?.Videos) result.data.Videos.sort((a, b) => b.videoId.localeCompare(a.videoId));
                break;
        }
        return result;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw error;
        else throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
