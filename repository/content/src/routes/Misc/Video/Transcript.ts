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
