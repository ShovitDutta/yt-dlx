import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
const ZodSchema = z.object({ channelLink: z.string().min(2) });
/**
 * @shortdesc Fetches data for a YouTube channel using its link or ID.
 *
 * @description This function retrieves detailed information about a YouTube channel.
 * It accepts either a full channel URL or a channel ID as input.
 * The data fetching is performed using the `youtubei.js` library.
 *
 * The function requires a string representing the channel link (URL) or ID.
 *
 * The function supports the following configuration options:
 * - **channelLink:** A string representing the YouTube channel's URL or ID. Must be at least 2 characters long. **Required**.
 *
 * The function returns a Promise that resolves with an object containing the fetched channel data if successful.
 * The fetched data includes various details about the channel provided by the `youtubei.js` client.
 *
 * @param {object} options - The configuration options for fetching channel data.
 * @param {string} options.channelLink - The YouTube channel URL or ID (minimum 2 characters). **Required**.
 *
 * @returns {Promise<{ data: any }>} A Promise that resolves with an object containing a `data` property. The `data` property holds the raw channel data object fetched by the underlying library. The structure of this object depends on the data provided by the YouTube API.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing `channelLink`, `channelLink` is less than 2 characters).
 * - Throws an `Error` if the underlying library (`youtubei.js`) is unable to fetch channel data for the provided link/ID, typically indicating the channel was not found or an API issue.
 * - Throws a generic `Error` for any other unexpected issues during the process.
 *
 * @example
 * // 1. Running Channel Data Fetch with a full Channel Link Example
 * const channelLinkFull = "https://www.youtube.com/channel/UC-9-kyTW8ZkZNSB7LxqIENA"; // Replace with a real channel link
 * try {
 * const result = await channel_data({ channelLink: channelLinkFull });
 * console.log("Channel Data (Link):", result.data);
 * } catch (error) {
 * console.error("Channel Data Fetch with Link Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Channel Data Fetch with a Channel ID Example
 * const channelId = "UC-9-kyTW8ZkZNSB7LxqIENA"; // Example Channel ID (MrBeast)
 * try {
 * const result = await channel_data({ channelLink: channelId });
 * console.log("Channel Data (ID):", result.data);
 * } catch (error) {
 * console.error("Channel Data Fetch with ID Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Zod Validation Error Example (Missing channelLink - will throw ZodError)
 * try {
 * await channel_data({} as any); // Using 'as any' to simulate missing required parameter
 * console.log("This should not be reached - Missing channelLink Error.");
 * } catch (error) {
 * console.error("Expected Error (Missing channelLink):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Zod Validation Error Example (Invalid channelLink Length - will throw ZodError)
 * try {
 * await channel_data({ channelLink: "ab" }); // channelLink is less than minimum length (2)
 * console.log("This should not be reached - Invalid channelLink Length Error.");
 * } catch (error) {
 * console.error("Expected Error (Invalid channelLink Length):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Running Non-Existent Channel Error Example (will throw Error)
 * // Use a link or ID that does not correspond to a valid YouTube channel.
 * try {
 * await channel_data({ channelLink: "https://www.youtube.com/channel/NON_EXISTENT_CHANNEL_ID" }); // Example of a non-existent link pattern
 * console.log("This should not be reached - Non-Existent Channel Error.");
 * } catch (error) {
 * console.error("Expected Error (Channel Not Found):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Example of an Unexpected Error during fetch (e.g., network issue, API change)
 * // This is harder to trigger predictably with a simple example.
 * // try {
 * //    // Use a channel link/ID that might somehow cause an unexpected issue with the internal client
 * //    await channel_data({ channelLink: "link-or-id-causing-internal-error" });
 * // } catch (error) {
 * //    console.error("Expected Unexpected Error:", error instanceof Error ? error.message : error);
 * // }
 */
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
