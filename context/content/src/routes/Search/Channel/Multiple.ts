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
        throw new Error(colors.red("@error: ") + ` ${error.message}`);
    }
}
export default async function search_channels({ Query, Verbose }: z.infer<typeof ZodSchema>): Promise<{ data: channelSearchType[] }> {
    try {
        ZodSchema.parse({ Query, Verbose });
        const channels = await searchChannels({ Query });
        if (!channels || channels.length === 0) throw new Error(colors.red("@error: ") + ` No channels found for the provided Query.`);
        return { data: channels };
    } catch (error) {
        if (error instanceof ZodError) throw new Error(colors.red("@error:") + ` Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw error;
        else throw new Error(colors.red("@error:") + ` An unexpected error occurred: ${String(error)}`);
    } finally {
        if (Verbose) console.log(colors.green("@info:"), `❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.`);
    }
}
