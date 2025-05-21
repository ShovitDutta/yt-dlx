import search_channels from "../../../../routes/Search/Channel/Multiple";
import * as vitest from "vitest";
vitest.describe("search_channels", () => {
    const validQuery = "programming tutorials";
    const queryWithNoResults = "asdfghjklzxcvbnm1234567890qwer";
    vitest.it("should handle basic channel search", async () => {
        try {
            const result = await search_channels({ query: validQuery });
            vitest.expect(result).toHaveProperty("data");
            if (result && result.data) {
                vitest.expect(Array.isArray(result.data)).toBe(true);
                vitest.expect(result.data.length).toBeGreaterThan(0);
                if (result.data.length > 0) {
                    vitest.expect(result.data[0]).toHaveProperty("id");
                    vitest.expect(typeof result.data[0].id).toBe("string");
                    vitest.expect(result.data[0]).toHaveProperty("name");
                    vitest.expect(typeof result.data[0].name).toBe("string");
                    vitest.expect(result.data[0]).toHaveProperty("subscriberCount");
                    vitest.expect(typeof result.data[0].subscriberCount).toBe("number");
                    vitest.expect(result.data[0]).toHaveProperty("description");
                    vitest.expect(typeof result.data[0].description).toBe("string");
                    vitest.expect(result.data[0]).toHaveProperty("thumbnails");
                    vitest.expect(Array.isArray(result.data[0].thumbnails)).toBe(true);
                }
            }
        } catch (error) {
            console.warn(`Basic channel search failed for query "${validQuery}". This test requires a query that returns channel results.`, error);
            throw error;
        }
    });
});
