import * as vitest from "vitest";
vitest.describe("list_formats", () => {
    const validQuery = "test video";
    vitest.it("should handle basic format list fetch", async () => {
        const result = await list_formats({ query: validQuery });
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toHaveProperty("ManifestLow");
        vitest.expect(Array.isArray(result.data.ManifestLow)).toBe(true);
        vitest.expect(result.data).toHaveProperty("ManifestHigh");
        vitest.expect(Array.isArray(result.data.ManifestHigh)).toBe(true);
        vitest.expect(result.data).toHaveProperty("AudioLow");
        vitest.expect(Array.isArray(result.data.AudioLow)).toBe(true);
        vitest.expect(result.data).toHaveProperty("VideoLow");
        vitest.expect(Array.isArray(result.data.VideoLow)).toBe(true);
        vitest.expect(result.data).toHaveProperty("VideoHigh");
        vitest.expect(Array.isArray(result.data.VideoHigh)).toBe(true);
        vitest.expect(result.data).toHaveProperty("AudioHigh");
        vitest.expect(Array.isArray(result.data.AudioHigh)).toBe(true);
        vitest.expect(result.data).toHaveProperty("VideoLowHDR");
        vitest.expect(Array.isArray(result.data.VideoLowHDR)).toBe(true);
        vitest.expect(result.data).toHaveProperty("AudioLowDRC");
        vitest.expect(Array.isArray(result.data.AudioLowDRC)).toBe(true);
        vitest.expect(result.data).toHaveProperty("AudioHighDRC");
        vitest.expect(Array.isArray(result.data.AudioHighDRC)).toBe(true);
        vitest.expect(result.data).toHaveProperty("VideoHighHDR");
        vitest.expect(Array.isArray(result.data.VideoHighHDR)).toBe(true);
    });
    vitest.it("should handle format list fetch with verbose logging", async () => {
        const result = await list_formats({ query: validQuery, verbose: true });
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should throw Zod error for missing query", async () => {
        await vitest.expect(list_formats({} as any)).rejects.toThrowError(/query.*Required/);
    });
    vitest.it("should throw Zod error for short query", async () => {
        await vitest.expect(list_formats({ query: "a" })).rejects.toThrowError(/query.*should be at least 2 characters/);
    });
    vitest.it("should throw error if unable to get response from YouTube", async () => {
        const queryThatShouldFail = "a query that should return no results 12345abcde";
        try {
            await list_formats({ query: queryThatShouldFail });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/Unable to get response from YouTube./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no engine data.");
    });
});
