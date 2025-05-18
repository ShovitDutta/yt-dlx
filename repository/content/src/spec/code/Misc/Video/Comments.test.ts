import videoComments from "../../../../routes/Misc/Video/Comments";
import * as vitest from "vitest";
vitest.describe("videoComments", () => {
    const validQuery = "trailer";
    const queryWithNoVideos = "very unlikely video search 1a2b3c4d5e";
    const queryForVideoWithNoComments = "a video known to have no comments";
    vitest.it("should handle basic comments fetch", async () => {
        try {
            const result = await videoComments({ query: validQuery });
            vitest.expect(Array.isArray(result)).toBe(true);
            if (result.length > 0) {
                vitest.expect(result[0]).toHaveProperty("comment_id");
                vitest.expect(result[0]).toHaveProperty("comment");
                vitest.expect(result[0]).toHaveProperty("author");
            }
        } catch (error) {
            console.warn(`Basic comments fetch failed for query "${validQuery}". This test requires a real video query that returns a video with comments.`, error);
            throw error;
        }
    });
    vitest.it("should handle comments fetch with verbose logging", async () => {
        try {
            const result = await videoComments({ query: validQuery, verbose: true });
            vitest.expect(Array.isArray(result)).toBe(true);
            if (result.length > 0) {
                vitest.expect(result[0]).toHaveProperty("comment_id");
            }
        } catch (error) {
            console.warn(`Verbose comments fetch failed for query "${validQuery}". This test requires a real video query that returns a video with comments.`, error);
            throw error;
        }
    });
});
