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
        if (Verbose) console.log(colors.green("@info:"), `Searching for videos with Query: ${Query}`);
        const youtubeClient = new Client();
        const searchResults = await youtubeClient.search(Query, { type: "video" });
        const video = searchResults.items[0];
        if (!video || !video.id) {
            if (Verbose) console.log(colors.red("@error:"), "No videos found for the given Query");
            throw new Error("No videos found for the given Query");
        }
        const VideoId = video.id;
        if (Verbose) console.log(colors.green("@info:"), `Fetching comments for video ID: ${VideoId}`);
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
            if (Verbose) console.log(colors.red("@error:"), "No comments found for the video");
            throw new Error("No comments found for the video");
        }
        if (Verbose) console.log(colors.green("@info:"), "Video comments fetched!");
        return comments;
    } catch (error: any) {
        throw new Error(error.message);
    }
}
export default async function videoComments({ Query, Verbose }: VideoCommentsOptions): Promise<CommentType[]> {
    try {
        ZodSchema.parse({ Query, Verbose });
        const comments = await fetchVideoComments({ Query, Verbose });
        return comments;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw error;
        else throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
