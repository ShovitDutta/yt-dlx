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
 * @returns {Promise<CommentType[]>} A Promise that resolves with an array of `CommentType` objects representing the comments for the video. Returns an empty array or throws an error if no comments are found.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing `query`, `query` is less than 2 characters).
 * - Throws an `Error` if no videos are found for the given `query`.
 * - Throws an `Error` if no comments are found for the selected video.
 * - Throws an `Error` for any underlying issues during video search or comment fetching using the internal `youtubei.js` client.
 * - Throws a generic `Error` for any unexpected issues.
 *
 * @example
 * // 1. Running Basic Comments Fetch Example
 * try {
 * const result = await videoComments({ query: "video title or topic" });
 * console.log("Comments:", result);
 * } catch (error) {
 * console.error("Basic Comments Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Comments Fetch with Verbose Logging Example
 * try {
 * const result = await videoComments({ query: "another video query", verbose: true });
 * console.log("Comments:", result);
 * } catch (error) {
 * console.error("Verbose Comments Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Zod Validation Error Example (Missing Query - will throw ZodError)
 * try {
 * await videoComments({} as any); // Using 'as any' to simulate missing required parameter
 * console.log("This should not be reached - Missing Query Example.");
 * } catch (error) {
 * console.error("Expected Error (Missing Query):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Zod Validation Error Example (Short Query - will throw ZodError)
 * try {
 * await videoComments({ query: "a" }); // Query is less than minimum length (2)
 * console.log("This should not be reached - Short Query Example.");
 * } catch (error) {
 * console.error("Expected Error (Query Too Short):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Running No Videos Found Example (will throw Error)
 * // Use a query very unlikely to match any video.
 * try {
 * await videoComments({ query: "very unlikely video search 1a2b3c4d5e" });
 * console.log("This should not be reached - No Videos Found Example.");
 * } catch (error) {
 * console.error("Expected Error (No Videos Found):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Running No Comments Found Example (will throw Error)
 * // Use a query for a video known to exist but have no comments enabled or posted.
 * try {
 * await videoComments({ query: "a video known to have no comments" });
 * console.log("This should not be reached - No Comments Found Example.");
 * } catch (error) {
 * console.error("Expected Error (No Comments Found):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 7. Example of an Unexpected Error during fetch (e.g., network issue, API change)
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
(async () => {
    try {
        console.log("--- Running Basic Comments Fetch Example ---");
        const result = await videoComments({ query: "video title or topic" });
        console.log("Comments:", result);
    } catch (error) {
        console.error("Basic Comments Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Comments Fetch with Verbose Logging Example ---");
        const result = await videoComments({ query: "another video query", verbose: true });
        console.log("Comments:", result);
    } catch (error) {
        console.error("Verbose Comments Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Missing Query Example ---");
        await videoComments({} as any);
        console.log("This should not be reached - Missing Query Example.");
    } catch (error) {
        console.error("Expected Error (Missing Query):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Short Query Example ---");
        await videoComments({ query: "a" });
        console.log("This should not be reached - Short Query Example.");
    } catch (error) {
        console.error("Expected Error (Query Too Short):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running No Videos Found Example ---");
        await videoComments({ query: "very unlikely video search 1a2b3c4d5e" });
        console.log("This should not be reached - No Videos Found Example.");
    } catch (error) {
        console.error("Expected Error (No Videos Found):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running No Comments Found Example ---");
        await videoComments({ query: "a video known to have no comments" });
        console.log("This should not be reached - No Comments Found Example.");
    } catch (error) {
        console.error("Expected Error (No Comments Found):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
