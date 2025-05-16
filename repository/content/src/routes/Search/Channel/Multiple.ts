import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import { EventEmitter } from "events";
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
        console.error(colors.red("@error: ") + error.message);
        return [];
    }
}
/**
 * @shortdesc Searches for YouTube channels based on a query.
 *
 * @description This function searches YouTube for channels matching the provided query string. It returns an EventEmitter that will emit the search results or an error if the search fails or no channels are found.
 *
 * The function requires a search query.
 *
 * It supports the following configuration options:
 * - **query:** A string representing the search query for channels. This is a mandatory parameter and must be at least 2 characters long.
 *
 * The function returns an EventEmitter instance that emits events during the search process:
 * - `"data"`: Emitted when the channel search is successful and results are found. The emitted data is an array of objects, where each object represents a channel and includes its `id`, `name`, `subscriberCount`, `description`, and `thumbnails`.
 * - `"error"`: Emitted when an error occurs, such as a missing or invalid query, a search failure, or if no channels are found for the query. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.query - The search query for channels. **Required**. Minimum length is 2 characters.
 *
 * @returns {EventEmitter} An EventEmitter instance for handling events during the channel search.
 *
 * @example
 * // 1. Search for channels with a query
 * YouTubeDLX.Search.Channel.Multiple({ query: "programming tutorials" })
 * .on("data", (channels) => {
 * console.log("Found channels:");
 * channels.forEach(channel => console.log(`- ${channel.name} (${channel.id})`));
 * })
 * .on("error", (error) => console.error("Error searching channels:", error));
 *
 * @example
 * // 2. Missing required 'query' parameter (will result in an error)
 * YouTubeDLX.Search.Channel.Multiple({} as any)
 * .on("error", (error) => console.error("Expected Error (missing query):", error));
 *
 * @example
 * // 3. Query parameter is too short (will result in a Zod error)
 * YouTubeDLX.Search.Channel.Multiple({ query: "a" })
 * .on("error", (error) => console.error("Expected Error (query too short):", error));
 *
 * @example
 * // 4. Query returns no channels
 * // Note: This scenario depends on the search results from the youtubei library.
 * // You can simulate by providing a query unlikely to match any channels.
 * YouTubeDLX.Search.Channel.Multiple({ query: "asdfghjklzxcvbnm1234567890qwer" })
 * .on("error", (error) => console.error("Expected Error (no channels found):", error)); // Emits "@error: No channels found for the provided query."
 *
 * @example
 * // 5. Internal searchChannels function throws an error
 * // Note: This scenario depends on internal issues with the youtubei library or network.
 * // The error emitted would be: "@error: Engine error: ..." or "@error: An unexpected error occurred: ..."
 * // YouTubeDLX.Search.Channel.Multiple({ query: "valid query but search fails internally" })
 * // .on("error", (error) => console.error("Expected Error (internal search failure):", error));
 *
 */
export default function search_channels({ query }: z.infer<typeof ZodSchema>): EventEmitter {
    const emitter = new EventEmitter();
    (async () => {
        try {
            ZodSchema.parse({ query });
            const channels = await searchChannels({ query });
            if (!channels || channels.length === 0) {
                emitter.emit("error", `${colors.red("@error: ")} No channels found for the provided query.`);
                return;
            }
            emitter.emit("data", channels);
        } catch (error) {
            if (error instanceof ZodError) emitter.emit("error", `${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
            else if (error instanceof Error) emitter.emit("error", `${colors.red("@error:")} ${error.message}`);
            else emitter.emit("error", `${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
        } finally {
            console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
        }
    })();
    return emitter;
}
