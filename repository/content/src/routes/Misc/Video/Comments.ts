import path from "path"; // Import path for caching
import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei"; // Assuming 'youtubei' is used for initial video search
// import { EventEmitter } from "events"; // Remove EventEmitter import as we are refactoring to async/await
import { Innertube, UniversalCache } from "youtubei.js"; // Assuming 'youtubei.js' is used for fetching comments

// Assuming CommentType interface is defined elsewhere and imported,
// keeping the original inline definition for reference during refactoring.
export interface CommentType {
    comment_id: string;
    is_pinned: boolean;
    comment: string;
    published_time: string;
    author_is_channel_owner: boolean;
    creator_thumbnail_url: string;
    like_count: number;
    is_member: boolean;
    author: string;
    is_hearted: boolean;
    is_liked: boolean;
    is_disliked: boolean;
    reply_count: number;
    hasReplies: boolean;
}

// Define the Zod schema for input validation
const ZodSchema = z.object({ query: z.string().min(2), verbose: z.boolean().optional() }); // Mandatory query, min 2 characters, optional verbose

// Helper function to fetch video comments
// Refactored to throw errors or return array directly, and handle its own verbose logging.
async function fetchVideoCommentsHelper({ query, verbose }: z.infer<typeof ZodSchema>): Promise<CommentType[] | null> {
    try {
        if (verbose) console.log(colors.green("@info:"), `Searching for videos with query: ${query}`);

        // Use youtubei Client for the initial video search
        const youtubeClient = new Client(); // Assuming Client constructor is synchronous
        // Assuming youtubeClient.search returns a Promise<SearchResults> where SearchResults has an 'items' array
        const searchResults = await youtubeClient.search(query, { type: "video" });

        // Get the first video from the search results
        const video = searchResults.items?.[0]; // Use optional chaining

        if (!video || !video.id) {
            if (verbose) console.log(colors.red("@error:"), "No videos found for the given query.");
            // Return null if no video is found, the caller will handle emitting an error
            return null;
        }

        const videoId = video.id;
        if (verbose) console.log(colors.green("@info:"), `Workspaceing comments for video ID: ${videoId}`);

        // Use youtubei.js Innertube for fetching comments
        // Assuming Innertube.create returns a Promise<Innertube instance>
        // Assuming Innertube instance has a getComments method that returns a Promise<Response>
        // where Response has a contents array of comment threads, and each thread has a comment property
        const youtubeInnertube = await Innertube.create({
            user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", // Hardcoded user agent from original
            cache: new UniversalCache(true, path.join(process.cwd(), "YouTubeDLX")), // Cache configuration from original
        });

        // Fetch comments for the video ID
        const response = await youtubeInnertube.getComments(videoId);

        // Map the fetched comments to the CommentType interface and filter out invalid ones
        let comments: CommentType[] = response.contents
            .map((thread: any) => {
                // Assuming 'thread' structure from youtubei.js response
                const comment = thread?.comment; // Use optional chaining

                // Check for essential comment properties before mapping
                if (!comment || !comment.content?.text || !comment.published_time || !comment.author?.name) {
                    return null; // Skip comments that lack required fields
                }

                return {
                    comment_id: comment.comment_id || "", // Default to empty string if missing
                    is_pinned: comment.is_pinned || false, // Default to false if missing
                    comment: comment.content.text,
                    published_time: comment.published_time,
                    author_is_channel_owner: comment.author_is_channel_owner || false, // Default to false
                    creator_thumbnail_url: comment.creator_thumbnail_url || "", // Default to empty string
                    like_count: comment.like_count || 0, // Default to 0 if missing
                    is_member: comment.is_member || false, // Default to false
                    author: comment.author.name,
                    is_hearted: comment.is_hearted || false, // Default to false
                    is_liked: comment.is_liked || false, // Default to false
                    is_disliked: comment.is_disliked || false, // Default to false
                    reply_count: comment.reply_count || 0, // Default to 0
                    hasReplies: thread.has_replies || false, // Default to false
                } as CommentType; // Explicitly cast to CommentType
            })
            .filter((item): item is CommentType => item !== null); // Filter out any null values resulting from mapping failures

        if (comments.length === 0) {
            if (verbose) console.log(colors.red("@error:"), "No comments found for the video.");
            // Return null if no comments are found after filtering, caller handles error emission
            return null;
        }

        if (verbose) console.log(colors.green("@info:"), "Video comments fetched!");
        return comments; // Return the array of comments
    } catch (error: any) {
        // Catch any errors during the search or comment fetching and re-throw with context
        // Removed console.error and returning null from original helper's catch block
        throw new Error(`${colors.red("@error: ")} Error during video search or comment fetching: ${error.message}`);
    }
}

/**
 * @shortdesc Fetches comments for a YouTube video based on a search query using async/await instead of events.
 *
 * @description This function searches for a YouTube video using the provided query and, if a video is found, retrieves its comments using async/await. It provides the comments as a structured list. Optional verbose logging is available.
 *
 * The function first searches for a video matching the `query` and then attempts to fetch comments for the first video found.
 *
 * It returns a Promise that resolves with an array of comment objects (`CommentType`) upon success, or rejects with an error.
 *
 * @param options - An object containing the configuration options validated by ZodSchema.
 * @param {string} options.query - The search query to find the video. Must be at least 2 characters long. **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 *
 * @returns {Promise<CommentType[]>} A Promise that resolves with an array of comment objects upon successful fetching.
 * @throws {Error} Throws a formatted error if argument validation fails (ZodError), if no video is found for the query, if no comments are found for the video, or if internal library errors occur during search or fetching.
 */
export default async function video_comments(options: z.infer<typeof ZodSchema>): Promise<CommentType[]> {
    // Refactored to use async/await and return a Promise directly, replacing EventEmitter pattern.
    try {
        // Perform Zod schema validation on the provided options. This call is synchronous.
        // It will throw a ZodError if validation fails based on the defined schema.
        ZodSchema.parse(options);

        // Await the asynchronous call to the refactored fetchVideoCommentsHelper function.
        // This helper now throws errors or returns the comments array or null.
        const comments: CommentType[] | null = await fetchVideoCommentsHelper(options); // Pass options directly

        // Check if comments were successfully retrieved by the helper.
        // The helper returns null if no video was found or if the found video had no comments.
        if (!comments) {
            // If the helper returns null, throw an error indicating no videos or comments were found.
            throw new Error(`${colors.red("@error:")} No videos or comments found for the query.`);
        }

        // If successful, return the array of comments. The async function automatically wraps this in a resolved Promise.
        return comments;
    } catch (error: any) {
        // Catch any errors that occurred during the process (Zod validation, helper execution).
        // Format the error message based on the error type and re-throw it to reject the main function's Promise.
        if (error instanceof ZodError) {
            // Handle Zod validation errors by formatting the error details.
            throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        } else if (error instanceof Error) {
            // Re-throw standard Error objects with their existing message.
            throw new Error(`${colors.red("@error:")} ${error.message}`);
        } else {
            // Handle any other unexpected error types by converting them to a string.
            throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
        }
    } finally {
        // This block executes after the try block successfully returns or the catch block throws.
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
