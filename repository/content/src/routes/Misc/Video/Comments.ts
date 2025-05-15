import path from "path";
import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import { EventEmitter } from "events";
import { Innertube, UniversalCache } from "youtubei.js";
import { CommentType } from "../../../interfaces/CommentType";
const ZodSchema = z.object({ query: z.string().min(2), verbose: z.boolean().optional() });
async function fetchVideoComments({ query, verbose }: z.infer<typeof ZodSchema>): Promise<CommentType[] | null> {
    try {
        if (verbose) console.log(colors.green("@info:"), `Searching for videos with query: ${query}`);
        const youtubeClient = new Client();
        const searchResults = await youtubeClient.search(query, { type: "video" });
        const video = searchResults.items[0];
        if (!video || !video.id) {
            if (verbose) console.log(colors.red("@error:"), "No videos found for the given query");
            return null;
        }
        const videoId = video.id;
        if (verbose) console.log(colors.green("@info:"), `Workspaceing comments for video ID: ${videoId}`);
        const youtubeInnertube = await Innertube.create({
            user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            cache: new UniversalCache(true, path.join(process.cwd(), "YouTubeDLX")),
        });
        const response = await youtubeInnertube.getComments(videoId);
        let comments: CommentType[] = response.contents
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
            return null;
        }
        if (verbose) console.log(colors.green("@info:"), "Video comments fetched!");
        return comments;
    } catch (error: any) {
        console.error(colors.red("@error: ") + error.message);
        return null;
    }
}
/**
 * @shortdesc Fetches comments for a YouTube video based on a search query.
 *
 * @description This function searches for a YouTube video using the provided query and, if a video is found, retrieves its comments. It provides the comments as a structured list. Optional verbose logging is available to show details about the search and fetching process.
 *
 * The function first searches for a video matching the `query` and then attempts to fetch comments for the first video found.
 *
 * It supports the following configuration options:
 * - **query:** A string representing the search query to find the video. This is a mandatory parameter and must be at least 2 characters long.
 * - **verbose:** An optional boolean value that, if true, enables detailed logging to the console, showing the search query, found video ID, and comment fetching progress.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - `"data"`: Emitted when comments are successfully fetched and processed. The emitted data is an array of comment objects (`CommentType`).
 * - `"error"`: Emitted when an error occurs at any stage, such as argument validation, no video found for the query, no comments found for the video, or internal library errors during search or fetching. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.query - The search query to find the video. Must be at least 2 characters long. **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 *
 * @returns {EventEmitter} An EventEmitter instance for handling events during comment fetching.
 *
 * @example
 * // 1. Fetch comments for a video by search query
 * YouTubeDLX.Misc.Video.Comments({ query: "video title or topic" })
 * .on("data", (comments) => console.log("Comments:", comments))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 2. Fetch comments for a video by search query with verbose logging
 * YouTubeDLX.Misc.Video.Comments({ query: "another video query", verbose: true })
 * .on("data", (comments) => console.log("Comments (Verbose):", comments))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 3. Missing required 'query' parameter (will result in an error - Zod validation)
 * YouTubeDLX.Misc.Video.Comments({} as any)
 * .on("error", (error) => console.error("Expected Error (missing query):", error));
 *
 * @example
 * // 4. 'query' parameter is too short (will result in an error - Zod validation)
 * YouTubeDLX.Misc.Video.Comments({ query: "a" })
 * .on("error", (error) => console.error("Expected Error (query too short):", error));
 *
 * @example
 * // 5. Query finds no videos
 * // Note: Provide a query unlikely to return any YouTube videos.
 * YouTubeDLX.Misc.Video.Comments({ query: "very unlikely video search 1a2b3c4d5e" })
 * .on("error", (error) => console.error("Expected Error (no videos found):", error));
 *
 * @example
 * // 6. Query finds a video but it has no comments
 * // Note: Finding a video with absolutely no comments might be difficult.
 * // The error emitted would be: "@error: No videos or comments found for the query" if fetchVideoComments returns null.
 * // Internally, fetchVideoComments first checks for comments array length and returns null if empty.
 * // YouTubeDLX.Misc.Video.Comments({ query: "a video known to have no comments" })
 * // .on("error", (error) => console.error("Expected Error (no comments found):", error));
 *
 * @example
 * // 7. An unexpected error occurs during the process (e.g., network issues, library errors)
 * // Note: This is a general catch-all error handler.
 * // The error emitted will vary depending on the cause.
 * // YouTubeDLX.Misc.Video.Comments({ query: "query that might cause an internal error" })
 * // .on("error", (error) => console.error("Expected Error (unexpected error):", error));
 *
 */
export default function video_comments(options: z.infer<typeof ZodSchema>): EventEmitter {
    const emitter = new EventEmitter();
    (async () => {
        try {
            ZodSchema.parse(options);
            const { query, verbose } = options;
            const comments = await fetchVideoComments({ query, verbose });
            if (!comments) {
                emitter.emit("error", `${colors.red("@error:")} No videos or comments found for the query`);
                return;
            }
            emitter.emit("data", comments);
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
