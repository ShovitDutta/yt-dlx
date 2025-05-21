import extract from "../../../../routes/Misc/Video/Extract";
import * as vitest from "vitest";
vitest.describe("extract", () => {
    const validQuery = "test video";
    const queryThatShouldFail = "a query that should return no results 12345abcde";
    vitest.it("should handle basic video extract", async () => {
        const result = await extract({ query: validQuery });
        vitest.expect(result).toHaveProperty("MetaData");
        vitest.expect(result.MetaData).toBeInstanceOf(Object);
        vitest.expect(result).toHaveProperty("comments");
        vitest.expect(Array.isArray(result.comments) || result.comments === null).toBe(true);
        vitest.expect(result).toHaveProperty("transcript");
        vitest.expect(Array.isArray(result.transcript) || result.transcript === null).toBe(true);
    });
    vitest.it("should handle video extract with verbose logging", async () => {
        const result = await extract({ query: validQuery, verbose: true });
        vitest.expect(result).toBeInstanceOf(Object);
    });
    vitest.it("should handle video extract with useTor", async () => {
        const result = await extract({ query: validQuery, useTor: false });
        vitest.expect(result).toBeInstanceOf(Object);
    });
    vitest.it("should handle video extract with verbose and useTor", async () => {
        const result = await extract({ query: validQuery, verbose: true, useTor: false });
        vitest.expect(result).toBeInstanceOf(Object);
    });
});
