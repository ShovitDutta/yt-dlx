import extract from "../../../../routes/Misc/Video/Extract";
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
});
