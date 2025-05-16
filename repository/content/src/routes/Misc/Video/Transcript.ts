import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei"; // Assuming 'youtubei' provides a 'Client' class
// import { EventEmitter } from "events"; // Remove EventEmitter import as we are refactoring to async/await
import YouTubeID from "../../../utils/YouTubeId"; // Assuming YouTubeID helper function exists and returns Promise<string | null>

// Define the Zod schema for input validation
const ZodSchema = z.object({ videoLink: z.string().min(2) }); // Mandatory video link

// Define internal types based on the original code's usage
export interface CaptionSegment {
    utf8: string;
    tOffsetMs?: number;
    acAsrConf: number;
}
export interface VideoTranscriptType {
    text: string;
    start: number;
    duration: number;
    segments: CaptionSegment[];
}

// Helper function to fetch video transcript by video ID
// Refactored to return Promise<VideoTranscriptType[]> and throw errors or return [] directly
async function getVideoTranscriptHelper({ videoId }: { videoId: string }): Promise<VideoTranscriptType[]> {
    try {
        const youtube = new Client(); // Assuming Client constructor is synchronous

        // Assuming youtube.getVideoTranscript returns a Promise<Caption[] | null>
        const captions = await youtube.getVideoTranscript(videoId); // Assuming videoId is valid

        // If no captions are found, return an empty array as in the original helper logic.
        if (!captions) {
            return [];
        }

        // Map the captions to the desired VideoTranscriptType structure
        const transcript: VideoTranscriptType[] = captions.map(caption => ({
            text: caption.text,
            start: caption.start, // Assuming property name is start
            duration: caption.duration, // Assuming property name is duration
            segments: caption.segments.map((segment: any) => ({
                // Assuming segments is an array of objects
                utf8: segment.utf8,
                tOffsetMs: segment.tOffsetMs, // Optional property
                acAsrConf: segment.acAsrConf,
            })),
        }));

        return transcript; // Return the array of transcript entries
    } catch (error: any) {
        // Catch any errors during transcript fetching (e.g., network issue, API change)
        // Removed emitter.emit and returning empty array from original helper's catch block
        throw new Error(`${colors.red("@error: ")} Error fetching video transcript: ${error.message}`);
    }
}

/**
 * @shortdesc Fetches the transcript of a YouTube video using async/await instead of events.
 *
 * @description This function retrieves the available transcript (captions) for a given YouTube video link using async/await. It requires a valid video link as input.
 *
 * The function takes the video link, extracts the video ID, and then uses the YouTube API (via the youtubei library) to fetch the transcript. It returns a Promise that resolves with an array of transcript segments upon success or rejects with an error.
 *
 * @param options - An object containing the configuration options validated by ZodSchema.
 * @param {string} options.videoLink - The URL of the YouTube video. **Required**.
 *
 * @returns {Promise<VideoTranscriptType[]>} A Promise that resolves with an array of transcript segments upon successful fetching.
 * @throws {Error} Throws a formatted error if argument validation fails (ZodError), if providing an incorrect video link (unable to extract ID), if fetching the transcript fails (e.g., no transcript available or API error), or if other unexpected errors occur.
 *
 * @example
 * // 1. Fetch transcript for a valid video link using async/await with try...catch
 * const videoLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Replace with a real video link
 * try {
 * const transcript = await YouTubeDLX.Misc.Video.Transcript({ videoLink });
 * console.log("Video Transcript:", transcript);
 * if (transcript.length > 0) console.log("First segment:", transcript[0].text);
 * } catch (error) {
 * console.error("Error fetching transcript:", error);
 * }
 *
 * @example
 * // 2. Handle missing required 'videoLink' parameter with async/await
 * try {
 * const transcript = await YouTubeDLX.Misc.Video.Transcript({} as any);
 * console.log("Video Transcript:", transcript); // This line won't be reached
 * } catch (error) {
 * console.error("Expected Error (missing videoLink):", error.message); // Catches the thrown ZodError
 * }
 *
 * @example
 * // 3. Handle invalid 'videoLink' format (fails YouTubeID extraction) with async/await
 * const invalidLink = "this is not a video link";
 * try {
 * const transcript = await YouTubeDLX.Misc.Video.Transcript({ videoLink: invalidLink });
 * console.log("Video Transcript:", transcript); // This line won't be reached
 * } catch (error) {
 * console.error("Expected Error (incorrect video link):", error.message); // Catches the thrown error
 * }
 *
 * @example
 * // 4. Handle video link for a video without a transcript with async/await
 * // Replace with a video link for a video known to not have a transcript.
 * const noTranscriptLink = "https://www.youtube.com/watch?v=VIDEO_ID_WITHOUT_TRANSCRIPT";
 * try {
 * const transcript = await YouTubeDLX.Misc.Video.Transcript({ videoLink: noTranscriptLink });
 * console.log("Video Transcript:", transcript); // This line won't be reached if the error is caught
 * } catch (error) {
 * console.error("Expected Error (no transcript available):", error.message); // Catches the thrown error from the main function
 * }
 *
 * // Note: Original examples using .on(...) are replaced by standard Promise handling (.then/.catch or await with try/catch).
 */
export default async function video_transcript({ videoLink }: z.infer<typeof ZodSchema>): Promise<VideoTranscriptType[]> {
    // Refactored to use async/await and return a Promise directly, replacing EventEmitter pattern.
    try {
        // Perform Zod schema validation on the provided options. This call is synchronous.
        // It will throw a ZodError if validation fails based on the defined schema.
        ZodSchema.parse({ videoLink });

        // Await the asynchronous call to the YouTubeID helper to extract the video ID.
        const vId = await YouTubeID(videoLink); // Assuming YouTubeID returns Promise<string | null>

        // Check if the video ID was successfully extracted.
        if (!vId) {
            // If YouTubeID returns null, throw an error indicating the link was incorrect.
            throw new Error(`${colors.red("@error: ")} Incorrect video link provided. Unable to extract video ID.`);
        }

        // Await the asynchronous call to the refactored getVideoTranscriptHelper function.
        // This helper now throws errors on fetch failure or returns an array (potentially empty).
        const transcriptData: VideoTranscriptType[] = await getVideoTranscriptHelper({ videoId: vId });

        // Check if the helper returned an empty array (meaning no transcript was found).
        // The helper throws on API fetch failure, so an empty array here means no transcript was available for the video.
        if (!transcriptData || transcriptData.length === 0) {
            // If no transcript was found, throw a specific error.
            throw new Error(`${colors.red("@error: ")} Unable to get transcript for this video!`);
        }

        // If successful and transcript data is found, return the array of transcript entries. The async function automatically wraps this in a resolved Promise.
        return transcriptData;
    } catch (error: any) {
        // Catch any errors that occurred during the process (Zod validation, YouTubeID extraction, helper execution failure, no transcript found).
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
