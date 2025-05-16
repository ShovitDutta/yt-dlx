import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import { EventEmitter } from "events";
const ZodSchema = z.object({ channelLink: z.string().min(2) });
/**
 * @shortdesc Fetches data for a single YouTube channel.
 *
 * @description This function retrieves detailed information about a specific YouTube channel using its link or ID. It utilizes the 'youtubei' library to interact with the YouTube API.
 *
 * The function requires the link or ID of the YouTube channel you want to fetch data for.
 *
 * It supports the following configuration options:
 * - **channelLink:** A string representing the link or ID of the YouTube channel. This is a mandatory parameter.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - `"data"`: Emitted when the channel data is successfully fetched. The emitted data is an object containing detailed information about the channel.
 * - `"error"`: Emitted when an error occurs during any stage of the process, such as argument validation or failure to fetch channel data. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.channelLink - The link or ID of the YouTube channel. **Required**.
 *
 * @returns {EventEmitter} An EventEmitter instance for handling events during channel data fetching.
 *
 * @example
 * // 1. Fetch data for a channel using its link
 * YouTubeDLX.Search.Channel.Single({ channelLink: "https://www.youtube.com/channel/UC-9-kyTW8ZkZNSB7LxqIENA" })
 * .on("data", (data) => console.log("Channel Data:", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 2. Fetch data for a channel using its ID
 * YouTubeDLX.Search.Channel.Single({ channelLink: "UC-9-kyTW8ZkZNSB7LxqIENA" })
 * .on("data", (data) => console.log("Channel Data:", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 3. Missing required 'channelLink' parameter (will result in an error)
 * YouTubeDLX.Search.Channel.Single({} as any)
 * .on("error", (error) => console.error("Expected Error (missing channelLink):", error));
 *
 * @example
 * // 4. Invalid 'channelLink' parameter (e.g., too short - will result in an error - Zod validation)
 * YouTubeDLX.Search.Channel.Single({ channelLink: "ab" })
 * .on("error", (error) => console.error("Expected Error (invalid channelLink length):", error));
 *
 * @example
 * // 5. Channel not found or unable to fetch data for the provided link
 * // Note: This scenario depends on the 'youtubei' library's getChannel method behavior for invalid/non-existent links.
 * // The error emitted would be: "@error: Unable to fetch channel data for the provided link."
 * YouTubeDLX.Search.Channel.Single({ channelLink: "https://www.youtube.com/channel/NON_EXISTENT_CHANNEL_ID" })
 * .on("error", (error) => console.error("Expected Error (channel not found):", error));
 *
 */
export default function channel_data({ channelLink }: z.infer<typeof ZodSchema>): EventEmitter {
    const emitter = new EventEmitter();
    (async () => {
        try {
            ZodSchema.parse({ channelLink });
            const youtube = new Client();
            const channelData: any = await youtube.getChannel(channelLink);
            if (!channelData) {
                emitter.emit("error", `${colors.red("@error: ")} Unable to fetch channel data for the provided link.`);
                return;
            }
            emitter.emit("data", channelData);
        } catch (error) {
            if (error instanceof ZodError) emitter.emit("error", `${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
            else if (error instanceof Error) emitter.emit("error", `${colors.red("@error:")} ${error.message}`);
            else emitter.emit("error", `${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
        } finally {
            console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
        }
    })();
    return emitter;
}
