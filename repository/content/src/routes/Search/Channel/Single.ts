import colors from "colors";
import { z, ZodError } from "zod";
import { Client, Channel } from "youtubei";
const ZodSchema = z.object({ channelLink: z.string().min(2) });
export default async function channel_data({ channelLink }: z.infer<typeof ZodSchema>): Promise<{ data: Channel }> {
    try {
        ZodSchema.parse({ channelLink });
        const youtube = new Client();
        const channelData: Channel | undefined = await youtube.getChannel(channelLink);
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
import * as vitest from "vitest";
vitest.describe("channel_data", () => {
    const validChannelId = "UC-9-kyTW8ZkZNSB7LxqIENA";
    const validChannelLink = `https://www.youtube.com/channel/${validChannelId}`;
    const invalidChannelLinkTooShort = "ab";
    const nonexistentChannelLink = "https://www.youtube.com/channel/nonexistentchannel123";
    vitest.it("should handle channel data fetch with a valid channel ID", async () => {
        try {
            const result = await channel_data({ channelLink: validChannelId });
            vitest.expect(result).toHaveProperty("data");
            vitest.expect(result.data).toBeInstanceOf(Channel);
            vitest.expect(result.data.id).toBe(validChannelId);
            vitest.expect(typeof result.data.name).toBe("string");
        } catch (error) {
            console.warn(`Channel data fetch failed for ID "${validChannelId}". This test requires a real, existing channel ID.`, error);
            throw error;
        }
    });
    vitest.it("should handle channel data fetch with a valid channel link", async () => {
        try {
            const result = await channel_data({ channelLink: validChannelLink });
            vitest.expect(result).toHaveProperty("data");
            vitest.expect(result.data).toBeInstanceOf(Channel);
            vitest.expect(result.data.id).toBe(validChannelId);
            vitest.expect(typeof result.data.name).toBe("string");
        } catch (error) {
            console.warn(`Channel data fetch failed for link "${validChannelLink}". This test requires a real, existing channel link.`, error);
            throw error;
        }
    });
    vitest.it("should throw Zod error for missing channelLink", async () => {
        await vitest.expect(channel_data({} as any)).rejects.toThrowError(/channelLink.*Required/);
    });
    vitest.it("should throw Zod error for short channelLink", async () => {
        await vitest.expect(channel_data({ channelLink: invalidChannelLinkTooShort })).rejects.toThrowError(/channelLink.*should be at least 2 characters/);
    });
    vitest.it("should throw error for a non-existent channel", async () => {
        try {
            await channel_data({ channelLink: nonexistentChannelLink });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/Unable to fetch channel data for the provided link./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for a non-existent channel.");
    });
});
