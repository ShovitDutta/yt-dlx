import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/sanitizeContentItem";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional(), sort: z.enum(["oldest", "newest", "old-to-new", "new-to-old"]).optional() });
type HomeFeedOptions = z.infer<typeof ZodSchema>;
interface Short {
    title: string;
    videoId: string;
    thumbnails: any[];
}
interface Video {
    type: string;
    title: string;
    videoId: string;
    description: string;
    thumbnails: any[];
    authorId: string;
    authorName: string;
    authorThumbnails: any[];
    authorBadges: any[];
    authorUrl: string;
    viewCount: string;
    shortViewCount: string;
}
/**
 * @shortdesc Fetches the user's YouTube home feed.
 *
 * @description This function retrieves the personalized home feed for a user authenticated via cookies.
 * It processes the fetched feed, extracting and separating items into Shorts and standard Videos based on the provided `Short` and `Video` interfaces.
 * Optional parameters allow for controlling logging verbosity and sorting the extracted items.
 *
 * Authentication is performed using the provided YouTube cookies, which are mandatory.
 * The fetched home feed data is returned structured into two arrays: one for YouTube Shorts and one for standard Videos, adhering to the `Short` and `Video` type definitions.
 * The data extracted for each video includes details like type, title, video ID, description, thumbnails, author information, and view counts.
 *
 * The function supports the following configuration options:
 * - **Cookies:** The user's cookies as a string, required for authentication.
 * - **Verbose:** An optional boolean flag that enables detailed console logging during the fetch and processing stages. Defaults to `false`.
 * - **Sort:** An optional string determining the order of the returned items.
 * - `"oldest"`: Returns only the single oldest item found in the fetched data (one Short and one Video if available), based on the structure of the API response.
 * - `"newest"`: Returns only the single newest item found in the fetched data (one Short and one Video if available), based on the structure of the API response.
 * - `"old-to-new"`: Sorts all extracted items by their video ID in ascending alphanumeric order.
 * - `"new-to-old"`: Sorts all extracted items by their video ID in descending alphanumeric order.
 * *Note: Sorting by video ID may not strictly correspond to chronological appearance.*
 *
 * The function returns a Promise that resolves with a `TubeResponse` object containing the fetched and processed home feed data in its `data` property.
 * The `data` property adheres to the `{ Shorts: Short[]; Videos: Video[] }` structure.
 *
 * @param {object} options - The configuration options for fetching the home feed.
 * @param {string} options.cookies - The YouTube authentication cookies as a string. **Required**.
 * @param {boolean} [options.verbose=false] - If set to true, enables verbose logging to the console.
 * @param {"oldest" | "newest" | "old-to-new" | "new-to-old"} [options.sort] - Specifies the sorting order for the extracted feed items.
 *
 * @returns {Promise<TubeResponse<{ Shorts: Short[]; Videos: Video[] }>>} A Promise that resolves with a `TubeResponse` object containing the fetched home feed data, separated into `Shorts` and `Videos` arrays according to the `Short` and `Video` interfaces.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing required `cookies`, invalid enum value for `sort`).
 * - Throws an `Error` if the `cookies` parameter is missing or empty.
 * - Throws an `Error` if the internal Tube client fails to initialize using the provided cookies.
 * - Throws an `Error` if fetching the home feed from the initialized client fails.
 * - Throws a generic `Error` for any other unexpected issues during the process.
 *
 * @example
 * // 1. Basic Home Feed Fetch
 * const cookies = "YOUR_COOKIES_HERE"; // Replace with actual cookies
 * try {
 * const result = await home_feed({ cookies });
 * console.log("Home Feed Status:", result.status);
 * console.log("First 5 Videos:", result.data.Videos.slice(0, 5));
 * console.log("First 5 Shorts:", result.data.Shorts.slice(0, 5));
 * } catch (error) {
 * console.error("Basic Home Feed Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Home Feed with Verbose Logging
 * const cookies = "YOUR_COOKIES_HERE"; // Replace with actual cookies
 * try {
 * const result = await home_feed({ cookies, verbose: true });
 * console.log("Home Feed Status (Verbose):", result.status);
 * } catch (error) {
 * console.error("Home Feed with Verbose Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Home Feed Sorted by Oldest Item (returns only one Short and one Video if available)
 * const cookies = "YOUR_COOKIES_HERE"; // Replace with actual cookies
 * try {
 * const result = await home_feed({ cookies, sort: "oldest" });
 * console.log("Oldest Feed Items:", result.data); // Will contain at most one Short and one Video
 * } catch (error) {
 * console.error("Home Feed Sorted by Oldest Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Home Feed Sorted by Newest Item (returns only one Short and one Video if available)
 * const cookies = "YOUR_COOKIES_HERE"; // Replace with actual cookies
 * try {
 * const result = await home_feed({ cookies, sort: "newest" });
 * console.log("Newest Feed Items:", result.data); // Will contain at most one Short and one Video
 * } catch (error) {
 * console.error("Home Feed Sorted by Newest Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Home Feed Sorted Old to New by Video ID
 * const cookies = "YOUR_COOKIES_HERE"; // Replace with actual cookies
 * try {
 * const result = await home_feed({ cookies, sort: "old-to-new" });
 * console.log("Home Feed (Old to New by ID):", result.data.Videos.slice(0, 5));
 * } catch (error) {
 * console.error("Home Feed Sorted Old to New Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Home Feed Sorted New to Old by Video ID
 * const cookies = "YOUR_COOKIES_HERE"; // Replace with actual cookies
 * try {
 * const result = await home_feed({ cookies, sort: "new-to-old" });
 * console.log("Home Feed (New to Old by ID):", result.data.Videos.slice(0, 5));
 * } catch (error) {
 * console.error("Home Feed Sorted New to Old Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 7. Home Feed with Verbose Logging and Oldest Sort
 * const cookies = "YOUR_COOKIES_HERE"; // Replace with actual cookies
 * try {
 * const result = await home_feed({ cookies, verbose: true, sort: "oldest" });
 * console.log("Oldest Feed Items (Verbose):", result.data);
 * } catch (error) {
 * console.error("Home Feed with Verbose and Oldest Sort Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 8. Home Feed with Verbose Logging and Newest Sort
 * const cookies = "YOUR_COOKIES_HERE"; // Replace with actual cookies
 * try {
 * const result = await home_feed({ cookies, verbose: true, sort: "newest" });
 * console.log("Newest Feed Items (Verbose):", result.data);
 * } catch (error) {
 * console.error("Home Feed with Verbose and Newest Sort Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 9. Home Feed with Verbose Logging and Old to New Sort
 * const cookies = "YOUR_COOKIES_HERE"; // Replace with actual cookies
 * try {
 * const result = await home_feed({ cookies, verbose: true, sort: "old-to-new" });
 * console.log("Home Feed (Old to New by ID, Verbose):", result.data.Videos.slice(0, 5));
 * } catch (error) {
 * console.error("Home Feed with Verbose and Old to New Sort Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 10. Home Feed with Verbose Logging and New to Old Sort
 * const cookies = "YOUR_COOKIES_HERE"; // Replace with actual cookies
 * try {
 * const result = await home_feed({ cookies, verbose: true, sort: "new-to-old" });
 * console.log("Home Feed (New to Old by ID, Verbose):", result.data.Videos.slice(0, 5));
 * } catch (error) {
 * console.error("Home Feed with Verbose and New to Old Sort Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 11. Example of Missing Cookies (handled by explicit check - will throw Error)
 * try {
 * await home_feed({ cookies: "" });
 * } catch (error) {
 * console.error("Expected Error (Missing Cookies - Explicit Check):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 12. Example of Missing Cookies (handled by ZodSchema - will throw ZodError)
 * try {
 * await home_feed({} as any); // Simulate missing required parameter
 * } catch (error) {
 * console.error("Expected Zod Error (Missing Cookies):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 13. Example of Zod Validation Error (Invalid Sort Value - will throw ZodError)
 * const cookies = "YOUR_COOKIES_HERE"; // Replace with actual cookies
 * try {
 * await home_feed({ cookies, sort: "invalid-sort" as any }); // Simulate invalid enum value
 * } catch (error) {
 * console.error("Expected Zod Error (Invalid Sort):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 14. Example of Client Initialization Failure (e.g., invalid or expired cookies)
 * // This scenario depends on the internal TubeLogin logic failing.
 * try {
 * await home_feed({ cookies: "INVALID_OR_EXPIRED_COOKIES" });
 * } catch (error) {
 * console.error("Expected Error (Client Initialization Failed):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 15. Example of Home Feed Fetch Failure
 * // This scenario depends on the client's getHomeFeed() method failing after initialization.
 * // It's harder to trigger predictably with just input options.
 * // try {
 * //    await home_feed({ cookies: "VALID_COOKIES_BUT_FETCH_FAILS" });
 * // } catch (error) {
 * //    console.error("Expected Error (Home Feed Fetch Failed):", error instanceof Error ? error.message : error);
 * // }
 */
export default async function home_feed(options: HomeFeedOptions): Promise<TubeResponse<{ Shorts: Short[]; Videos: Video[] }>> {
    try {
        ZodSchema.parse(options);
        const { verbose, cookies, sort } = options;
        if (verbose) console.log(colors.green("@info:"), "Fetching home feed...");
        if (!cookies) {
            throw new Error(`${colors.red("@error:")} Cookies not provided!`);
        }
        const client: TubeType = await TubeLogin(cookies);
        if (!client) {
            throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        }
        const homeFeed = await client.getHomeFeed();
        if (!homeFeed) {
            throw new Error(`${colors.red("@error:")} Failed to fetch home feed.`);
        }
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
        if (verbose) console.log(colors.green("@info:"), "Home feed fetched!");
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
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
    }
}
