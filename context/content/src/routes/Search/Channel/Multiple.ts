import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
const ZodSchema = z.object({ Query: z.string().min(2), Verbose: z.boolean().optional() });
export interface channelSearchType {
    id: string;
    name: string;
    subscriberCount: number;
    description: string;
    thumbnails: string[];
}
async function searchChannels({ Query }: { Query: string }): Promise<channelSearchType[]> {
    try {
        const youtube = new Client();
        const searchResults = await youtube.search(Query, { type: "channel" });
        const result: channelSearchType[] = searchResults.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            subscriberCount: item.subscriberCount,
            description: item.description,
            thumbnails: item.thumbnails?.[0] || null,
        }));
        return result;
    } catch (error: any) {
        throw new Error(colors.red("@error: ") + " " + error.message);
    }
}
/**
 * @shortdesc Searches for YouTube channels based on a query string.
 *
 * @description This function performs a search for YouTube channels using the provided query.
 * It leverages the `youtubei` library to interact with YouTube's search functionality, specifically filtering for channel results.
 * For each found channel, it extracts and returns key information such as the channel ID, name, subscriber count, description, and thumbnail.
 *
 * @param options - An object containing the search query and optional verbose mode.
 * @param options.Query - A string representing the search query for channels. This is a mandatory parameter and must be at least 2 characters long.
 * @param options.Verbose - An optional boolean. If `true`, enables verbose logging, displaying additional information during the execution process. Defaults to `false`.
 *
 * @returns {Promise<channelSearchType[]>} A promise that resolves to an array of `channelSearchType` objects.
 * Each object in the array represents a found channel and has the following properties:
 * - `id`: The unique identifier of the YouTube channel.
 * - `name`: The name of the channel.
 * - `subscriberCount`: The number of subscribers the channel has.
 * - `description`: A brief description of the channel.
 * - `thumbnails`: An array of thumbnail URLs for the channel. (Note: The current implementation only extracts the first thumbnail if available).
 *
 * @throws {Error}
 * - If the `Query` is invalid or no channels are found for the provided query: `Error: @error: No channels found for the provided Query.`
 * - If argument validation fails due to invalid `options` (e.g., incorrect type or missing required fields): `Error: @error: Argument validation failed: [path.to.field]: [message]`
 * - For any unexpected errors during the search process, including network issues or problems with the YouTube API: `Error: @error: An unexpected error occurred: [error_message]`
 */
export default async function search_channels({ Query, Verbose }: z.infer<typeof ZodSchema>): Promise<channelSearchType[]> {
    try {
        ZodSchema.parse({ Query, Verbose });
        const channels = await searchChannels({ Query });
        if (!channels || channels.length === 0) throw new Error(colors.red("@error: ") + " No channels found for the provided Query.");
        return channels;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(colors.red("@error: ") + " Argument validation failed: " + error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", "));
        else if (error instanceof Error) throw error;
        else throw new Error(colors.red("@error: ") + " An unexpected error occurred: " + String(error));
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
