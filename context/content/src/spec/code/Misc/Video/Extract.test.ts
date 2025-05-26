import extract from "../../../../routes/Misc/Video/Extract";
import * as vitest from "vitest";
vitest.describe("extract", () => {
    vitest.it("should handle basic video extract", async () => {
        const result = await extract({ Query: "https://www.youtube.com/watch?v=30LWjhZzg50" });
        vitest.expect(result).toHaveProperty("MetaData");
        vitest.expect(result.MetaData).toBeInstanceOf(Object);
        vitest.expect(result).toHaveProperty("comments");
        vitest.expect(Array.isArray(result.comments) || result.comments === null).toBe(true);
        vitest.expect(result).toHaveProperty("transcript");
        vitest.expect(Array.isArray(result.transcript) || result.transcript === null).toBe(true);
    });
    vitest.it("should handle video extract with Verbose logging", async () => {
        const result = await extract({ Query: "https://www.youtube.com/watch?v=30LWjhZzg50", Verbose: true });
        vitest.expect(result).toBeInstanceOf(Object);
    });
    vitest.it("should handle video extract with UseTor", async () => {
        const result = await extract({ Query: "https://www.youtube.com/watch?v=30LWjhZzg50", UseTor: false });
        vitest.expect(result).toBeInstanceOf(Object);
    });
    vitest.it("should handle video extract with Verbose and UseTor", async () => {
        const result = await extract({ Query: "https://www.youtube.com/watch?v=30LWjhZzg50", Verbose: true, UseTor: false });
        vitest.expect(result).toBeInstanceOf(Object);
    });
    vitest.it("should handle a query that should fail", async () => {
        await vitest.expect(extract({ Query: "a Query that should return no results 12345abcde" })).rejects.toThrow();
    });
    vitest.it("should handle a video with no comments", async () => {
        const result = await extract({ Query: "a video known to have no comments" });
        vitest.expect(result).toHaveProperty("comments");
        vitest.expect(result.comments).toBeNull();
    });
    vitest.it("should handle a video with no transcript", async () => {
        const result = await extract({ Query: "https://www.youtube.com/watch?v=another_video_id_without_transcript" });
        vitest.expect(result).toHaveProperty("transcript");
        vitest.expect(result.transcript).toBeNull();
    });
});
