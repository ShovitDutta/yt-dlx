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
import { describe, it, expect } from "vitest";
describe("videoTranscript", () => {
    it("should handle basic transcript fetch", async () => {
        const videoLink = "https://www.youtube.com/watch?v=example1";
        try {
            const result = await videoTranscript({ videoLink });
            expect(Array.isArray(result)).toBe(true);
            if (result.length > 0) {
                expect(result[0]).toHaveProperty("text");
                expect(result[0]).toHaveProperty("start");
                expect(result[0]).toHaveProperty("duration");
            }
        } catch (error) {
            console.warn(`Basic transcript fetch failed for ${videoLink}. This might require a real video link with a transcript.`, error);
            throw error;
        }
    });
    it("should handle transcript fetch with a different link format", async () => {
        const videoLink = "https://youtu.be/example2";
        try {
            const result = await videoTranscript({ videoLink });
            expect(Array.isArray(result)).toBe(true);
            if (result.length > 0) {
                expect(result[0]).toHaveProperty("text");
                expect(result[0]).toHaveProperty("start");
                expect(result[0]).toHaveProperty("duration");
            }
        } catch (error) {
            console.warn(`Transcript fetch failed for ${videoLink}. This might require a real video link with a transcript.`, error);
            throw error;
        }
    });
    it("should throw Zod error for missing videoLink", async () => {
        await expect(videoTranscript({} as any)).rejects.toThrowError(/videoLink.*Required/);
    });
    it("should throw error for invalid videoLink format", async () => {
        const videoLink = "this is not a video link";
        await expect(videoTranscript({ videoLink })).rejects.toThrowError(/Incorrect video link/);
    });
    it("should throw error if no transcript is available", async () => {
        const videoLink = "https://www.youtube.com/watch?v=no_transcript_example";
        try {
            await videoTranscript({ videoLink });
        } catch (error: any) {
            if (error instanceof Error) {
                expect(error.message).toMatch(/Unable to get transcript for this video!/);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no transcript available.");
    });
});
