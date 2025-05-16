import colors from "colors";
import { z, ZodError } from "zod";
import { Client, Video } from "youtubei"; // Assuming 'youtubei' provides Client and Video types
// import { EventEmitter } from "events"; // Remove EventEmitter import as we are refactoring to async/await

// Define the Zod schema for input validation
const ZodSchema = z.object({ videoId: z.string().min(2) }); // Mandatory video ID, min 2 characters

// Define the interface for the related video result items
export interface relatedVideosType {
    id: string;
    title: string;
    isLive: boolean;
    duration: number | null; // duration might be null for live streams
    uploadDate: string | null; // uploadDate might be null or undefined
    thumbnails: { url: string; width: number; height: number }[]; // Assuming thumbnail structure
}

// Helper function to fetch related videos by video ID
// Refactored to return Promise<relatedVideosType[]> and throw errors or return [] directly
async function relatedVideosHelper({ videoId }: { videoId: string }): Promise<relatedVideosType[]> {
    try {
        const youtube = new Client(); // Assuming Client constructor is synchronous

        // Assuming youtube.getVideo returns a Promise<Video | null> and Video has a 'related' property with 'items'
        const videoData: any = await youtube.getVideo(videoId);

        // Check if video data or related items are available
        if (!videoData?.related?.items || videoData.related.items.length === 0) {
            // If no related videos are found or the structure is missing, return an empty array.
            return [];
        }

        // Map the related video items to the desired relatedVideosType structure
        const result: relatedVideosType[] = videoData.related.items
            .filter((item: any) => item.type === "video") // Filter to ensure only video types are mapped
            .map((item: any) => ({
                id: item.id,
                title: item.title,
                isLive: item.isLive, // Assuming property name is isLive
                duration: item.duration || null, // Assuming duration is number or null, default to null if falsy
                uploadDate: item.uploadDate || null, // Assuming uploadDate is string or null, default to null if falsy
                thumbnails:
                    item.thumbnails?.map((thumb: { url: string; width: number; height: number }) => ({
                        // Map thumbnail objects
                        url: thumb.url,
                        width: thumb.width,
                        height: thumb.height,
                    })) || [], // Default to empty array if thumbnails missing
            }));

        return result; // Return the array of related videos
    } catch (error: any) {
        // Catch any errors during fetching video data (e.g., video not found, API error)
        // Removed emitter.emit and returning null from original helper's catch block
        throw new Error(`${colors.red("@error: ")} Error fetching video data or related videos: ${error.message}`);
    }
}

/**
 * @shortdesc Fetches related videos for a given YouTube video ID using async/await instead of events.
 *
 * @description This function retrieves a list of videos that are related to a specified YouTube video ID using async/await. It uses the `youtubei` library to interact with the YouTube API and find relevant videos.
 *
 * The function requires a valid YouTube video ID and returns a Promise that resolves with an array of related video objects or rejects with an error.
 *
 * @param options - An object containing the configuration options validated by ZodSchema.
 * @param {string} options.videoId - The YouTube video ID. **Required**, minimum length 2.
 *
 * @returns {Promise<relatedVideosType[]>} A Promise that resolves with an array of related video objects upon successful fetching.
 * @throws {Error} Throws a formatted error if argument validation fails (ZodError), if fetching video data or related videos fails (e.g., video not found, API error), or if no related videos are found for the provided ID.
 */
export default async function related_videos({ videoId }: z.infer<typeof ZodSchema>): Promise<relatedVideosType[]> {
    // Refactored to use async/await and return a Promise directly, replacing EventEmitter pattern.
    try {
        // Perform Zod schema validation on the provided options. This call is synchronous.
        // It will throw a ZodError if validation fails based on the defined schema.
        ZodSchema.parse({ videoId });

        // Await the asynchronous call to the refactored relatedVideosHelper function.
        // This helper now throws errors on fetch failure or returns an array (potentially empty).
        const videos: relatedVideosType[] = await relatedVideosHelper({ videoId });

        // Check if the helper returned an empty array (meaning no related videos were found).
        // The helper throws on API fetch failure, so an empty array here means no related items were listed for the video.
        if (!videos || videos.length === 0) {
            // If no related videos were found, throw a specific error.
            throw new Error(`${colors.red("@error: ")} No related videos found for the provided video ID.`);
        }

        // If successful and related videos are found, return the array of videos. The async function automatically wraps this in a resolved Promise.
        return videos;
    } catch (error: any) {
        // Catch any errors that occurred during the process (Zod validation, helper execution failure, no related videos found).
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
