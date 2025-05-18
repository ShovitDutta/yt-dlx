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
 * @shortdesc Fetches the transcript (captions) for a YouTube video using its link.
 *
 * @description This function takes a YouTube video link, extracts the video ID, and fetches the available transcript or captions for that video using the `youtubei.js` library.
 * It processes the raw transcript data into a structured format, including text, start time, duration, and detailed segments.
 *
 * The function requires a valid YouTube video link as input.
 *
 * The function supports the following configuration options:
 * - **videoLink:** A string representing the YouTube video URL. Must be a valid link from which a video ID can be extracted. Minimum length of 2 characters enforced by validation. **Required**.
 * - **verbose:** An optional boolean flag that, if true, enables detailed console logging during the process. Defaults to `false`.
 *
 * The function returns a Promise that resolves with an array of `VideoTranscriptType` objects, where each object represents a segment of the transcript.
 * If the video has no transcript available, an error will be thrown.
 *
 * @param {object} options - The configuration options for fetching the video transcript.
 * @param {string} options.videoLink - The YouTube video URL (minimum 2 characters). **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 *
 * @returns {Promise<VideoTranscriptType[]>} A Promise that resolves with an array of `VideoTranscriptType` objects representing the video transcript segments.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing `videoLink`, `videoLink` is less than 2 characters).
 * - Throws an `Error` if the provided `videoLink` is incorrect or a valid video ID cannot be extracted from it.
 * - Throws an `Error` if the internal `youtubei.js` client fails to fetch the transcript.
 * - Throws an `Error` if the video exists but has no transcript available.
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Running Basic Transcript Fetch Example
 * // Replace with a real video link that has a transcript
 * const videoLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
 * try {
 * const result = await videoTranscript({ videoLink });
 * console.log("Transcript segments:", result);
 * if (result.length > 0) {
 * console.log("First segment:", result[0].text);
 * }
 * } catch (error) {
 * console.error("Basic Transcript Fetch Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Zod Validation Error Example (Missing videoLink - will throw ZodError)
 * try {
 * await videoTranscript({} as any); // Using 'as any' to simulate missing required parameter
 * console.log("This should not be reached - Missing videoLink Example.");
 * } catch (error) {
 * console.error("Expected Error (Missing videoLink):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Zod Validation Error Example (Short videoLink - will throw ZodError)
 * try {
 * await videoTranscript({ videoLink: "a" }); // videoLink is less than minimum length (2)
 * console.log("This should not be reached - Short videoLink Example.");
 * } catch (error) {
 * console.error("Expected Error (videoLink Too Short):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Error Example (Invalid videoLink format - will throw Error)
 * try {
 * const videoLink = "this is not a video link";
 * await videoTranscript({ videoLink });
 * console.log("This should not be reached - Invalid videoLink Format Example.");
 * } catch (error) {
 * console.error("Expected Error (Incorrect video link):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Running Error Example (No transcript available - will throw Error)
 * // Replace with a real video link that exists but is known to have no transcript (e.g., private video, video without captions)
 * const videoLinkNoTranscript = "https://www.youtube.com/watch?v=someVideoWithoutTranscript";
 * try {
 * await videoTranscript({ videoLink: videoLinkNoTranscript });
 * console.log("This should not be reached - No Transcript Found Example.");
 * } catch (error) {
 * console.error("Expected Error (No Transcript Found):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Example of an Unexpected Error during fetch (e.g., network issue, API change)
 * // This is harder to trigger predictably with a simple example.
 * // try {
 * //    // Use a link that might somehow cause an unexpected issue with the internal client
 * //    const problematicLink = "https://www.youtube.com/watch?v=problematicVideo";
 * //    await videoTranscript({ videoLink: problematicLink });
 * // } catch (error) {
 * //    console.error("Expected Unexpected Error:", error instanceof Error ? error.message : error);
 * // }
 */
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
import * as vitest from "vitest";
vitest.describe("videoTranscript", () => {
    vitest.it("should handle basic transcript fetch", async () => {
        const videoLink = "https://www.youtube.com/watch?v=example1";
        try {
            const result = await videoTranscript({ videoLink });
            vitest.expect(Array.isArray(result)).toBe(true);
            if (result.length > 0) {
                vitest.expect(result[0]).toHaveProperty("text");
                vitest.expect(result[0]).toHaveProperty("start");
                vitest.expect(result[0]).toHaveProperty("duration");
            }
        } catch (error) {
            console.warn(`Basic transcript fetch failed for ${videoLink}. This might require a real video link with a transcript.`, error);
            throw error;
        }
    });
    vitest.it("should handle transcript fetch with a different link format", async () => {
        const videoLink = "https://youtu.be/example2";
        try {
            const result = await videoTranscript({ videoLink });
            vitest.expect(Array.isArray(result)).toBe(true);
            if (result.length > 0) {
                vitest.expect(result[0]).toHaveProperty("text");
                vitest.expect(result[0]).toHaveProperty("start");
                vitest.expect(result[0]).toHaveProperty("duration");
            }
        } catch (error) {
            console.warn(`Transcript fetch failed for ${videoLink}. This might require a real video link with a transcript.`, error);
            throw error;
        }
    });
    vitest.it("should throw Zod error for missing videoLink", async () => {
        await vitest.expect(videoTranscript({} as any)).rejects.toThrowError(/videoLink.*Required/);
    });
    vitest.it("should throw error for invalid videoLink format", async () => {
        const videoLink = "this is not a video link";
        await vitest.expect(videoTranscript({ videoLink })).rejects.toThrowError(/Incorrect video link/);
    });
    vitest.it("should throw error if no transcript is available", async () => {
        const videoLink = "https://www.youtube.com/watch?v=no_transcript_example";
        try {
            await videoTranscript({ videoLink });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/Unable to get transcript for this video!/);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no transcript available.");
    });
});
