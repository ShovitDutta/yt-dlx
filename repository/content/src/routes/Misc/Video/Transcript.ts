import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import YouTubeID from "../../../utils/YouTubeId";
const ZodSchema = z.object({ videoLink: z.string().min(2) });
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
async function getVideoTranscript({ videoId }: { videoId: string }): Promise<VideoTranscriptType[]> {
    try {
        const youtube = new Client();
        const captions = await youtube.getVideoTranscript(videoId);
        if (!captions) return [];
        return captions.map(caption => ({
            text: caption.text,
            start: caption.start,
            duration: caption.duration,
            segments: caption.segments.map(segment => ({ utf8: segment.utf8, tOffsetMs: segment.tOffsetMs, acAsrConf: segment.acAsrConf })),
        }));
    } catch (error: any) {
        throw new Error(error.message);
    }
}
type VideoTranscriptOptions = z.infer<typeof ZodSchema>;
/**
 * @shortdesc Fetches the transcript (captions) for a YouTube video given its link.
 *
 * @description This function retrieves the available transcript or captions for a specific YouTube video.
 * It first extracts the video ID from the provided video link using a utility function,
 * and then uses the `youtubei.js` library to fetch the transcript data.
 *
 * The function requires a valid YouTube video link as input.
 *
 * The process involves:
 * 1. Validating the input `videoLink` using Zod.
 * 2. Extracting the video ID from the `videoLink`.
 * 3. Fetching the transcript data using the video ID.
 * 4. Structuring the fetched data into an array of `VideoTranscriptType` objects.
 *
 * If a transcript is not available for the video in any language, or if the video link is invalid, the function will throw an error.
 *
 * @param {object} options - The configuration options for fetching the video transcript.
 * @param {string} options.videoLink - The link to the YouTube video. Must be a string with a minimum length of 2 characters. **Required**.
 *
 * @returns {Promise<VideoTranscriptType[]>} A Promise that resolves with an array of `VideoTranscriptType` objects. Each object represents a segment of the transcript and includes the text, start time, duration, and detailed segment information. Returns an empty array or throws an error if no transcript is available or an error occurs.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., `videoLink` is missing or less than 2 characters).
 * - Throws an `Error` if the provided `videoLink` is in an incorrect format and a video ID cannot be extracted.
 * - Throws an `Error` if the transcript data is not available for the video or the internal fetching process returns no data.
 * - Throws an `Error` for any underlying issues during the transcript fetching using the internal `youtubei.js` client.
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Running Basic Transcript Fetch Example using a googleusercontent URL
 * try {
 * const result = await videoTranscript({ videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
 * console.log("Video Transcript:", result);
 * } catch (error) {
 * console.error("Basic Transcript Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Transcript Fetch with Shortened YouTube URL Example
 * try {
 * const result = await videoTranscript({ videoLink: "https://youtu.be/dQw4w9WgXcQ" }); // Represents a shortened URL like youtu.be/...
 * console.log("Video Transcript:", result);
 * } catch (error) {
 * console.error("Shortened URL Transcript Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Zod Validation Error Example (Missing videoLink - will throw ZodError)
 * try {
 * await videoTranscript({} as any); // Using 'as any' to simulate missing required parameter
 * console.log("This should not be reached - Missing videoLink Example.");
 * } catch (error) {
 * console.error("Expected Error (Missing videoLink):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Invalid videoLink Example (Incorrect format - will throw Error)
 * try {
 * await videoTranscript({ videoLink: "this is not a video link" });
 * console.log("This should not be reached - Invalid videoLink Example.");
 * } catch (error) {
 * console.error("Expected Error (Incorrect videoLink):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Running No Transcript Available Example (will throw Error)
 * // Use a video link for a video known to not have any transcripts/captions.
 * try {
 * await videoTranscript({ videoLink: "https://www.youtube.com/watch?v=VIDEO_ID_WITHOUT_TRANSCRIPT" }); // Represents a video without transcripts
 * console.log("This should not be reached - No Transcript Example.");
 * } catch (error) {
 * console.error("Expected Error (No Transcript Available):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Example of an Unexpected Error during fetch (e.g., network issue, API change)
 * // This is harder to trigger predictably with a simple example.
 * // try {
 * //    // Use a video link that might somehow cause an unexpected issue with the internal client
 * //    await videoTranscript({ videoLink: "link causing internal error" });
 * // } catch (error) {
 * //    console.error("Expected Unexpected Error:", error instanceof Error ? error.message : error);
 * // }
 */
export default async function videoTranscript({ videoLink }: VideoTranscriptOptions): Promise<VideoTranscriptType[]> {
    try {
        ZodSchema.parse({ videoLink });
        const vId = await YouTubeID(videoLink);
        if (!vId) {
            throw new Error(`${colors.red("@error:")} Incorrect video link`);
        }
        const transcriptData: VideoTranscriptType[] = await getVideoTranscript({ videoId: vId });
        if (!transcriptData || transcriptData.length === 0) {
            throw new Error(`${colors.red("@error:")} Unable to get transcript for this video!`);
        }
        return transcriptData;
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
        console.log("--- Running Basic Transcript Fetch Example ---");
        const result = await videoTranscript({ videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
        console.log("Video Transcript:", result);
    } catch (error) {
        console.error("Basic Transcript Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Transcript Fetch with Shortened URL Example ---");
        const result = await videoTranscript({ videoLink: "https://youtu.be/dQw4w9WgXcQ" });
        console.log("Video Transcript:", result);
    } catch (error) {
        console.error("Shortened URL Transcript Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Missing videoLink Example ---");
        await videoTranscript({} as any);
        console.log("This should not be reached - Missing videoLink Example.");
    } catch (error) {
        console.error("Expected Error (Missing videoLink):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Invalid videoLink Example ---");
        await videoTranscript({ videoLink: "this is not a video link" });
        console.log("This should not be reached - Invalid videoLink Example.");
    } catch (error) {
        console.error("Expected Error (Incorrect videoLink):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running No Transcript Available Example ---");
        await videoTranscript({ videoLink: "https://www.youtube.com/watch?v=VIDEO_ID_WITHOUT_TRANSCRIPT" });
        console.log("This should not be reached - No Transcript Example.");
    } catch (error) {
        console.error("Expected Error (No Transcript Available):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
