import extract from "../../../../routes/Misc/Video/Extract";
import * as vitest from "vitest";
vitest.describe("extract", () => {
    const validQuery = "https://www.youtube.com/watch?v=s49rbh8xXKI";
    const queryThatShouldFail = "a Query that should return no results 12345abcde";
    vitest.it("should handle basic video extract", async () => {
        const result = await extract({ Query: validQuery });
        vitest.expect(result).toHaveProperty("MetaData");
        vitest.expect(result.MetaData).toBeInstanceOf(Object);
        vitest.expect(result).toHaveProperty("comments");
        vitest.expect(Array.isArray(result.comments) || result.comments === null).toBe(true);
        vitest.expect(result).toHaveProperty("transcript");
        vitest.expect(Array.isArray(result.transcript) || result.transcript === null).toBe(true);
    });
    vitest.it("should handle video extract with Verbose logging", async () => {
        const result = await extract({ Query: validQuery, Verbose: true });
        vitest.expect(result).toBeInstanceOf(Object);
    });
    vitest.it("should handle video extract with UseTor", async () => {
        const result = await extract({ Query: validQuery, UseTor: false });
        vitest.expect(result).toBeInstanceOf(Object);
    });
    vitest.it("should handle video extract with Verbose and UseTor", async () => {
        const result = await extract({ Query: validQuery, Verbose: true, UseTor: false });
        vitest.expect(result).toBeInstanceOf(Object);
    });
});
