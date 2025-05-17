import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/sanitizeContentItem";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional(), sort: z.enum(["oldest", "newest", "old-to-new", "new-to-old"]).optional() });
type WatchHistoryOptions = z.infer<typeof ZodSchema>;
/**
 * @shortdesc Fetches the user's YouTube watch history.
 *
 * @description This function retrieves the watch history for a user authenticated via cookies.
 * It processes the fetched data, separating items into Shorts and standard Videos.
 * Optional parameters allow for controlling logging verbosity and sorting the results.
 *
 * Authentication is performed using the provided YouTube cookies, which are mandatory.
 * The fetched history is returned structured into two arrays: one for YouTube Shorts and one for standard Videos.
 *
 * The function supports the following configuration options:
 * - **Cookies:** The user's cookies as a string, required for authentication.
 * - **Verbose:** An optional boolean flag that enables detailed console logging during the fetch and processing stages. Defaults to `false`.
 * - **Sort:** An optional string determining the order of the returned items.
 * - `"oldest"`: Returns only the single oldest watched item (one Short and one Video if available).
 * - `"newest"`: Returns only the single newest watched item (one Short and one Video if available).
 * - `"old-to-new"`: Sorts all fetched items by their video ID in ascending alphanumeric order.
 * - `"new-to-old"`: Sorts all fetched items by their video ID in descending alphanumeric order.
 * *Note: Sorting by video ID may not strictly correspond to watch time.*
 *
 * The function returns a Promise that resolves with an object containing the fetched and processed watch history.
 *
 * @param {object} options - An object containing the configuration options for fetching the watch history.
 * @param {string} options.cookies - The YouTube authentication cookies as a string. **Required**.
 * @param {boolean} [options.verbose=false] - If set to true, enables verbose logging to the console.
 * @param {"oldest" | "newest" | "old-to-new" | "new-to-old"} [options.sort] - Specifies the sorting order for the fetched history items.
 *
 * @returns {Promise<{ data: TubeResponse<{ Shorts: any[]; Videos: any[] }> }>} A Promise that resolves with an object. The object has a `data` property containing a `TubeResponse` object. The `TubeResponse`'s `data` property is an object with `Shorts` (an array of Short items) and `Videos` (an array of Video items).
 * Each Short item is an object with `title`, `videoId`, and `thumbnails`.
 * Each Video item is an object with `title`, `videoId`, `thumbnails`, and `description`.
 * The `TubeResponse` includes a `status` field indicating the outcome ('success' or 'error' implicitly handled by throwing).
 *
 * @throws {Error}
 * - Throws an `Error` if the `cookies` parameter is missing or empty.
 * - Throws a `ZodError` if the provided options fail schema validation (e.g., an invalid value for `sort`).
 * - Throws an `Error` if the internal Tube client fails to initialize using the provided cookies.
 * - Throws an `Error` if fetching the watch history from the initialized client fails.
 * - Throws a generic `Error` for any other unexpected issues during the process.
 *
 * @example
 * // 1. Basic Watch History Fetch
 * const cookies = "YOUR_COOKIES_HERE";
 * try {
 * const result = await watch_history({ cookies });
 * console.log("Watch History:", result.data);
 * } catch (error) {
 * console.error("Basic Watch History Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Watch History with Verbose Logging
 * const cookies = "YOUR_COOKIES_HERE";
 * try {
 * const result = await watch_history({ cookies, verbose: true });
 * console.log("Watch History (Verbose):", result.data);
 * } catch (error) {
 * console.error("Watch History with Verbose Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Watch History Sorted by Oldest Watched Item (one Short, one Video)
 * const cookies = "YOUR_COOKIES_HERE";
 * try {
 * const result = await watch_history({ cookies, sort: "oldest" });
 * console.log("Oldest Watched:", result.data);
 * } catch (error) {
 * console.error("Watch History Sorted by Oldest Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Watch History Sorted by Newest Watched Item (one Short, one Video)
 * const cookies = "YOUR_COOKIES_HERE";
 * try {
 * const result = await watch_history({ cookies, sort: "newest" });
 * console.log("Newest Watched:", result.data);
 * } catch (error) {
 * console.error("Watch History Sorted by Newest Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Watch History Sorted Old to New by Video ID
 * const cookies = "YOUR_COOKIES_HERE";
 * try {
 * const result = await watch_history({ cookies, sort: "old-to-new" });
 * console.log("Watch History (Old to New):", result.data);
 * } catch (error) {
 * console.error("Watch History Sorted Old to New Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Watch History Sorted New to Old by Video ID
 * const cookies = "YOUR_COOKIES_HERE";
 * try {
 * const result = await watch_history({ cookies, sort: "new-to-old" });
 * console.log("Watch History (New to Old):", result.data);
 * } catch (error) {
 * console.error("Watch History Sorted New to Old Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 7. Watch History with Verbose Logging and Oldest Sort
 * const cookies = "YOUR_COOKIES_HERE";
 * try {
 * const result = await watch_history({ cookies, verbose: true, sort: "oldest" });
 * console.log("Oldest Watched (Verbose):", result.data);
 * } catch (error) {
 * console.error("Watch History with Verbose and Oldest Sort Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 8. Watch History with Verbose Logging and Newest Sort
 * const cookies = "YOUR_COOKIES_HERE";
 * try {
 * const result = await watch_history({ cookies, verbose: true, sort: "newest" });
 * console.log("Newest Watched (Verbose):", result.data);
 * } catch (error) {
 * console.error("Watch History with Verbose and Newest Sort Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 9. Watch History with Verbose Logging and Old to New Sort
 * const cookies = "YOUR_COOKIES_HERE";
 * try {
 * const result = await watch_history({ cookies, verbose: true, sort: "old-to-new" });
 * console.log("Watch History (Old to New, Verbose):", result.data);
 * } catch (error) {
 * console.error("Watch History with Verbose and Old to New Sort Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 10. Watch History with Verbose Logging and New to Old Sort
 * const cookies = "YOUR_COOKIES_HERE";
 * try {
 * const result = await watch_history({ cookies, verbose: true, sort: "new-to-old" });
 * console.log("Watch History (New to Old, Verbose):", result.data);
 * } catch (error) {
 * console.error("Watch History with Verbose and New to Old Sort Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 11. Example of Missing Cookies (will throw an Error)
 * try {
 * await watch_history({ cookies: "" }); // Or simply {} as any if not type-checking
 * } catch (error) {
 * console.error("Expected Error (Missing Cookies):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 12. Example of Zod Validation Error (Invalid Sort Value)
 * const cookies = "YOUR_COOKIES_HERE";
 * try {
 * await watch_history({ cookies, sort: "invalid-sort" as any });
 * } catch (error) {
 * console.error("Expected Zod Error (Invalid Sort):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 13. Example of Client Initialization Failure (e.g., invalid cookies)
 * // This scenario depends on the internal TubeLogin logic failing.
 * try {
 * await watch_history({ cookies: "INVALID_OR_EXPIRED_COOKIES" });
 * } catch (error) {
 * console.error("Expected Error (Client Initialization Failed):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 14. Example of History Fetch Failure
 * // This scenario depends on the client's getHistory() method failing after initialization.
 * // It's harder to trigger predictably with just input options.
 * // try {
 * //    await watch_history({ cookies: "VALID_COOKIES_BUT_FETCH_FAILS" });
 * // } catch (error) {
 * //    console.error("Expected Error (History Fetch Failed):", error instanceof Error ? error.message : error);
 * // }
 */
export default async function watch_history(options: WatchHistoryOptions): Promise<{ data: TubeResponse<{ Shorts: any[]; Videos: any[] }> }> {
    try {
        ZodSchema.parse(options);
        const { verbose, cookies, sort } = options;
        if (verbose) console.log(colors.green("@info:"), "Starting watch history fetch...");
        if (!cookies) {
            throw new Error(`${colors.red("@error:")} Cookies not provided!`);
        }
        const client: TubeType = await TubeLogin(cookies);
        if (!client) {
            throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        }
        const history = await client.getHistory();
        if (!history) {
            throw new Error(`${colors.red("@error:")} Failed to fetch watch history.`);
        }
        const result: TubeResponse<{ Shorts: any[]; Videos: any[] }> = { status: "success", data: { Shorts: [], Videos: [] } };
        history.sections?.forEach(section => {
            section.contents?.forEach(content => {
                const sanitized = sanitizeContentItem(content);
                if (sanitized?.type === "ReelShelf") {
                    const shorts = sanitized.items?.map((item: any) => ({ title: item?.accessibility_text, videoId: item?.on_tap_endpoint?.payload?.videoId, thumbnails: item?.thumbnail })) || [];
                    if (result.data?.Shorts) result.data.Shorts.push(...shorts);
                } else if (sanitized?.type === "Video") {
                    const video = { title: sanitized?.title?.text, videoId: sanitized?.videoId, thumbnails: sanitized?.thumbnails, description: sanitized?.description || "" };
                    if (result.data?.Videos) result.data.Videos.push(video);
                }
            });
        });
        switch (sort) {
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
        if (verbose) console.log(colors.green("@info:"), "Watch history fetched successfully!");
        return { data: result };
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
    const cookies = "YOUR_COOKIES_HERE";
    try {
        console.log("--- Running Basic Watch History Fetch ---");
        const result = await watch_history({ cookies });
        console.log("Watch History:", result.data);
    } catch (error) {
        console.error("Basic Watch History Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History with Verbose Logging ---");
        const result = await watch_history({ cookies, verbose: true });
        console.log("Watch History (Verbose):", result.data);
    } catch (error) {
        console.error("Watch History with Verbose Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History Sorted by Oldest ---");
        const result = await watch_history({ cookies, sort: "oldest" });
        console.log("Oldest Watched:", result.data);
    } catch (error) {
        console.error("Watch History Sorted by Oldest Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History Sorted by Newest ---");
        const result = await watch_history({ cookies, sort: "newest" });
        console.log("Newest Watched:", result.data);
    } catch (error) {
        console.error("Watch History Sorted by Newest Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History Sorted Old to New ---");
        const result = await watch_history({ cookies, sort: "old-to-new" });
        console.log("Watch History (Old to New):", result.data);
    } catch (error) {
        console.error("Watch History Sorted Old to New Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History Sorted New to Old ---");
        const result = await watch_history({ cookies, sort: "new-to-old" });
        console.log("Watch History (New to Old):", result.data);
    } catch (error) {
        console.error("Watch History Sorted New to Old Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History with Verbose and Oldest Sort ---");
        const result = await watch_history({ cookies, verbose: true, sort: "oldest" });
        console.log("Oldest Watched (Verbose):", result.data);
    } catch (error) {
        console.error("Watch History with Verbose and Oldest Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History with Verbose and Newest Sort ---");
        const result = await watch_history({ cookies, verbose: true, sort: "newest" });
        console.log("Newest Watched (Verbose):", result.data);
    } catch (error) {
        console.error("Watch History with Verbose and Newest Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History with Verbose and Old to New Sort ---");
        const result = await watch_history({ cookies, verbose: true, sort: "old-to-new" });
        console.log("Watch History (Old to New, Verbose):", result.data);
    } catch (error) {
        console.error("Watch History with Verbose and Old to New Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History with Verbose and New to Old Sort ---");
        const result = await watch_history({ cookies, verbose: true, sort: "new-to-old" });
        console.log("Watch History (New to Old, Verbose):", result.data);
    } catch (error) {
        console.error("Watch History with Verbose and New to Old Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Invalid Cookies Example ---");
        const result = await watch_history({ cookies: "" });
        console.log("This should not be reached - Invalid Cookies Example.");
    } catch (error) {
        console.error("Expected Error (Invalid Cookies):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Zod Validation Error Example (Missing Cookies) ---");
        await watch_history({} as any);
        console.log("This should not be reached - Zod Validation Error Example.");
    } catch (error) {
        console.error("Expected Zod Error (Missing Cookies):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Zod Validation Error Example (Invalid Sort) ---");
        await watch_history({ cookies, sort: "invalid-sort" as any });
        console.log("This should not be reached - Zod Validation Error Example.");
    } catch (error) {
        console.error("Expected Zod Error (Invalid Sort):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
