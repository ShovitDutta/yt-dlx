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
/**
 * @shortdesc Searches for YouTube channels based on a search query.
 *
 * @description This function performs a search on YouTube specifically for channels that match the provided query.
 * It utilizes the `youtubei.js` library to execute the search and extract relevant channel information.
 * The search results are returned as an array of structured objects.
 *
 * The function requires a query string as input, which must be at least 2 characters long.
 *
 * The function supports the following configuration option:
 * - **Query:** A string representing the search term for finding channels. Must be at least 2 characters long. **Required**.
 *
 * The function returns a Promise that resolves with an object containing a `data` property.
 * The `data` property is an array of `channelSearchType` objects. Each object contains:
 * - `id`: The channel's unique YouTube ID.
 * - `name`: The channel's name.
 * - `subscriberCount`: The number of subscribers the channel has.
 * - `description`: The channel's description.
 * - `thumbnails`: An array of thumbnail URLs for the channel.
 *
 * @param {object} options - The configuration options for the channel search.
 * @param {string} options.query - The search query for channels (minimum 2 characters). **Required**.
 *
 * @returns {Promise<{ data: channelSearchType[] }>} A Promise that resolves with an object containing the search results in the `data` property. The `data` property is an array of `channelSearchType` objects.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing required `query`, `query` is less than 2 characters).
 * - Throws an `Error` if no channels are found for the provided `query`.
 * - Throws an `Error` for any underlying issues during the search process using the internal `youtubei.js` client.
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Running Basic Channel Search Example
 * try {
 * const result = await search_channels({ query: "programming tutorials" });
 * console.log("Search Results:", result.data);
 * // Example of accessing data:
 * // if (result.data.length > 0) {
 * //   console.log("First Channel Name:", result.data[0].name);
 * //   console.log("First Channel Subscribers:", result.data[0].subscriberCount);
 * // }
 * } catch (error) {
 * console.error("Basic Channel Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Zod Validation Error Example (Missing Query - will throw ZodError)
 * try {
 * await search_channels({} as any); // Using 'as any' to simulate missing required parameter
 * } catch (error) {
 * console.error("Expected Zod Error (Missing Query):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Zod Validation Error Example (Short Query - will throw ZodError)
 * try {
 * await search_channels({ query: "a" }); // Query is less than minimum length (2)
 * } catch (error) {
 * console.error("Expected Zod Error (Query Too Short):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running No Channels Found Example (will throw Error)
 * // Use a query very unlikely to match any channel.
 * try {
 * await search_channels({ query: "asdfghjklzxcvbnm1234567890qwer" });
 * } catch (error) {
 * console.error("Expected Error (No Channels Found):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Example of an Unexpected Error during search (e.g., network issue, API change in youtubei.js)
 * // This is harder to trigger predictably with a simple example.
 * // try {
 * //    // Use a query or environment that might cause an internal youtubei.js error
 * //    await search_channels({ query: "query causing internal search error" });
 * // } catch (error) {
 * //    console.error("Expected Unexpected Error:", error instanceof Error ? error.message : error);
 * // }
 */
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
