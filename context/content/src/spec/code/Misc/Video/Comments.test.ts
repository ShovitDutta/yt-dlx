import videoComments from "../../../../routes/Misc/Video/Comments";
import * as vitest from "vitest";
vitest.describe("videoComments", () => {
    vitest.it("should handle basic comments fetch", async () => {
        try {
            const result = await videoComments({ Query: "https://www.youtube.com/watch?v=30LWjhZzg50" });
            vitest.expect(Array.isArray(result)).toBe(true);
            if (result && result.length > 0) {
                vitest.expect(result[0]).toHaveProperty("comment_id");
                vitest.expect(result[0]).toHaveProperty("comment");
                vitest.expect(result[0]).toHaveProperty("author");
            }
        } catch (error) {
            console.warn('Basic comments fetch failed for Query "https://www.youtube.com/watch?v=30LWjhZzg50". This test requires a real video Query that returns a video with comments. ' + error);
            throw error;
        }
    });
    vitest.it("should handle comments fetch with Verbose logging", async () => {
        try {
            const result = await videoComments({ Query: "https://www.youtube.com/watch?v=30LWjhZzg50", Verbose: true });
            vitest.expect(Array.isArray(result)).toBe(true);
            if (result && result.length > 0) {
                vitest.expect(result[0]).toHaveProperty("comment_id");
            }
        } catch (error) {
            console.warn('Verbose comments fetch failed for Query "https://www.youtube.com/watch?v=30LWjhZzg50". This test requires a real video Query that returns a video with comments. ' + error);
            throw error;
        }
    });
});
