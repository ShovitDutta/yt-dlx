import colors from "colors";
import { z, ZodError } from "zod";
import { Client, Channel } from "youtubei";
const ZodSchema = z.object({ channelLink: z.string().min(2) });
/**
 * @shortdesc Fetches data for a YouTube channel using its link (ID, handle, or URL).
 *
 * @description This function retrieves detailed information about a specific YouTube channel
 * by using its unique identifier or URL. It utilizes the `youtubei.js` library to
 * perform the channel data lookup.
 *
 * The function requires a string input that identifies the channel. This can be a
 * channel ID (e.g., `UC-9-kyTW8ZkZNSB7LxqIENA`), a channel handle (e.g., `@YouTube`),
 * or a full channel URL.
 *
 * The function supports the following configuration option:
 * - **Channel Link:** A string representing the channel ID, handle, or URL. Must be at least 2 characters long. **Required**.
 *
 * The function returns a Promise that resolves with an object containing the channel data.
 *
 * @param {object} options - The configuration options for fetching channel data.
 * @param {string} options.channelLink - The link (ID, handle, or URL) of the YouTube channel (minimum 2 characters). **Required**.
 *
 * @returns {Promise<{ data: Channel }>} A Promise that resolves with an object containing a `data` property. The `data` property holds a `Channel` object containing details about the YouTube channel, as provided by the `youtubei.js` library.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing `channelLink`, `channelLink` is less than 2 characters).
 * - Throws an `Error` if the `youtubei.js` client is unable to fetch data for the provided `channelLink`, indicating the channel may not exist or there was an issue with the lookup.
 * - Throws a generic `Error` for any other unexpected issues during the process, potentially including network errors or issues within the `youtubei.js` library.
 *
 * @example
 * // 1. Fetch channel data using a channel ID
 * const channelId = "UC-9-kyTW8ZkZNSB7LxqIENA"; // Example YouTube channel ID
 * try {
 * const result = await channel_data({ channelLink: channelId });
 * console.log("Channel Name:", result.data.name);
 * console.log("Subscribers:", result.data.subscribers?.text);
 * } catch (error) {
 * console.error("Failed to fetch channel data by ID:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Fetch channel data using a channel handle (e.g., @YouTube)
 * const channelHandle = "@YouTube";
 * try {
 * const result = await channel_data({ channelLink: channelHandle });
 * console.log("Channel Name:", result.data.name);
 * console.log("Channel Handle:", result.data.handle);
 * } catch (error) {
 * console.error("Failed to fetch channel data by handle:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Fetch channel data using a full channel URL
 * const channelUrl = "https://www.youtube.com/c/YouTubeCreators"; // Example URL
 * try {
 * const result = await channel_data({ channelLink: channelUrl });
 * console.log("Channel Name:", result.data.name);
 * console.log("Channel URL:", result.data.url);
 * } catch (error) {
 * console.error("Failed to fetch channel data by URL:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Example of Zod Validation Error (Missing channelLink - will throw ZodError)
 * try {
 * await channel_data({} as any); // Using 'as any' to simulate missing required parameter
 * } catch (error) {
 * console.error("Expected Zod Error (Missing channelLink):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Example of Zod Validation Error (Short channelLink - will throw ZodError)
 * try {
 * await channel_data({ channelLink: "a" }); // channelLink is less than minimum length (2)
 * } catch (error) {
 * console.error("Expected Zod Error (Short channelLink):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Example of Error for a Non-existent Channel
 * // Use a link/ID/handle that is known not to exist on YouTube.
 * try {
 * await channel_data({ channelLink: "UCAAAAAAAAAAAAAAAAAAAAAA" }); // Invalid or non-existent ID example
 * } catch (error) {
 * console.error("Expected Error (Non-existent Channel):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 7. Example of an Unexpected Error during fetch (e.g., network issue, API change)
 * // This is harder to trigger predictably with a simple example using valid inputs.
 * // try {
 * //    // Use a valid link but potentially introduce a network issue
 * //    await channel_data({ channelLink: "UC-9-kyTW8ZkZNSB7LxqIENA" });
 * // } catch (error) {
 * //    console.error("Expected Unexpected Error:", error instanceof Error ? error.message : error);
 * // }
 */
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
