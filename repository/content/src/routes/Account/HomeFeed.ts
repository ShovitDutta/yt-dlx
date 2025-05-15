import colors from "colors";
import { z, ZodError } from "zod";
import { EventEmitter } from "events";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/sanitizeContentItem";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional(), sort: z.enum(["oldest", "newest", "old-to-new", "new-to-old"]).optional() });
/**
 * @shortdesc Fetches the user's YouTube home feed.
 *
 * @description This function retrieves the personalized home feed for a user using their authentication cookies. It can fetch both regular videos and short videos displayed on the home feed. Optional verbose logging is available, and the results can be sorted according to different criteria.
 *
 * The function requires valid cookies for authentication to access the user's home feed.
 *
 * It supports the following configuration options:
 * - **Cookies:** The user's cookies as a string. This is a mandatory parameter required for authenticating the request.
 * - **Verbose:** An optional boolean value that, if true, enables detailed logging to the console, providing more information about the process of fetching and parsing the home feed.
 * - **Sort:** An optional string specifying how the home feed items should be sorted or filtered. Available options include:
 * - `"oldest"`: Keeps only the oldest video and the oldest short found in the fetched feed data.
 * - `"newest"`: Keeps only the newest video and the newest short found in the fetched feed data.
 * - `"old-to-new"`: Sorts both videos and shorts by their video ID in ascending order. Note: The concept of "oldest" or "newest" by video ID might not strictly align with publication date for home feed items, as the feed is curated. This sort orders by the internal video identifier.
 * - `"new-to-old"`: Sorts both videos and shorts by their video ID in descending order. Similar note about sorting by video ID applies.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - `"data"`: Emitted when the home feed data is successfully fetched and processed. The emitted data is an object containing the status and the fetched feed items, separated into `Shorts` and `Videos` arrays.
 * - `"error"`: Emitted when an error occurs during any stage of the process, such as argument validation, cookie initialization, or network requests. The emitted data is the error message or object.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.cookies - The user's cookies as a string. **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 * @param {("oldest" | "newest" | "old-to-new" | "new-to-old")} [options.sort] - Specify how the home feed items should be sorted.
 *
 * @returns {EventEmitter} An EventEmitter instance for handling events during home feed fetching.
 *
 * @example
 * // 1. Fetch home feed with provided cookies
 * const cookies = "YOUR_COOKIES_HERE";
 * YouTubeDLX.Account.HomeFeed({ cookies })
 * .on("data", (data) => console.log("Home Feed:", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 2. Fetch home feed with verbose logging
 * const cookies = "YOUR_COOKIES_HERE";
 * YouTubeDLX.Account.HomeFeed({ cookies, verbose: true })
 * .on("data", (data) => console.log("Home Feed:", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 3. Fetch home feed and keep only the oldest item of each type
 * const cookies = "YOUR_COOKIES_HERE";
 * YouTubeDLX.Account.HomeFeed({ cookies, sort: "oldest" })
 * .on("data", (data) => console.log("Oldest Feed Items:", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 4. Fetch home feed and keep only the newest item of each type
 * const cookies = "YOUR_COOKIES_HERE";
 * YouTubeDLX.Account.HomeFeed({ cookies, sort: "newest" })
 * .on("data", (data) => console.log("Newest Feed Items:", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 5. Fetch home feed and sort from oldest to newest by video ID
 * const cookies = "YOUR_COOKIES_HERE";
 * YouTubeDLX.Account.HomeFeed({ cookies, sort: "old-to-new" })
 * .on("data", (data) => console.log("Home Feed (Old to New by ID):", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 6. Fetch home feed and sort from newest to oldest by video ID
 * const cookies = "YOUR_COOKIES_HERE";
 * YouTubeDLX.Account.HomeFeed({ cookies, sort: "new-to-old" })
 * .on("data", (data) => console.log("Home Feed (New to Old by ID):", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 7. Fetch home feed with verbose logging and keep only the oldest item of each type
 * const cookies = "YOUR_COOKIES_HERE";
 * YouTubeDLX.Account.HomeFeed({ cookies, verbose: true, sort: "oldest" })
 * .on("data", (data) => console.log("Oldest Feed Items (Verbose):", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 8. Fetch home feed with verbose logging and keep only the newest item of each type
 * const cookies = "YOUR_COOKIES_HERE";
 * YouTubeDLX.Account.HomeFeed({ cookies, verbose: true, sort: "newest" })
 * .on("data", (data) => console.log("Newest Feed Items (Verbose):", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 9. Fetch home feed with verbose logging and sort from oldest to newest by video ID
 * const cookies = "YOUR_COOKIES_HERE";
 * YouTubeDLX.Account.HomeFeed({ cookies, verbose: true, sort: "old-to-new" })
 * .on("data", (data) => console.log("Home Feed (Old to New by ID, Verbose):", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 10. Fetch home feed with verbose logging and sort from newest to oldest by video ID
 * const cookies = "YOUR_COOKIES_HERE";
 * YouTubeDLX.Account.HomeFeed({ cookies, verbose: true, sort: "new-to-old" })
 * .on("data", (data) => console.log("Home Feed (New to Old by ID, Verbose):", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 11. Missing required 'cookies' parameter (will result in an error)
 * YouTubeDLX.Account.HomeFeed({} as any)
 * .on("error", (error) => console.error("Expected Error (missing cookies):", error));
 *
 * @example
 * // 12. Invalid 'sort' value (will result in an error - Zod validation)
 * YouTubeDLX.Account.HomeFeed({ cookies: "YOUR_COOKIES_HERE", sort: "invalid_sort" as any })
 * .on("error", (error) => console.error("Expected Error (invalid sort):", error));
 *
 * @example
 * // 13. Failed to initialize Tube client (e.g., invalid cookies)
 * // Note: This scenario depends on the internal TubeLogin logic.
 * // The error emitted would be: "@error: Could not initialize Tube client."
 * YouTubeDLX.Account.HomeFeed({ cookies: "INVALID_OR_EXPIRED_COOKIES" })
 * .on("error", (error) => console.error("Expected Error (client initialization failed):", error));
 *
 * @example
 * // 14. Failed to fetch home feed after client initialization
 * // Note: This is an internal error scenario, difficult to trigger via simple example.
 * // The error emitted would be: "@error: Failed to fetch home feed."
 * // YouTubeDLX.Account.HomeFeed({ cookies: "VALID_COOKIES_BUT_FETCH_FAILS" })
 * // .on("error", (error) => console.error("Expected Error (fetch failed):", error));
 *
 */
export default function home_feed(options: z.infer<typeof ZodSchema>): EventEmitter {
    const emitter = new EventEmitter();
    (async () => {
        try {
            ZodSchema.parse(options);
            const { verbose, cookies, sort } = options;
            if (verbose) console.log(colors.green("@info:"), "Fetching home feed...");
            if (!cookies) {
                emitter.emit("error", `${colors.red("@error:")} cookies not provided!`);
                return;
            }
            const client: TubeType = await TubeLogin(cookies);
            if (!client) {
                emitter.emit("error", `${colors.red("@error:")} Could not initialize Tube client.`);
                return;
            }
            const homeFeed = await client.getHomeFeed();
            if (!homeFeed) {
                emitter.emit("error", `${colors.red("@error:")} Failed to fetch home feed.`);
                return;
            }
            const result: TubeResponse<{ Shorts: any[]; Videos: any[] }> = { status: "success", data: { Shorts: [], Videos: [] } };
            homeFeed.contents?.contents?.forEach((section: any) => {
                if (section?.type === "RichItem" && section?.content?.type === "Video") {
                    const sanitized = sanitizeContentItem(section);
                    if (sanitized?.content) {
                        result.data?.Videos.push({
                            type: sanitized.content.type || "",
                            title: sanitized.content.title?.text || "",
                            videoId: sanitized.content.video_id || "",
                            description: sanitized.content.description_snippet?.text || "",
                            thumbnails: sanitized.content.thumbnails || [],
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
                            const short = { title: item.content.accessibility_text || "", videoId: item.content.on_tap_endpoint?.payload?.videoId, thumbnails: item.content.thumbnail || [] };
                            result.data?.Shorts.push(short);
                        }
                    });
                }
            });
            switch (sort) {
                case "oldest":
                    if (result.data?.Shorts) result.data.Shorts.splice(0, result.data.Shorts.length - 1);
                    if (result.data?.Videos) result.data.Videos.splice(0, result.data.Videos.length - 1);
                    break;
                case "newest":
                    if (result.data?.Shorts) result.data.Shorts.splice(1);
                    if (result.data?.Videos) result.data.Videos.splice(1);
                    break;
                case "old-to-new":
                    if (result.data?.Shorts) result.data.Shorts.sort((a, b) => a.videoId.localeCompare(b.videoId));
                    if (result.data?.Videos) result.data.Videos.sort((a, b) => a.videoId.localeCompare(b.videoId));
                    break;
                case "new-to-old":
                    if (result.data?.Shorts) result.data.Shorts.sort((a, b) => b.videoId.localeCompare(a.videoId));
                    if (result.data?.Videos) result.data.Videos.sort((a, b) => b.videoId.localeCompare(a.videoId));
                    break;
            }
            if (verbose) console.log(colors.green("@info:"), "Home feed fetched!");
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
