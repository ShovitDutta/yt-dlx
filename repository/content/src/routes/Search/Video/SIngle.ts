import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei"; // Assuming 'youtubei' is the library used by Client
// import { EventEmitter } from "events"; // Remove EventEmitter import as we are refactoring to async/await
import YouTubeID from "../../../utils/YouTubeId"; // Assuming YouTubeID helper function exists and returns Promise<string | null>

// Define the Zod schema for input validation
const ZodSchema = z.object({ videoLink: z.string().min(2) });

// Define the interface for the video data structure
export interface singleVideoType {
    id: string;
    title: string;
    thumbnails: string[]; // Assuming thumbnails is an array of strings (URLs)
    uploadDate: string;
    description: string;
    duration: number; // Assuming duration is in seconds
    isLive: boolean;
    viewCount: number;
    channelid: string | undefined; // Channel ID might be optional
    channelname: string | undefined; // Channel name might be optional
    tags: string[]; // Assuming tags is an array of strings
    likeCount: number | undefined; // Like count might be optional or null
}

// Helper function to fetch single video data using youtubei
// Refactored to not take emitter and throw errors or return null/data directly
export async function singleVideo({ videoId }: { videoId: string }): Promise<singleVideoType | null> {
    try {
        const youtube = new Client();
        const singleVideoData: any = await youtube.getVideo(videoId); // Assuming youtube.getVideo returns a Promise<any>

        if (!singleVideoData) {
            // If getVideo returns null or undefined, throw an error to be caught by the caller
            throw new Error(`${colors.red("@error: ")} Unable to fetch video data from youtubei client.`);
        }

        // Map the fetched data to the singleVideoType interface
        return {
            id: singleVideoData.id,
            title: singleVideoData.title,
            thumbnails: singleVideoData.thumbnails?.map((thumb: { url: string }) => thumb.url) || [], // Map thumbnail objects to URLs, default to empty array
            uploadDate: singleVideoData.uploadDate,
            description: singleVideoData.description,
            duration: singleVideoData.duration,
            isLive: singleVideoData.isLiveContent, // Assuming property name is isLiveContent
            viewCount: singleVideoData.viewCount,
            channelid: singleVideoData.channel?.id, // Optional chaining for channel properties
            channelname: singleVideoData.channel?.name,
            tags: singleVideoData.tags || [], // Default to empty array if tags is null/undefined
            likeCount: singleVideoData.likeCount,
        };
    } catch (error: any) {
        // Re-throw specific errors from the youtubei client or generic unexpected errors
        throw new Error(`${colors.red("@error: ")} Error fetching video data: ${error.message}`);
    }
}

/**
 * @shortdesc Fetches detailed data for a single YouTube video using async/await instead of events.
 *
 * @description This function retrieves comprehensive information about a specific YouTube video using its link. It extracts the video ID and then fetches details such as title, thumbnails, upload date, description, duration, view count, channel information, tags, and like count using async/await.
 *
 * The function requires a valid YouTube video link.
 *
 * It returns a Promise that resolves with an object conforming to the `singleVideoType` interface containing video details, or rejects with an error, replacing the EventEmitter pattern.
 *
 * @param options - An object containing the configuration options.
 * @param {string} options.videoLink - The YouTube video URL. **Required**.
 *
 * @returns {Promise<singleVideoType>} A Promise that resolves with the video data upon success.
 * @throws {Error} Throws a formatted error if argument validation fails (ZodError), if the video link format is invalid, if fetching data from the YouTube API fails, or if other unexpected errors occur.
 *
 * @example
 * // 1. Fetch data for a valid YouTube video link using async/await with try...catch
 * const videoLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
 * try {
 * const videoData = await YouTubeDLX.Search.Video.Single({ videoLink });
 * console.log("Video Data:", videoData);
 * } catch (error) {
 * console.error("Error fetching video data:", error);
 * }
 *
 * @example
 * // 2. Fetch data using a shortened YouTube link with async/await
 * const videoLink = "https://youtu.be/dQw4w9WgXcQ";
 * try {
 * const videoData = await YouTubeDLX.Search.Video.Single({ videoLink });
 * console.log("Video Data:", videoData);
 * } catch (error) {
 * console.error("Error fetching video data:", error);
 * }
 *
 * @example
 * // 3. Handle invalid video link format with async/await
 * const videoLink = "this is not a youtube link";
 * try {
 * const videoData = await YouTubeDLX.Search.Video.Single({ videoLink });
 * console.log("Video Data:", videoData); // This line won't be reached
 * } catch (error) {
 * console.error("Expected Error (incorrect video link):", error.message); // Catches the thrown error
 * }
 *
 * @example
 * // 4. Handle fetching data for a non-existent or private video with async/await
 * const videoLink = "https://www.youtube.com/watch?v=nonexistentvideo123"; // Assuming this link represents a non-existent video
 * try {
 * const videoData = await YouTubeDLX.Search.Video.Single({ videoLink });
 * console.log("Video Data:", videoData); // This line won't be reached
 * } catch (error) {
 * console.error("Expected Error (unable to fetch video data):", error.message); // Catches the thrown error from singleVideo
 * }
 *
 * // Note: Original examples using .on(...) are replaced by standard Promise handling (.then/.catch or await with try/catch).
 */
export default async function video_data({ videoLink }: z.infer<typeof ZodSchema>): Promise<singleVideoType> {
    // Refactored to use async/await and return a Promise directly, replacing EventEmitter pattern.
    try {
        // Perform Zod schema validation on the provided options. This call is synchronous.
        // It will throw a ZodError if validation fails based on the defined schema.
        ZodSchema.parse({ videoLink });

        // Await the asynchronous call to the YouTubeID helper to extract the video ID.
        const vId = await YouTubeID(videoLink); // Assuming YouTubeID returns Promise<string | null>

        // Check if the video ID was successfully extracted.
        if (!vId) {
            // If YouTubeID returns null, throw an error to be caught by the main try/catch.
            throw new Error(`${colors.red("@error: ")} Incorrect video link format provided.`);
        }

        // Await the asynchronous call to the refactored singleVideo helper function.
        // This helper now throws errors or returns data directly.
        const metaData: singleVideoType | null = await singleVideo({ videoId: vId });

        // Check if metadata was successfully retrieved by the singleVideo helper.
        // Although singleVideo is refactored to throw on fetch failure, this check
        // handles the case where singleVideo might still return null in some edge cases
        // or if its internal logic changes.
        if (!metaData) {
            // If singleVideo returns null (shouldn't happen with the refactor but as a safeguard), throw an error.
            throw new Error(`${colors.red("@error: ")} Unable to retrieve video information after fetching.`);
        }

        // If successful, return the fetched metadata. The async function automatically wraps this in a resolved Promise.
        return metaData;
    } catch (error: any) {
        // Catch any errors that occurred during the process (Zod validation, YouTubeID extraction, singleVideo fetch).
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
