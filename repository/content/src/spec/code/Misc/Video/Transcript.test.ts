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
