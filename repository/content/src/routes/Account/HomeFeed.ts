import colors from "colors";
import { z, ZodError } from "zod";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/sanitizeContentItem";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional(), sort: z.enum(["oldest", "newest", "old-to-new", "new-to-old"]).optional() });
interface TubeResponse<T> {
    data?: T;
    message?: string;
    status: "success" | "error";
}
type HomeFeedResultData = { Shorts: any[]; Videos: any[] };
type HomeFeedResult = TubeResponse<HomeFeedResultData>;
/**
 * @shortdesc Fetches the user's YouTube home feed using async/await instead of events.
 * @description This function retrieves the personalized home feed for an authenticated user asynchronously using async/await.
 * It processes the feed to extract video and short video items, supports optional verbose logging,
 * and allows sorting or filtering the results. It returns a Promise resolving with the fetched data
 * or rejects with an error, replacing the EventEmitter pattern.
 *
 * @param options - An object containing the configuration options validated by ZodSchema.
 * @param options.cookies - The user's cookies as a string. **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging during the process.
 * @param {("oldest" | "newest" | "old-to-new" | "new-to-old")} [options.sort] - Specify how the home feed items should be sorted or filtered.
 * @returns {Promise<HomeFeedResult>} A Promise that resolves with a TubeResponse object. On success, the `status` is "success" and `data` contains `Shorts` and `Videos` arrays.
 * @throws {Error} Throws a formatted error if input validation fails (ZodError), if cookie initialization fails, if fetching the home feed from the platform fails, or in case of any other unexpected errors.
 */
export default async function home_feed(options: z.infer<typeof ZodSchema>): Promise<HomeFeedResult> {
    try {
        ZodSchema.parse(options);
        const { verbose, cookies, sort } = options;
        if (verbose) console.log(colors.green("@info:"), "Fetching home feed...");
        if (!cookies) throw new Error(`${colors.red("@error:")} cookies not provided!`);
        const client: TubeType = await TubeLogin(cookies);
        if (!client) throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        const homeFeed = await client.getHomeFeed();
        if (!homeFeed) throw new Error(`${colors.red("@error:")} Failed to fetch home feed.`);
        const result: HomeFeedResult = { status: "success", data: { Shorts: [], Videos: [] } };
        if (homeFeed.contents?.contents) {
            for (const section of homeFeed.contents.contents) {
                const sanitized = await sanitizeContentItem(section);
                if (sanitized?.type === "RichItem" && sanitized?.content?.type === "Video") {
                    if (sanitized.content) {
                        result.data?.Videos.push({
                            type: sanitized.content.type || "",
                            title: sanitized.content.title?.text || "",
                            videoId: sanitized.content.video_id || "",
                            description: sanitized.content.description_snippet?.text || "",
                            thumbnails: sanitized.content.thumbnails || [],
                            authorId: sanitized.content.author?.id || "",
                            authorName: sanitized.content.author?.name || "",
                            authorThumbnails: sanitized.content.author?.thumbnails || [],
                            authorBadges: sanitized.content.author?.badges || [],
                            authorUrl: sanitized.content.author?.url || "",
                            viewCount: sanitized.content.view_count?.text || "",
                            shortViewCount: sanitized.content.short_view_count?.text || "",
                        });
                    }
                } else if (sanitized?.type === "RichSection" && sanitized?.content?.type === "RichShelf") {
                    if (sanitized.content?.contents) {
                        for (const item of sanitized.content.contents) {
                            const sanitizedItem = await sanitizeContentItem(item);
                            if (sanitizedItem?.content?.type === "ShortsLockupView") {
                                const short = {
                                    title: sanitizedItem.content.accessibility_text || "",
                                    videoId: sanitizedItem.content.on_tap_endpoint?.payload?.videoId,
                                    thumbnails: sanitizedItem.content.thumbnail || [],
                                };
                                result.data?.Shorts.push(short);
                            }
                        }
                    }
                }
            }
        }
        switch (sort) {
            case "oldest":
                if (result.data?.Shorts && result.data.Shorts.length > 0) result.data.Shorts = result.data.Shorts.slice(0, 1);
                if (result.data?.Videos && result.data.Videos.length > 0) result.data.Videos = result.data.Videos.slice(0, 1);
                break;
            case "newest":
                if (result.data?.Shorts && result.data.Shorts.length > 0) result.data.Shorts = result.data.Shorts.slice(-1);
                if (result.data?.Videos && result.data.Videos.length > 0) result.data.Videos = result.data.Videos.slice(-1);
                break;
            case "old-to-new":
                if (result.data?.Shorts) result.data.Shorts.sort((a, b) => a.videoId?.localeCompare(b.videoId));
                if (result.data?.Videos) result.data.Videos.sort((a, b) => a.videoId?.localeCompare(a.videoId));
                break;
            case "new-to-old":
                if (result.data?.Shorts) result.data.Shorts.sort((a, b) => b.videoId?.localeCompare(a.videoId));
                if (result.data?.Videos) result.data.Videos.sort((a, b) => b.videoId?.localeCompare(a.videoId));
                break;
        }
        if (verbose) console.log(colors.green("@info:"), "Home feed fetched!");
        return result;
    } catch (error: any) {
        if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw new Error(`${colors.red("@error:")} ${error.message}`);
        else throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
