import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/sanitizeContentItem";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional(), sort: z.enum(["oldest", "newest", "old-to-new", "new-to-old"]).optional() });
type WatchHistoryOptions = z.infer<typeof ZodSchema>;
interface Short {
    title: string;
    videoId: string;
    thumbnails: any;
}
interface Video {
    title: string;
    videoId: string;
    thumbnails: any;
    description: string;
}
/**
 * @shortdesc Fetches the user's YouTube watch history using authentication cookies.
 *
 * @description This function retrieves the watch history for a YouTube user authenticated via provided cookies.
 * It parses the history data into separate lists for Shorts and standard Videos.
 * The function supports optional verbose logging and sorting of the fetched items.
 *
 * Providing valid authentication cookies is mandatory to access the user's watch history.
 * The fetched history is returned structured into two arrays within the `data` property of the `TubeResponse`:
 * one for YouTube Shorts (`Shorts`) and one for standard Videos (`Videos`).
 *
 * The function supports the following configuration options:
 * - **Cookies:** A string containing the YouTube authentication cookies. This is a mandatory parameter.
 * - **Verbose:** An optional boolean flag that, if true, enables detailed console logging during the fetch and processing stages. Defaults to `false`.
 * - **Sort:** An optional string determining the order of the returned items within the `Shorts` and `Videos` arrays.
 * - `"oldest"`: Filters the results to include only the single oldest item found in the fetched data for each type (one Short and one Video if available).
 * - `"newest"`: Filters the results to include only the single newest item found in the fetched data for each type (one Short and one Video if available).
 * - `"old-to-new"`: Sorts all fetched items of each type by their video ID in ascending alphanumeric order.
 * - `"new-to-old"`: Sorts all fetched items of each type by their video ID in descending alphanumeric order.
 * *Note: Sorting by video ID may not strictly correspond to chronological watch time.*
 *
 * The function returns a Promise that resolves with a `TubeResponse` object containing the fetched and processed watch history data.
 * The `TubeResponse` includes a `status` field indicating the outcome ('success' or 'error' implicitly handled by throwing).
 *
 * @param {object} options - The configuration options for fetching the watch history.
 * @param {string} options.cookies - The YouTube authentication cookies as a string. **Required**.
 * @param {boolean} [options.verbose=false] - If set to true, enables verbose logging to the console.
 * @param {"oldest" | "newest" | "old-to-new" | "new-to-old"} [options.sort] - Specifies the sorting order for the fetched history items.
 *
 * @returns {Promise<TubeResponse<{ Shorts: Short[]; Videos: Video[] }>>} A Promise that resolves with a `TubeResponse` object. The `TubeResponse` has a `data` property containing an object with `Shorts` (an array of Short items) and `Videos` (an array of Video items).
 * Each `Short` item is an object with `title`, `videoId`, and `thumbnails`.
 * Each `Video` item is an object with `title`, `videoId`, `thumbnails`, and `description`.
 *
 * @throws {Error}
 * - Throws an `Error` if the `cookies` parameter is missing or empty.
 * - Throws a `ZodError` if the provided options fail schema validation (e.g., missing required parameters, invalid enum value for `sort`).
 * - Throws an `Error` if the internal Tube client fails to initialize using the provided cookies.
 * - Throws an `Error` if fetching the watch history from the initialized client fails.
 * - Throws a generic `Error` for any other unexpected issues during the process.
 *
 * @example
 * // Vitest Test: Should handle basic watch history fetch
 * // Requires YouTubeDLX_COOKIES environment variable to be set with valid cookies.
 * vitest.it("should handle basic watch history fetch", async () => {
 * const cookies = env.YouTubeDLX_COOKIES as string; // Assuming env is available
 * if (!cookies) {
 * console.warn("Skipping basic fetch test due to missing YouTubeDLX_COOKIES.");
 * return;
 * }
 * const result = await watch_history({ cookies });
 * vitest.expect(result).toHaveProperty("status");
 * vitest.expect(result.status).toBe("success");
 * vitest.expect(result).toHaveProperty("data");
 * vitest.expect(result.data).toHaveProperty("Shorts");
 * vitest.expect(result.data).toHaveProperty("Videos");
 * vitest.expect(Array.isArray(result.data?.Shorts)).toBe(true);
 * vitest.expect(Array.isArray(result.data?.Videos)).toBe(true);
 * });
 *
 * @example
 * // Vitest Test: Should handle watch history fetch with verbose logging
 * // Requires YouTubeDLX_COOKIES environment variable.
 * vitest.it("should handle watch history fetch with verbose logging", async () => {
 * const cookies = env.YouTubeDLX_COOKIES as string; // Assuming env is available
 * if (!cookies) {
 * console.warn("Skipping verbose fetch test due to missing YouTubeDLX_COOKIES.");
 * return;
 * }
 * const result = await watch_history({ cookies, verbose: true });
 * vitest.expect(result.status).toBe("success");
 * vitest.expect(result.data).toBeInstanceOf(Object);
 * });
 *
 * @example
 * // Vitest Test: Should handle watch history sorted by oldest
 * // Requires YouTubeDLX_COOKIES environment variable. Note: This sorts by keeping only the single oldest item.
 * vitest.it("should handle watch history sorted by oldest", async () => {
 * const cookies = env.YouTubeDLX_COOKIES as string; // Assuming env is available
 * if (!cookies) {
 * console.warn("Skipping oldest sort test due to missing YouTubeDLX_COOKIES.");
 * return;
 * }
 * const result = await watch_history({ cookies, sort: "oldest" });
 * vitest.expect(result.status).toBe("success");
 * vitest.expect(result.data).toBeInstanceOf(Object);
 * // Further assertions could check the length of Shorts/Videos arrays (expected to be 0 or 1)
 * // and potentially the videoId/timestamp if available, though timestamp is not exposed in result.
 * });
 *
 * @example
 * // Vitest Test: Should handle watch history sorted by newest
 * // Requires YouTubeDLX_COOKIES environment variable. Note: This sorts by keeping only the single newest item.
 * vitest.it("should handle watch history sorted by newest", async () => {
 * const cookies = env.YouTubeDLX_COOKIES as string; // Assuming env is available
 * if (!cookies) {
 * console.warn("Skipping newest sort test due to missing YouTubeDLX_COOKIES.");
 * return;
 * }
 * const result = await watch_history({ cookies, sort: "newest" });
 * vitest.expect(result.status).toBe("success");
 * vitest.expect(result.data).toBeInstanceOf(Object);
 * // Further assertions could check the length of Shorts/Videos arrays (expected to be 0 or 1)
 * });
 *
 * @example
 * // Vitest Test: Should handle watch history sorted old to new by video ID
 * // Requires YouTubeDLX_COOKIES environment variable.
 * vitest.it("should handle watch history sorted old to new", async () => {
 * const cookies = env.YouTubeDLX_COOKIES as string; // Assuming env is available
 * if (!cookies) {
 * console.warn("Skipping old-to-new sort test due to missing YouTubeDLX_COOKIES.");
 * return;
 * }
 * const result = await watch_history({ cookies, sort: "old-to-new" });
 * vitest.expect(result.status).toBe("success");
 * vitest.expect(result.data).toBeInstanceOf(Object);
 * // Assertions could check if result.data.Videos and result.data.Shorts are sorted by videoId ascending.
 * // This would require fetching a larger dataset or having control over test data.
 * });
 *
 * @example
 * // Vitest Test: Should handle watch history sorted new to old by video ID
 * // Requires YouTubeDLX_COOKIES environment variable.
 * vitest.it("should handle watch history sorted new to old", async () => {
 * const cookies = env.YouTubeDLX_COOKIES as string; // Assuming env is available
 * if (!cookies) {
 * console.warn("Skipping new-to-old sort test due to missing YouTubeDLX_COOKIES.");
 * return;
 * }
 * const result = await watch_history({ cookies, sort: "new-to-old" });
 * vitest.expect(result.status).toBe("success");
 * vitest.expect(result.data).toBeInstanceOf(Object);
 * // Assertions could check if result.data.Videos and result.data.Shorts are sorted by videoId descending.
 * });
 *
 * @example
 * // Vitest Test: Should handle watch history with verbose logging and oldest sort
 * // Requires YouTubeDLX_COOKIES environment variable.
 * vitest.it("should handle watch history with verbose and oldest sort", async () => {
 * const cookies = env.YouTubeDLX_COOKIES as string; // Assuming env is available
 * if (!cookies) {
 * console.warn("Skipping verbose and oldest sort test due to missing YouTubeDLX_COOKIES.");
 * return;
 * }
 * const result = await watch_history({ cookies: mockCookies, verbose: true, sort: "oldest" }); // Using mockCookies as a fallback for type checking
 * vitest.expect(result.status).toBe("success");
 * vitest.expect(result.data).toBeInstanceOf(Object);
 * });
 *
 * @example
 * // Vitest Test: Should handle watch history with verbose logging and newest sort
 * // Requires YouTubeDLX_COOKIES environment variable.
 * vitest.it("should handle watch history with verbose and newest sort", async () => {
 * const cookies = env.YouTubeDLX_COOKIES as string; // Assuming env is available
 * if (!cookies) {
 * console.warn("Skipping verbose and newest sort test due to missing YouTubeDLX_COOKIES.");
 * return;
 * }
 * const result = await watch_history({ cookies: mockCookies, verbose: true, sort: "newest" }); // Using mockCookies as a fallback for type checking
 * vitest.expect(result.status).toBe("success");
 * vitest.expect(result.data).toBeInstanceOf(Object);
 * });
 *
 * @example
 * // Vitest Test: Should handle watch history with verbose logging and old to new sort
 * // Requires YouTubeDLX_COOKIES environment variable.
 * vitest.it("should handle watch history with verbose and old to new sort", async () => {
 * const cookies = env.YouTubeDLX_COOKIES as string; // Assuming env is available
 * if (!cookies) {
 * console.warn("Skipping verbose and old-to-new sort test due to missing YouTubeDLX_COOKIES.");
 * return;
 * }
 * const result = await watch_history({ cookies: mockCookies, verbose: true, sort: "old-to-new" }); // Using mockCookies as a fallback for type checking
 * vitest.expect(result.status).toBe("success");
 * vitest.expect(result.data).toBeInstanceOf(Object);
 * });
 *
 * @example
 * // Vitest Test: Should handle watch history with verbose logging and new to old sort
 * // Requires YouTubeDLX_COOKIES environment variable.
 * vitest.it("should handle watch history with verbose and new to old sort", async () => {
 * const cookies = env.YouTubeDLX_COOKIES as string; // Assuming env is available
 * if (!cookies) {
 * console.warn("Skipping verbose and new-to-old sort test due to missing YouTubeDLX_COOKIES.");
 * return;
 * }
 * const result = await watch_history({ cookies: mockCookies, verbose: true, sort: "new-to-old" }); // Using mockCookies as a fallback for type checking
 * vitest.expect(result.status).toBe("success");
 * vitest.expect(result.data).toBeInstanceOf(Object);
 * });
 *
 * @example
 * // Vitest Test: Should throw error for missing cookies (handled by explicit check)
 * vitest.it("should throw error for missing cookies (handled by explicit check)", async () => {
 * await vitest.expect(watch_history({ cookies: "" })).rejects.toThrowError(/Cookies not provided!/);
 * });
 *
 * @example
 * // Vitest Test: Should throw Zod error for missing cookies (handled by ZodSchema)
 * vitest.it("should throw Zod error for missing cookies (handled by ZodSchema)", async () => {
 * await vitest.expect(watch_history({} as any)).rejects.toThrowError(/cookies.*Required/); // Using 'as any' to bypass type checking for the test
 * });
 *
 * @example
 * // Vitest Test: Should throw Zod error for invalid sort value
 * // Requires YouTubeDLX_COOKIES environment variable for Zod parsing to reach the enum validation.
 * vitest.it("should throw Zod error for invalid sort", async () => {
 * const cookies = env.YouTubeDLX_COOKIES as string; // Assuming env is available
 * const mockCookies = cookies || "dummy_cookies_for_tests"; // Provide dummy cookies if missing for the Zod test structure
 * await vitest.expect(watch_history({ cookies: mockCookies, sort: "invalid-sort" as any })).rejects.toThrowError(/sort.*invalid enum value/); // Using 'as any' to bypass type checking for the test
 * });
 *
 * @example
 * // Example of Client Initialization Failure
 * // This scenario depends on the internal TubeLogin logic failing with invalid/expired cookies.
 * // try {
 * //    await watch_history({ cookies: "INVALID_OR_EXPIRED_COOKIES" });
 * // } catch (error) {
 * //    console.error("Expected Error (Client Initialization Failed):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // Example of History Fetch Failure
 * // This scenario depends on the client's getHistory() method failing after initialization.
 * // It's harder to trigger predictably with just input options.
 * // try {
 * //    await watch_history({ cookies: "VALID_COOKIES_BUT_FETCH_FAILS" });
 * // } catch (error) {
 * //    console.error("Expected Error (History Fetch Failed):", error instanceof Error ? error.message : error);
 * // }
 */
export default async function watch_history(options: WatchHistoryOptions): Promise<TubeResponse<{ Shorts: Short[]; Videos: Video[] }>> {
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
        const result: TubeResponse<{ Shorts: Short[]; Videos: Video[] }> = { status: "success", data: { Shorts: [], Videos: [] } };
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
                        if (!a?.videoId || !b?.videoId) return 0; // Add check for undefined a, b, or videoId
                        return a.videoId.localeCompare(b.videoId);
                    });
                if (result.data?.Videos) result.data.Videos.sort((a, b) => {
                    if (!a?.videoId || !b?.videoId) return 0; // Add check for undefined a, b, or videoId
                    return a.videoId.localeCompare(b.videoId);
                });
                break;
            case "new-to-old":
                if (result.data?.Shorts)
                    result.data.Shorts.sort((a, b) => {
                        if (!a?.videoId || !b?.videoId) return 0; // Add check for undefined a, b, or videoId
                        return b.videoId.localeCompare(a.videoId);
                    });
                if (result.data?.Videos) result.data.Videos.sort((a, b) => {
                    if (!a?.videoId || !b?.videoId) return 0; // Add check for undefined a, b, or videoId
                    return b.videoId.localeCompare(a.videoId);
                });
                break;
        }
        if (verbose) console.log(colors.green("@info:"), "Watch history fetched successfully!");
        if (verbose) console.log(colors.green("@info:"), "Watch history fetched successfully!");
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
