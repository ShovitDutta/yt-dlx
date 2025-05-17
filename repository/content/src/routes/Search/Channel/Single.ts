import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
const ZodSchema = z.object({ channelLink: z.string().min(2) });
export default async function channel_data({ channelLink }: z.infer<typeof ZodSchema>): Promise<{ data: any }> {
    try {
        ZodSchema.parse({ channelLink });
        const youtube = new Client();
        const channelData: any = await youtube.getChannel(channelLink);
        if (!channelData) {
            throw new Error(`${colors.red("@error: ")} Unable to fetch channel data for the provided link.`);
        }
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
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
(async () => {
    const channelLink = "https://www.youtube.com/channel/UC-9-kyTW8ZkZNSB7LxqIENA";
    try {
        console.log("--- Running Channel Data Fetch with Link ---");
        const result = await channel_data({ channelLink });
        console.log("Channel Data:", result.data);
    } catch (error) {
        console.error("Channel Data Fetch with Link Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Channel Data Fetch with ID ---");
        const result = await channel_data({ channelLink: "UC-9-kyTW8ZkZNSB7LxqIENA" });
        console.log("Channel Data:", result.data);
    } catch (error) {
        console.error("Channel Data Fetch with ID Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Missing channelLink Error ---");
        await channel_data({} as any);
        console.log("This should not be reached - Missing channelLink Error.");
    } catch (error) {
        console.error("Expected Error (Missing channelLink):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Invalid channelLink Length Error ---");
        await channel_data({ channelLink: "ab" });
        console.log("This should not be reached - Invalid channelLink Length Error.");
    } catch (error) {
        console.error("Expected Error (Invalid channelLink Length):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Non-Existent Channel Error ---");
        await channel_data({ channelLink: "https://www.youtube.com/channel/NON_EXISTENT_CHANNEL_ID" });
        console.log("This should not be reached - Non-Existent Channel Error.");
    } catch (error) {
        console.error("Expected Error (Channel Not Found):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
