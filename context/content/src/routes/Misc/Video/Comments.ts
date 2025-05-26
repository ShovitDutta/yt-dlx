import path from "path";
import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import { Innertube, UniversalCache } from "youtubei.js";
import { CommentType } from "../../../interfaces/CommentType";
const ZodSchema = z.object({ Query: z.string().min(2), Verbose: z.boolean().optional() });
type VideoCommentsOptions = z.infer<typeof ZodSchema>;
async function fetchVideoComments({ Query, Verbose }: VideoCommentsOptions): Promise<CommentType[]> {
    try {
        if (Verbose) console.log(colors.green("@info: ") + "Searching for videos with Query: " + Query);
        const youtubeClient = new Client();
        const searchResults = await youtubeClient.search(Query, { type: "video" });
        const video = searchResults.items[0];
        if (!video || !video.id) {
            if (Verbose) console.log(colors.red("@error: ") + "No videos found for the given Query");
            throw new Error("No videos found for the given Query");
        }
        const VideoId = video.id;
        if (Verbose) console.log(colors.green("@info: ") + "Fetching comments for video ID: " + VideoId);
        const youtubeInnertube = await Innertube.create({
            user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            cache: new UniversalCache(true, path.join(process.cwd(), "YouTubeDLX")),
        });
        const response = await youtubeInnertube.getComments(VideoId);
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
            if (Verbose) console.log(colors.red("@error: ") + "No comments found for the video");
            throw new Error("No comments found for the video");
        }
        if (Verbose) console.log(colors.green("@info: ") + "Video comments fetched!");
        return comments;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(colors.red("@error: ") + " Argument validation failed: " + error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", "));
        else if (error instanceof Error) throw error;
        else throw new Error(colors.red("@error: ") + " An unexpected error occurred: " + String(error));
    } finally {
        if (Verbose) console.log(colors.green("@info: ") + "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
/**
 * @shortdesc Fetches comments for a YouTube video based on a search query.
 *
 * @description This function first searches for a YouTube video using the provided `Query`. Once a video is identified (the first result of the search),
 * it then proceeds to fetch all available comments for that specific video. It leverages the `youtubei` and `youtubei.js` (Innertube) libraries
 * to perform the search and comment retrieval.
 *
 * @param options - An object containing the query and optional verbose mode.
 * @param options.Query - A string representing the search query for the YouTube video (e.g., video title, URL, or ID). This is a mandatory parameter and must be at least 2 characters long.
 * @param options.Verbose - An optional boolean. If `true`, enables verbose logging, displaying additional information about the search process and comment fetching to the console. Defaults to `false`.
 *
 * @returns {Promise<CommentType[]>} A promise that resolves to an array of `CommentType` objects,
 * where each object represents a comment and includes the following properties:
 * - `comment_id`: The unique identifier of the comment.
 * - `is_pinned`: A boolean indicating if the comment is pinned by the video creator.
 * - `comment`: The actual text content of the comment.
 * - `published_time`: A string indicating when the comment was published (e.g., "3 days ago").
 * - `author_is_channel_owner`: A boolean indicating if the comment's author is the channel owner.
 * - `creator_thumbnail_url`: The URL to the comment author's profile picture thumbnail.
 * - `like_count`: The number of likes the comment has received.
 * - `is_member`: A boolean indicating if the comment author is a channel member.
 * - `author`: The name of the comment author.
 * - `is_hearted`: A boolean indicating if the comment has been "hearted" by the video creator.
 * - `is_liked`: A boolean indicating if the current user has liked the comment.
 * - `is_disliked`: A boolean indicating if the current user has disliked the comment.
 * - `reply_count`: The number of replies to the comment.
 * - `hasReplies`: A boolean indicating if the comment thread has replies.
 *
 * @throws {Error}
 * - If no videos are found for the given `Query`: `Error: No videos found for the given Query`.
 * - If no comments are found for the identified video: `Error: No comments found for the video`.
 * - If argument validation fails due to invalid `options` (e.g., incorrect type or missing required fields): `Error: @error: Argument validation failed: [path.to.field]: [message]`.
 * - For any other unexpected errors during the process: `Error: @error: An unexpected error occurred: [error_message]`.
 */
export default async function videoComments({ Query, Verbose }: VideoCommentsOptions): Promise<CommentType[]> {
    try {
        ZodSchema.parse({ Query, Verbose });
        const comments = await fetchVideoComments({ Query, Verbose });
        return comments;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(colors.red("@error: ") + " Argument validation failed: " + error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", "));
        else if (error instanceof Error) throw error;
        else throw new Error(colors.red("@error: ") + " An unexpected error occurred: " + String(error));
    } finally {
        if (Verbose) console.log(colors.green("@info: ") + "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
