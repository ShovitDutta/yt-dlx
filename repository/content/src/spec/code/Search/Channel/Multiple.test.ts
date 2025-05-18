import search_channels from "../../../../routes/Search/Channel/Multiple";
import * as vitest from "vitest";
vitest.describe("search_channels", () => {
    const validQuery = "programming tutorials";
    const queryWithNoResults = "asdfghjklzxcvbnm1234567890qwer";
    vitest.it("should handle basic channel search", async () => {
        try {
            const result = await search_channels({ query: validQuery });
            vitest.expect(result).toHaveProperty("data");
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
        } catch (error) {
            console.warn(`Basic channel search failed for query "${validQuery}". This test requires a query that returns channel results.`, error);
            throw error;
        }
    });
    vitest.it("should throw Zod error for missing query", async () => {
        await vitest.expect(search_channels({} as any)).rejects.toThrowError(/query.*Required/);
    });
    vitest.it("should throw Zod error for short query", async () => {
        await vitest.expect(search_channels({ query: "a" })).rejects.toThrowError(/query.*should be at least 2 characters/);
    });
    vitest.it("should throw error if no channels found for the query", async () => {
        try {
            await search_channels({ query: queryWithNoResults });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/No channels found for the provided query./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no channels found.");
    });
});
