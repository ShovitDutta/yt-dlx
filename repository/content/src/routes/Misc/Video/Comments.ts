import path from "path";
import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import { Innertube, UniversalCache } from "youtubei.js";
import { CommentType } from "../../../interfaces/CommentType";
const ZodSchema = z.object({ query: z.string().min(2), verbose: z.boolean().optional() });
type VideoCommentsOptions = z.infer<typeof ZodSchema>;
async function fetchVideoComments({ query, verbose }: VideoCommentsOptions): Promise<CommentType[]> {
    try {
        if (verbose) console.log(colors.green("@info:"), `Searching for videos with query: ${query}`);
        const youtubeClient = new Client();
        const searchResults = await youtubeClient.search(query, { type: "video" });
        const video = searchResults.items[0];
        if (!video || !video.id) {
            if (verbose) console.log(colors.red("@error:"), "No videos found for the given query");
            throw new Error("No videos found for the given query");
        }
        const videoId = video.id;
        if (verbose) console.log(colors.green("@info:"), `Fetching comments for video ID: ${videoId}`);
        const youtubeInnertube = await Innertube.create({
            user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            cache: new UniversalCache(true, path.join(process.cwd(), "YouTubeDLX")),
        });
        const response = await youtubeInnertube.getComments(videoId);
        const comments: CommentType[] = response.contents
            .map(thread => {
                const comment = thread?.comment;
                if (!comment || !comment.content?.text || !comment.published_time || !comment.author?.name) return null;
                return {
                    comment_id: comment.comment_id || "",
                    is_pinned: comment.is_pinned || false,
                    comment: comment.content.text,
                    published_time: comment.published_time,
                    author_is_channel_owner: comment.author_is_channel_owner || false,
                    creator_thumbnail_url: comment.creator_thumbnail_url || "",
                    like_count: comment.like_count || 0,
                    is_member: comment.is_member || false,
                    author: comment.author.name,
                    is_hearted: comment.is_hearted || false,
                    is_liked: comment.is_liked || false,
                    is_disliked: comment.is_disliked || false,
                    reply_count: comment.reply_count || 0,
                    hasReplies: thread.has_replies || false,
                } as CommentType;
            })
            .filter((item): item is CommentType => item !== null);
        if (comments.length === 0) {
            if (verbose) console.log(colors.red("@error:"), "No comments found for the video");
            throw new Error("No comments found for the video");
        }
        if (verbose) console.log(colors.green("@info:"), "Video comments fetched!");
        return comments;
    } catch (error: any) {
        throw new Error(error.message);
    }
}
/**
 * @shortdesc Fetches comments for a YouTube video based on a search query or URL.
 *
 * @description This function searches YouTube for a video matching the provided query or URL,
 * and then retrieves the comments for the first video found.
 * It uses the `youtubei.js` library internally for searching and fetching comments.
 * The function requires a query string as input and can optionally provide verbose logging.
 *
 * The process involves:
 * 1. Searching for a video using the `query`.
 * 2. Selecting the first video from the search results.
 * 3. Fetching comments for the selected video ID.
 * 4. Parsing and structuring the fetched comments into a `CommentType` array.
 *
 * The function supports the following configuration options:
 * - **Query:** A string representing the Youtube query or video URL. Must be at least 2 characters long. **Required**.
 * - **Verbose:** An optional boolean flag that, if true, enables detailed console logging during the search and fetching process. Defaults to `false`.
 *
 * The function returns a Promise that resolves with an array of comment objects (`CommentType[]`) if successful.
 *
 * @param {object} options - The configuration options for fetching video comments.
 * @param {string} options.query - The Youtube query or video URL (minimum 2 characters). **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 *
 * @returns {Promise<CommentType[]>} A Promise that resolves with an array of `CommentType` objects representing the comments for the video. Returns an array (potentially empty if the video has no comments but the API returns an empty list) or throws an error if no videos are found or if fetching comments fails. Note that if the video has comments but the API response structure is unexpected or empty, an error "No comments found for the video" is thrown.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing `query`, `query` is less than 2 characters).
 * - Throws an `Error` if no videos are found for the given `query`.
 * - Throws an `Error` if no comments are found for the selected video (based on parsing the API response).
 * - Throws an `Error` for any underlying issues during video search or comment fetching using the internal `youtubei.js` client.
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Basic Comments Fetch Example
 * try {
 * const result = await videoComments({ query: "official trailer" });
 * console.log("Comments:", result.slice(0, 5)); // Log first 5 comments
 * console.log(\`Workspaceed \${result.length} comments.\`);
 * } catch (error) {
 * console.error("Basic Comments Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Comments Fetch with Verbose Logging Example
 * try {
 * const result = await videoComments({ query: "popular music video", verbose: true });
 * console.log("Comments:", result.slice(0, 5)); // Log first 5 comments
 * console.log(\`Workspaceed \${result.length} comments (verbose).\`);
 * } catch (error) {
 * console.error("Verbose Comments Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Zod Validation Error Example (Missing Query)
 * try {
 * await videoComments({} as any); // Simulating missing required parameter
 * console.log("This should not be reached - Missing Query Example.");
 * } catch (error) {
 * console.error("Expected Error (Missing Query):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Zod Validation Error Example (Short Query)
 * try {
 * await videoComments({ query: "a" }); // Query is less than minimum length (2)
 * console.log("This should not be reached - Short Query Example.");
 * } catch (error) {
 * console.error("Expected Error (Query Too Short):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Error Example: No Videos Found for the Query
 * // Use a query very unlikely to match any video.
 * try {
 * await videoComments({ query: "nonexistentvideospecialssearchtermxyz123" });
 * console.log("This should not be reached - No Videos Found Example.");
 * } catch (error) {
 * console.error("Expected Error (No Videos Found):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Error Example: No Comments Found for the Video
 * // Use a query for a video known to exist but have no comments enabled or posted.
 * // Finding such a video reliably for an example can be tricky.
 * // try {
 * // await videoComments({ query: "a video known to exist but has no comments" });
 * // console.log("This should not be reached - No Comments Found Example.");
 * // } catch (error) {
 * // console.error("Expected Error (No Comments Found):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 7. Example of an Unexpected Error during fetch (e.g., network issue, API change in youtubei.js)
 * // This is harder to trigger predictably with a simple example.
 * // try {
 * //    // Use a query that might somehow cause an unexpected issue with the internal clients
 * //    await videoComments({ query: "query causing internal error" });
 * // } catch (error) {
 * //    console.error("Expected Unexpected Error:", error instanceof Error ? error.message : error);
 * // }
 */
export default async function videoComments({ query, verbose }: VideoCommentsOptions): Promise<CommentType[]> {
    try {
        ZodSchema.parse({ query, verbose });
        const comments = await fetchVideoComments({ query, verbose });
        return comments;
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
import * as vitest from "vitest";
vitest.describe("videoComments", () => {
    const validQuery = "trailer";
    const queryWithNoVideos = "very unlikely video search 1a2b3c4d5e";
    const queryForVideoWithNoComments = "a video known to have no comments";
    vitest.it("should handle basic comments fetch", async () => {
        try {
            const result = await videoComments({ query: validQuery });
            vitest.expect(Array.isArray(result)).toBe(true);
            if (result.length > 0) {
                vitest.expect(result[0]).toHaveProperty("comment_id");
                vitest.expect(result[0]).toHaveProperty("comment");
                vitest.expect(result[0]).toHaveProperty("author");
            }
        } catch (error) {
            console.warn(`Basic comments fetch failed for query "${validQuery}". This test requires a real video query that returns a video with comments.`, error);
            throw error;
        }
    });
    vitest.it("should handle comments fetch with verbose logging", async () => {
        try {
            const result = await videoComments({ query: validQuery, verbose: true });
            vitest.expect(Array.isArray(result)).toBe(true);
            if (result.length > 0) {
                vitest.expect(result[0]).toHaveProperty("comment_id");
            }
        } catch (error) {
            console.warn(`Verbose comments fetch failed for query "${validQuery}". This test requires a real video query that returns a video with comments.`, error);
            throw error;
        }
    });
    vitest.it("should throw Zod error for missing query", async () => {
        await vitest.expect(videoComments({} as any)).rejects.toThrowError(/query.*Required/);
    });
    vitest.it("should throw Zod error for short query", async () => {
        await vitest.expect(videoComments({ query: "a" })).rejects.toThrowError(/query.*should be at least 2 characters/);
    });
    vitest.it("should throw error if no videos found for the query", async () => {
        try {
            await videoComments({ query: queryWithNoVideos });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/No videos found for the given query/);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no videos found.");
    });
    vitest.it("should throw error if no comments found for the video", async () => {
        try {
            await videoComments({ query: queryForVideoWithNoComments });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/No comments found for the video/);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no comments found.");
    });
});
