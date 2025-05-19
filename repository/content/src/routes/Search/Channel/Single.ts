// Suggestion: Add JSDoc comments to the function, explaining its purpose, parameters, and return value.
import colors from "colors";
import { z, ZodError } from "zod";
import { Client, Channel } from "youtubei";
const ZodSchema = z.object({ channelLink: z.string().min(2) });
export default async function channel_data({ channelLink }: z.infer<typeof ZodSchema>): Promise<{ data: Channel }> {
    try {
        ZodSchema.parse({ channelLink });
        const youtube = new Client();
        const channelData: Channel | undefined = await youtube.getChannel(channelLink);
        if (!channelData) throw new Error(`${colors.red("@error: ")} Unable to fetch channel data for the provided link.`);
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
        return { data: channelData };
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
    }
}
