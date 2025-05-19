import list_formats from "../../../../routes/Misc/Video/Formats";
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
});
