import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
const ZodSchema = z.object({ query: z.string().min(2) });
export interface channelSearchType {
    id: string;
    name: string;
    subscriberCount: number;
    description: string;
    thumbnails: string[];
}
async function searchChannels({ query }: { query: string }): Promise<channelSearchType[]> {
    try {
        const youtube = new Client();
        const searchResults = await youtube.search(query, { type: "channel" });
        const result: channelSearchType[] = searchResults.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            subscriberCount: item.subscriberCount,
            description: item.description,
            thumbnails: item.thumbnails,
        }));
        return result;
    } catch (error: any) {
        throw new Error(`${colors.red("@error: ")} ${error.message}`);
    }
}
export default async function search_channels({ query }: z.infer<typeof ZodSchema>): Promise<{ data: channelSearchType[] }> {
    try {
        ZodSchema.parse({ query });
        const channels = await searchChannels({ query });
        if (!channels || channels.length === 0) {
            throw new Error(`${colors.red("@error: ")} No channels found for the provided query.`);
        }
        return { data: channels };
    } catch (error: any) {
        if (error instanceof ZodError) {
            const errorMessage = `${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        } else if (error instanceof Error) {
            console.error(error.message);
            throw error;
        } else {
            const unexpectedError = `${colors.red("@error:")} An unexpected error occurred: ${String(error)}`;
            console.error(unexpectedError);
            throw new Error(unexpectedError);
        }
    } finally {
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
import { describe, it, expect } from "vitest";
describe("search_channels", () => {
    const validQuery = "programming tutorials";
    const queryWithNoResults = "asdfghjklzxcvbnm1234567890qwer";
    it("should handle basic channel search", async () => {
        try {
            const result = await search_channels({ query: validQuery });
            expect(result).toHaveProperty("data");
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data.length).toBeGreaterThan(0);
            if (result.data.length > 0) {
                expect(result.data[0]).toHaveProperty("id");
                expect(typeof result.data[0].id).toBe("string");
                expect(result.data[0]).toHaveProperty("name");
                expect(typeof result.data[0].name).toBe("string");
                expect(result.data[0]).toHaveProperty("subscriberCount");
                expect(typeof result.data[0].subscriberCount).toBe("number");
                expect(result.data[0]).toHaveProperty("description");
                expect(typeof result.data[0].description).toBe("string");
                expect(result.data[0]).toHaveProperty("thumbnails");
                expect(Array.isArray(result.data[0].thumbnails)).toBe(true);
            }
        } catch (error) {
            console.warn(`Basic channel search failed for query "${validQuery}". This test requires a query that returns channel results.`, error);
            throw error;
        }
    });
    it("should throw Zod error for missing query", async () => {
        await expect(search_channels({} as any)).rejects.toThrowError(/query.*Required/);
    });
    it("should throw Zod error for short query", async () => {
        await expect(search_channels({ query: "a" })).rejects.toThrowError(/query.*should be at least 2 characters/);
    });
    it("should throw error if no channels found for the query", async () => {
        try {
            await search_channels({ query: queryWithNoResults });
        } catch (error: any) {
            if (error instanceof Error) {
                expect(error.message).toMatch(/No channels found for the provided query./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no channels found.");
    });
});
