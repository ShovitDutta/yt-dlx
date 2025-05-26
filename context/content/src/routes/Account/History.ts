import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/SanitizeContentItem";
const ZodSchema = z.object({ Cookies: z.string(), Verbose: z.boolean().optional(), Sort: z.enum(["oldest", "newest", "old-to-new", "new-to-old"]).optional() });
type WatchHistoryOptions = z.infer<typeof ZodSchema>;
interface ReelShelfItem {
    accessibility_text?: string;
    on_tap_endpoint?: { payload?: { videoId?: string } };
    thumbnail?: {
        url: string;
        width: number;
        height: number;
    }[];
}
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
    title: string;
    videoId: string;
    thumbnails: {
        url: string;
        width: number;
        height: number;
    }[];
    description: string;
}
/**
 * @shortdesc Fetches a user's YouTube watch history, including Shorts and Videos.
 *
 * @description This function retrieves a user's watch history from YouTube by authenticating
 * with provided cookies. It parses the history data into separate lists for Shorts and
 * regular Videos, and offers optional sorting capabilities for the retrieved items.
 *
 * Authentication is handled by an internal `TubeLogin` utility, requiring valid
 * YouTube authentication cookies to access the history.
 *
 * The `Sort` option allows filtering the history:
 * - `"oldest"`: Attempts to retrieve only the single oldest video and short in the history.
 * - `"newest"`: Attempts to retrieve only the single newest video and short in the history.
 * - `"old-to-new"`: Sorts items by their `videoId` in ascending lexicographical order.
 * - `"new-to-old"`: Sorts items by their `videoId` in descending lexicographical order.
 * Note: The "oldest" and "newest" sorting options are implemented to extract only the single
 * oldest or newest item based on the internal ordering of history retrieval.
 * The "old-to-new" and "new-to-old" sorts are based on string comparison of video IDs,
 * which may not strictly correspond to chronological order.
 *
 * @param {object} options - The configuration options for fetching the watch history.
 * @param {string} options.Cookies - Your YouTube authentication cookies. These are required for authentication.
 * @param {boolean} [options.Verbose=false] - If true, enables verbose logging of the process.
 * @param {"oldest" | "newest" | "old-to-new" | "new-to-old"} [options.Sort] - An optional sorting order for the history items.
 *
 * @returns {Promise<TubeResponse<{ Shorts: Short[]; Videos: Video[] }>>} A Promise that resolves to a `TubeResponse` object.
 * - On success (`status: "success"`), the `data` property contains an object with two arrays:
 * - `Shorts`: An array of `Short` objects, each containing `title`, `videoId`, and `thumbnails`.
 * - `Videos`: An array of `Video` objects, each containing `title`, `videoId`, `thumbnails`, and `description`.
 * - On failure (`status: "error"`), an error message is available.
 *
 * @throws {Error}
 * - Throws an `Error` if `Cookies` are not provided.
 * - Throws an `Error` if the internal Tube client could not be initialized (e.g., invalid cookies).
 * - Throws an `Error` if fetching the watch history from YouTube fails.
 * - Throws a `ZodError` if the provided options do not conform to the expected schema (e.g., `Sort` has an invalid value).
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Fetching basic watch history (most recent items, no sorting)
 * // Replace 'YOUR_YOUTUBE_COOKIES_STRING' with your actual YouTube cookies.
 * // You can usually get these from your browser's developer tools.
 * try {
 * const myCookies = "YOUR_YOUTUBE_COOKIES_STRING";
 * const history = await watch_history({ Cookies: myCookies });
 * console.log("Fetched Watch History (Shorts):", history.data?.Shorts);
 * console.log("Fetched Watch History (Videos):", history.data?.Videos);
 * } catch (error) {
 * console.error("Error fetching history:", error);
 * }
 *
 * @example
 * // 2. Fetching watch history with verbose logging
 * // Replace 'YOUR_YOUTUBE_COOKIES_STRING' with your actual YouTube cookies.
 * try {
 * const myCookies = "YOUR_YOUTUBE_COOKIES_STRING";
 * const history = await watch_history({ Cookies: myCookies, Verbose: true });
 * console.log("Fetched Watch History (Verbose) (Shorts):", history.data?.Shorts);
 * console.log("Fetched Watch History (Verbose) (Videos):", history.data?.Videos);
 * } catch (error) {
 * console.error("Error fetching history with verbose logging:", error);
 * }
 *
 * @example
 * // 3. Fetching watch history and sorting by newest item
 * // This will return only the single most recent Short and Video in the history.
 * // Replace 'YOUR_YOUTUBE_COOKIES_STRING' with your actual YouTube cookies.
 * try {
 * const myCookies = "YOUR_YOUTUBE_COOKIES_STRING";
 * const history = await watch_history({ Cookies: myCookies, Sort: "newest" });
 * console.log("Newest Watch History (Shorts):", history.data?.Shorts);
 * console.log("Newest Watch History (Videos):", history.data?.Videos);
 * } catch (error) {
 * console.error("Error fetching and sorting by newest:", error);
 * }
 *
 * @example
 * // 4. Fetching watch history and sorting by video ID from old-to-new
 * // This sorts all retrieved shorts and videos by their video ID string.
 * // Replace 'YOUR_YOUTUBE_COOKIES_STRING' with your actual YouTube cookies.
 * try {
 * const myCookies = "YOUR_YOUTUBE_COOKIES_STRING";
 * const history = await watch_history({ Cookies: myCookies, Sort: "old-to-new" });
 * console.log("Watch History (Shorts) sorted old-to-new:", history.data?.Shorts);
 * console.log("Watch History (Videos) sorted old-to-new:", history.data?.Videos);
 * } catch (error) {
 * console.error("Error fetching and sorting old-to-new:", error);
 * }
 */
export default async function watch_history(options: WatchHistoryOptions & { Verbose?: boolean }): Promise<TubeResponse<{ Shorts: Short[]; Videos: Video[] }>> {
    let Verbose = false;
    try {
        ZodSchema.parse(options);
        const { Verbose: parsedVerbose = false, Cookies, Sort } = options;
        Verbose = parsedVerbose;
        if (!Cookies) throw new Error(`${colors.red("@error:")} Cookies not provided!`);
        const client: TubeType = await TubeLogin(Cookies);
        if (!client) throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        const history = await client.getHistory();
        if (!history) throw new Error(`${colors.red("@error:")} Failed to fetch watch history.`);
        const result: TubeResponse<{ Shorts: Short[]; Videos: Video[] }> = { status: "success", data: { Shorts: [], Videos: [] } };
        history.sections?.forEach(section => {
            section.contents?.forEach(content => {
                const sanitized = sanitizeContentItem(content);
                if (sanitized?.type === "ReelShelf") {
                    const shorts =
                        sanitized.items?.map((item: ReelShelfItem) => ({ title: item?.accessibility_text, videoId: item?.on_tap_endpoint?.payload?.videoId, thumbnails: item?.thumbnail })) || [];
                    if (result.data?.Shorts) result.data.Shorts.push(...shorts);
                } else if (sanitized?.type === "Video") {
                    const video = { title: sanitized?.title?.text, videoId: sanitized?.videoId, thumbnails: sanitized?.thumbnails, description: sanitized?.description || "" };
                    if (result.data?.Videos) result.data.Videos.push(video);
                }
            });
        });
        switch (Sort) {
            case "oldest":
                if (result.data?.Shorts && result.data.Shorts.length > 0) result.data.Shorts.splice(0, result.data.Shorts.length - 1);
                if (result.data?.Videos && result.data.Videos.length > 0) result.data.Videos.splice(0, result.data.Videos.length - 1);
                break;
            case "newest":
                if (result.data?.Shorts && result.data.Shorts.length > 1) result.data.Shorts.splice(1);
                if (result.data?.Videos && result.data.Videos.length > 1) result.data.Videos.splice(1);
                break;
            case "old-to-new":
                if (result.data?.Shorts)
                    result.data.Shorts.sort((a, b) => {
                        if (!a?.videoId || !b?.videoId) return 0;
                        return a.videoId.localeCompare(b.videoId);
                    });
                if (result.data?.Videos)
                    result.data.Videos.sort((a, b) => {
                        if (!a?.videoId || !b?.videoId) return 0;
                        return a.videoId.localeCompare(b.videoId);
                    });
                break;
            case "new-to-old":
                if (result.data?.Shorts)
                    result.data.Shorts.sort((a, b) => {
                        if (!a?.videoId || !b?.videoId) return 0;
                        return b.videoId.localeCompare(a.videoId);
                    });
                if (result.data?.Videos)
                    result.data.Videos.sort((a, b) => {
                        if (!a?.videoId || !b?.videoId) return 0;
                        return b.videoId.localeCompare(a.videoId);
                    });
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
