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
    vitest.it("should throw Zod error for missing query", async () => {
        await vitest.expect(videoComments({} as any)).rejects.toThrowError(/query.*Required/);
    });
    vitest.it("should throw Zod error for short query", async () => {
        await vitest.expect(videoComments({ query: "a" })).rejects.toThrowError(/query.*should be at least 2 characters/);
    });
    vitest.it("should throw error if no videos found for the query", async () => {
        try {
            await videoComments({ query: queryWithNoVideos });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/No videos found for the given query/);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no videos found.");
    });
    vitest.it("should throw error if no comments found for the video", async () => {
        try {
            await videoComments({ query: queryForVideoWithNoComments });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/No comments found for the video/);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no comments found.");
    });
});
