import colors from "colors";
import { z, ZodError } from "zod";
import { Client, Channel } from "youtubei";
const ZodSchema = z.object({ ChannelLink: z.string().min(2), Verbose: z.boolean().optional() });
/**
 * @shortdesc Fetches and processes data for a single YouTube channel.
 *
 * @description This function retrieves detailed information for a specific YouTube channel using the provided channel link.
 * It initializes a YouTube client, fetches the channel data, and returns the data.
 * The `Verbose` option provides additional logging information.
 *
 * @param options - An object containing the options for fetching channel data.
 * @param options.ChannelLink - A string containing the link to the YouTube channel. This is a mandatory parameter.
 * @param options.Verbose - An optional boolean that, when set to `true`, enables verbose logging, displaying informational messages during execution. Defaults to `false`.
 *
 * @returns A Promise that resolves to a `Channel` object containing the channel data.
 *
 * @throws {Error}
 * - If `ChannelLink` is not provided or is invalid: `Error: @error: Argument validation failed: [path]: [message]`
 * - If unable to fetch channel data for the provided link: `Error: @error: Unable to fetch channel data for the provided link.`
 * - For any other unexpected errors: `Error: @error: An unexpected error occurred: [error_message]`
 */
export default async function Search_Channel_Single({ ChannelLink, Verbose }: z.infer<typeof ZodSchema>): Promise<Channel> {
    try {
        ZodSchema.parse({ ChannelLink, Verbose });
        const youtube = new Client();
        const channelData: Channel | undefined = await youtube.getChannel(ChannelLink);
        if (!channelData) throw new Error(colors.red("@error: ") + " Unable to fetch channel data for the provided link.");
        return channelData;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(colors.red("@error: ") + " Argument validation failed: " + error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", "));
        else if (error instanceof Error) throw error;
        else throw new Error(colors.red("@error: ") + " An unexpected error occurred: " + String(error));
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
