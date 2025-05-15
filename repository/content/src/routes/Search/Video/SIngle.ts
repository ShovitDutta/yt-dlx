import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import { EventEmitter } from "events";
import YouTubeID from "../../../utils/YouTubeId";
const ZodSchema = z.object({ videoLink: z.string().min(2) });
export interface singleVideoType {
    id: string;
    title: string;
    thumbnails: string[];
    uploadDate: string;
    description: string;
    duration: number;
    isLive: boolean;
    viewCount: number;
    channelid: string;
    channelname: string;
    tags: string;
    likeCount: number;
}
export async function singleVideo({ videoId }: { videoId: string }, emitter: EventEmitter): Promise<singleVideoType | null> {
    try {
        const youtube = new Client();
        const singleVideoData: any = await youtube.getVideo(videoId);
        if (!singleVideoData) {
            emitter.emit("error", `${colors.red("@error: ")} Unable to fetch video data.`);
            return null;
        }
        return {
            id: singleVideoData.id,
            title: singleVideoData.title,
            thumbnails: singleVideoData.thumbnails,
            uploadDate: singleVideoData.uploadDate,
            description: singleVideoData.description,
            duration: singleVideoData.duration,
            isLive: singleVideoData.isLiveContent,
            viewCount: singleVideoData.viewCount,
            channelid: singleVideoData.channel?.id,
            channelname: singleVideoData.channel?.name,
            tags: singleVideoData.tags,
            likeCount: singleVideoData.likeCount,
        };
    } catch (error: any) {
        emitter.emit("error", `${colors.red("@error: ")} ${error.message}`);
        return null;
    }
}
/**
 * @shortdesc Fetches detailed data for a single YouTube video.
 *
 * @description This function retrieves comprehensive information about a specific YouTube video using its link. It extracts the video ID and then fetches details such as title, thumbnails, upload date, description, duration, view count, channel information, tags, and like count.
 *
 * The function requires a valid YouTube video link.
 *
 * It supports the following configuration options:
 * - **videoLink:** A string containing the YouTube video URL. This is a mandatory parameter. The function will attempt to extract the video ID from this link.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - `"data"`: Emitted when the video data is successfully fetched and processed. The emitted data is an object conforming to the `singleVideoType` interface, containing various details about the video.
 * - `"error"`: Emitted when an error occurs at any stage, such as argument validation, invalid video link format, failure to fetch data from the YouTube API, or unexpected internal errors. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.videoLink - The YouTube video URL. **Required**.
 *
 * @returns {EventEmitter} An EventEmitter instance for handling events during video data fetching.
 *
 * @example
 * // 1. Fetch data for a valid YouTube video link
 * YouTubeDLX.Search.Video.Single({ videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" })
 * .on("data", (data) => console.log("Video Data:", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 2. Fetch data using a shortened YouTube link
 * YouTubeDLX.Search.Video.Single({ videoLink: "https://youtu.be/dQw4w9WgXcQ" })
 * .on("data", (data) => console.log("Video Data:", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 3. Fetch data for a link that is just the video ID
 * // Note: This works if the internal YouTubeID helper can process just the ID string.
 * YouTubeDLX.Search.Video.Single({ videoLink: "dQw4w9WgXcQ" })
 * .on("data", (data) => console.log("Video Data (using ID):", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 4. Missing required 'videoLink' parameter (will result in a Zod error)
 * YouTubeDLX.Search.Video.Single({} as any)
 * .on("error", (error) => console.error("Expected Error (missing videoLink):", error));
 *
 * @example
 * // 5. Invalid 'videoLink' format (will result in an error from YouTubeID)
 * YouTubeDLX.Search.Video.Single({ videoLink: "this is not a youtube link" })
 * .on("error", (error) => console.error("Expected Error (incorrect video link):", error));
 *
 * @example
 * // 6. Link is valid format but video does not exist or is private/deleted
 * // Note: This will likely result in an error from the singleVideo helper when fetching data.
 * YouTubeDLX.Search.Video.Single({ videoLink: "https://www.youtube.com/watch?v=nonexistentvideo123" })
 * .on("error", (error) => console.error("Expected Error (unable to fetch video data):", error));
 *
 * @example
 * // 7. Internal error during video data fetching (e.g., API issue)
 * // Note: This is an internal error scenario, difficult to trigger via simple example call.
 * // The error emitted would be: "@error: Unable to fetch video data." or an error from the underlying youtubei library.
 * // YouTubeDLX.Search.Video.Single({ videoLink: "VALID_LINK_BUT_FETCH_FAILS" })
 * // .on("error", (error) => console.error("Expected Error (fetch failed):", error));
 *
 */
export default function video_data({ videoLink }: z.infer<typeof ZodSchema>): EventEmitter {
    const emitter = new EventEmitter();
    (async () => {
        try {
            ZodSchema.parse({ videoLink });
            const vId = await YouTubeID(videoLink);
            if (!vId) {
                emitter.emit("error", `${colors.red("@error: ")} Incorrect video link provided.`);
                return;
            }
            const metaData: singleVideoType | null = await singleVideo({ videoId: vId }, emitter);
            if (!metaData) {
                emitter.emit("error", `${colors.red("@error: ")} Unable to retrieve video information.`);
                return;
            }
            emitter.emit("data", metaData);
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
