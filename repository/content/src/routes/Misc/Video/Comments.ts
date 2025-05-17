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
