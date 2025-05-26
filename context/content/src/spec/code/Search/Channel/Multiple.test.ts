import search_channels from "../../../../routes/Search/Channel/Multiple";
import * as vitest from "vitest";
vitest.describe("search_channels", () => {
    const validQuery = "programming tutorials";
    const queryWithNoResults = "asdfghjklzxcvbnm1234567890qwer";
    vitest.it("should handle basic channel search", async () => {
        try {
            const result = await search_channels({ Query: validQuery });
            if (result) {
                vitest.expect(Array.isArray(result)).toBe(true);
                vitest.expect(result.length).toBeGreaterThan(0);
                if (result.length > 0) {
                    vitest.expect(result[0]).toHaveProperty("id");
                    vitest.expect(typeof result[0].id).toBe("string");
                    vitest.expect(result[0]).toHaveProperty("name");
                    vitest.expect(typeof result[0].name).toBe("string");
                    vitest.expect(result[0]).toHaveProperty("subscriberCount");
                    vitest.expect(typeof result[0].subscriberCount).toBe("number");
                    vitest.expect(result[0]).toHaveProperty("description");
                    vitest.expect(typeof result[0].description).toBe("string");
                    vitest.expect(result[0]).toHaveProperty("thumbnails");
                    vitest.expect(Array.isArray(result[0].thumbnails)).toBe(true);
                }
            }
        } catch (error) {
            console.warn("Basic channel search failed for Query \"" + validQuery + "\". This test requires a Query that returns channel results. " + error);
            throw error;
        }
    });
});
