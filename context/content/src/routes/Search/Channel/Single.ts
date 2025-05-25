import colors from "colors";
import { z, ZodError } from "zod";
import { Client, Channel } from "youtubei";
const ZodSchema = z.object({ ChannelLink: z.string().min(2), Verbose: z.boolean().optional() });
export default async function channel_data({ ChannelLink, Verbose }: z.infer<typeof ZodSchema>): Promise<{ data: Channel }> {
    try {
        ZodSchema.parse({ ChannelLink, Verbose });
        const youtube = new Client();
        const channelData: Channel | undefined = await youtube.getChannel(ChannelLink);
        if (!channelData) throw new Error(colors.red("@error: ") + ` Unable to fetch channel data for the provided link.`);
        return { data: channelData };
    } catch (error) {
        if (error instanceof ZodError) throw new Error(colors.red("@error:") + ` Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw error;
        else throw new Error(colors.red("@error:") + ` An unexpected error occurred: ${String(error)}`);
    } finally {
        if (Verbose) console.log(colors.green("@info:"), `❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.`);
    }
}
