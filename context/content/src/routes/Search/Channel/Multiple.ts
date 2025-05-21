import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
const ZodSchema = z.object({ query: z.string().min(2), verbose: z.boolean().optional() });
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
            thumbnails: item.thumbnails?.[0] || null,
        }));
        return result;
    } catch (error: any) {
        throw new Error(`${colors.red("@error: ")} ${error.message}`);
    }
}
export default async function search_channels({ query, verbose }: z.infer<typeof ZodSchema>): Promise<{ data: channelSearchType[] }> {
    try {
        ZodSchema.parse({ query, verbose });
        const channels = await searchChannels({ query });
        if (!channels || channels.length === 0) throw new Error(`${colors.red("@error: ")} No channels found for the provided query.`);
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
        if (verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
