import videoTranscript from "../../../../routes/Misc/Video/Transcript";
import * as vitest from "vitest";
vitest.describe("videoTranscript", () => {
    vitest.it("should handle basic transcript fetch", async () => {
        try {
            const result = await videoTranscript({ VideoLink: "https://www.youtube.com/watch?v=30LWjhZzg50" });
            vitest.expect(Array.isArray(result)).toBe(true);
            if (result && result.length > 0) {
                vitest.expect(result[0]).toHaveProperty("text");
                vitest.expect(result[0]).toHaveProperty("start");
                vitest.expect(result[0]).toHaveProperty("duration");
            }
        } catch (error) {
            console.warn('Basic transcript fetch failed for "https://www.youtube.com/watch?v=30LWjhZzg50". This might require a real video link with a transcript. ' + error);
            throw error;
        }
    });
    vitest.it("should handle transcript fetch with Verbose logging", async () => {
        try {
            const result = await videoTranscript({ VideoLink: "https://www.youtube.com/watch?v=30LWjhZzg50", Verbose: true });
            vitest.expect(Array.isArray(result)).toBe(true);
            if (result && result.length > 0) {
                vitest.expect(result[0]).toHaveProperty("text");
                vitest.expect(result[0]).toHaveProperty("start");
                vitest.expect(result[0]).toHaveProperty("duration");
            }
        } catch (error) {
            console.warn('Basic transcript fetch failed for "https://www.youtube.com/watch?v=30LWjhZzg50". This might require a real video link with a transcript. ' + error);
            throw error;
        }
    });
});
