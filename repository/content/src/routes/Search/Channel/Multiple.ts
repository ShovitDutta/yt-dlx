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
 * @shortdesc Searches for YouTube channels based on a provided query.
 *
 * @description This function performs a search on YouTube specifically for channels
 * matching the input query string. It utilizes the `youtubei.js` library
 * to execute the search and processes the results to return a structured list of channels.
 *
 * The function requires a query string as input.
 *
 * The process involves:
 * 1. Validating the input query to ensure it meets the minimum length requirement (2 characters).
 * 2. Performing a channel-specific search on YouTube using the query.
 * 3. Mapping the search results into a structured array of `channelSearchType` objects.
 * 4. Checking if any channels were found and throwing an error if the results are empty.
 *
 * The function supports the following configuration option:
 * - **Query:** A string representing the channel search query. Must be at least 2 characters long. **Required**.
 *
 * The function returns a Promise that resolves with an object containing the search results in a `data` property.
 * The `data` property is an array of `channelSearchType` objects.
 * Each `channelSearchType` object includes the channel's `id`, `name`, `subscriberCount`, `description`, and `thumbnails`.
 *
 * @param {object} options - The configuration options for the channel search.
 * @param {string} options.query - The YouTube channel search query (minimum 2 characters). **Required**.
 *
 * @returns {Promise<{ data: channelSearchType[] }>} A Promise that resolves with an object containing a `data` property, which is an array of `channelSearchType` objects found during the search.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing `query`, `query` is less than 2 characters).
 * - Throws an `Error` if no channels are found for the provided `query`.
 * - Throws an `Error` for any underlying issues during the channel search using the internal `youtubei.js` client.
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Running Basic Channel Search with a query
 * try {
 * const result = await search_channels({ query: "programming tutorials" });
 * console.log("Found channels:");
 * result.data.forEach(channel => console.log(`- ${channel.name} (${channel.id})`));
 * } catch (error) {
 * console.error("Basic Channel Search Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Zod Validation Error Example (Missing Query - will throw ZodError)
 * try {
 * await search_channels({} as any); // Using 'as any' to simulate missing required parameter
 * console.log("This should not be reached - Missing Query Error.");
 * } catch (error) {
 * console.error("Expected Error (Missing Query):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Zod Validation Error Example (Short Query - will throw ZodError)
 * try {
 * await search_channels({ query: "a" }); // Query is less than minimum length (2)
 * console.log("This should not be reached - Short Query Error.");
 * } catch (error) {
 * console.error("Expected Error (Query Too Short):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running No Results Query Example (will throw Error)
 * // Use a query very unlikely to match any channel.
 * try {
 * await search_channels({ query: "asdfghjklzxcvbnm1234567890qwer" });
 * console.log("This should not be reached - No Results Query.");
 * } catch (error) {
 * console.error("Expected Error (No Channels Found):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Example of an Error during the internal youtubei.js search
 * // This might occur due to network issues or API changes.
 * // try {
 * //    // Use a query or set up conditions that might cause the internal search to fail
 * //    await search_channels({ query: "query causing internal search error" });
 * // } catch (error) {
 * //    console.error("Expected Internal Search Error:", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 6. Example of an Unexpected Error
 * // This is a catch-all for any errors not specifically handled.
 * // try {
 * //    // Simulate an unexpected error condition
 * //    await search_channels({ query: "valid query leading to unexpected error" });
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
(async () => {
    try {
        console.log("--- Running Basic Channel Search ---");
        const result = await search_channels({ query: "programming tutorials" });
        console.log("Found channels:");
        result.data.forEach(channel => console.log(`- ${channel.name} (${channel.id})`));
    } catch (error) {
        console.error("Basic Channel Search Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Missing Query Error ---");
        await search_channels({} as any);
        console.log("This should not be reached - Missing Query Error.");
    } catch (error) {
        console.error("Expected Error (Missing Query):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Short Query Error ---");
        await search_channels({ query: "a" });
        console.log("This should not be reached - Short Query Error.");
    } catch (error) {
        console.error("Expected Error (Query Too Short):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running No Results Query ---");
        await search_channels({ query: "asdfghjklzxcvbnm1234567890qwer" });
        console.log("This should not be reached - No Results Query.");
    } catch (error) {
        console.error("Expected Error (No Channels Found):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
