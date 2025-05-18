import * as vitest from "vitest";
vitest.describe("extract", () => {
    const validQuery = "test video";
    const queryThatShouldFail = "a query that should return no results 12345abcde";
    vitest.it("should handle basic video extract", async () => {
        const result = await extract({ query: validQuery });
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toHaveProperty("meta_data");
        vitest.expect(result.data.meta_data).toBeInstanceOf(Object);
        vitest.expect(result.data).toHaveProperty("comments");
        vitest.expect(Array.isArray(result.data.comments) || result.data.comments === null).toBe(true);
        vitest.expect(result.data).toHaveProperty("transcript");
        vitest.expect(Array.isArray(result.data.transcript) || result.data.transcript === null).toBe(true);
        vitest.expect(result.data).toHaveProperty("BestAudioLow");
        vitest.expect(result.data).toHaveProperty("ManifestLow");
    });
    vitest.it("should handle video extract with verbose logging", async () => {
        const result = await extract({ query: validQuery, verbose: true });
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle video extract with useTor", async () => {
        const result = await extract({ query: validQuery, useTor: false });
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle video extract with verbose and useTor", async () => {
        const result = await extract({ query: validQuery, verbose: true, useTor: false });
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should throw Zod error for missing query", async () => {
        await vitest.expect(extract({} as any)).rejects.toThrowError(/query.*Required/);
    });
    vitest.it("should throw Zod error for short query", async () => {
        await vitest.expect(extract({ query: "a" })).rejects.toThrowError(/query.*should be at least 2 characters/);
    });
    vitest.it("should throw error if unable to get response", async () => {
        try {
            await extract({ query: queryThatShouldFail });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/Unable to get response!/);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no engine data.");
    });
    vitest.it("should return comments as null if no comments found", async () => {
        const videoWithNoCommentsQuery = "a video where comments are disabled";
        try {
            const result = await extract({ query: videoWithNoCommentsQuery });
            vitest.expect(result.data.comments).toBeNull();
        } catch (error) {
            console.warn(`Test for video with no comments failed for query "${videoWithNoCommentsQuery}". This might require a real video query with comments disabled.`, error);
            throw error;
        }
    });
    vitest.it("should return transcript as null if no transcript found", async () => {
        const videoWithNoTranscriptQuery = "a video with no transcript";
        try {
            const result = await extract({ query: videoWithNoTranscriptQuery });
            vitest.expect(result.data.transcript).toBeNull();
        } catch (error) {
            console.warn(`Test for video with no transcript failed for query "${videoWithNoTranscriptQuery}". This might require a real video query with no transcript.`, error);
            throw error;
        }
    });
});
