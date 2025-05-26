import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import YouTubeID from "../../../utils/YouTubeId";
const ZodSchema = z.object({ VideoLink: z.string().min(2), Verbose: z.boolean().optional() });
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
async function getVideoTranscript({ VideoId }: { VideoId: string }): Promise<VideoTranscriptType[]> {
    try {
        const youtube = new Client();
        const captions = await youtube.getVideoTranscript(VideoId);
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
 * @summary Retrieves the transcript of a YouTube video.
 *
 * This function fetches the automatically generated or user-provided transcript for a given YouTube video.
 * It takes a video link as input and returns an array of transcript segments, each containing the text, start time, duration, and detailed segment information.
 * The function utilizes the `youtubei` library to interact with YouTube's data.
 *
 * @param options - An object containing the options for transcript retrieval.
 * @param options.VideoLink - A string representing the YouTube video URL or ID. This is a mandatory parameter and must be at least 2 characters long.
 * @param options.Verbose - An optional boolean. If `true`, enables verbose logging, displaying additional information during execution. Defaults to `false`.
 *
 * @returns {Promise<VideoTranscriptType[]>} A promise that resolves to an array of `VideoTranscriptType` objects,
 * where each object represents a segment of the video transcript with the following properties:
 * - `text`: The full text of the transcript segment.
 * - `start`: The start time of the segment in seconds.
 * - `duration`: The duration of the segment in seconds.
 * - `segments`: An array of `CaptionSegment` objects, providing more granular details about the segment's text.
 * - `utf8`: The UTF-8 encoded text of the caption segment.
 * - `tOffsetMs`: (Optional) The time offset in milliseconds from the start of the video for this specific sub-segment.
 * - `acAsrConf`: The ASR (Automatic Speech Recognition) confidence score for the segment.
 *
 * @throws {Error}
 * - If the `VideoLink` is incorrect or invalid: `Error: @error: Incorrect video link`
 * - If the function is unable to retrieve a transcript for the given video: `Error: @error: Unable to get transcript for this video!`
 * - If argument validation fails due to invalid `options` (e.g., incorrect type or missing required fields): `Error: @error: Argument validation failed: [path.to.field]: [message]`
 * - For any unexpected errors during the process: `Error: @error: An unexpected error occurred: [error_message]`
 */
export default async function Misc_Video_Transcript({ VideoLink, Verbose }: VideoTranscriptOptions): Promise<VideoTranscriptType[]> {
    try {
        ZodSchema.parse({ VideoLink, Verbose });
        const vId = await YouTubeID(VideoLink);
        if (!vId) throw new Error(colors.red("@error: ") + " Incorrect video link");
        const transcriptData: VideoTranscriptType[] = await getVideoTranscript({ VideoId: vId });
        if (!transcriptData || transcriptData.length === 0) throw new Error(colors.red("@error: ") + " Unable to get transcript for this video!");
        return transcriptData;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(colors.red("@error: ") + " Argument validation failed: " + error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", "));
        else if (error instanceof Error) throw error;
        else throw new Error(colors.red("@error: ") + " An unexpected error occurred: " + String(error));
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
