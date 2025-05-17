import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import YouTubeID from "../../../utils/YouTubeId";
const ZodSchema = z.object({ videoLink: z.string().min(2) });
export interface SingleVideoType {
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
async function singleVideo({ videoId }: { videoId: string }): Promise<SingleVideoType> {
    try {
        const youtube = new Client();
        const singleVideoData: any = await youtube.getVideo(videoId);
        if (!singleVideoData) {
            throw new Error(`${colors.red("@error:")} Unable to fetch video data.`);
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
        throw new Error(error.message);
    }
}
type VideoDataOptions = z.infer<typeof ZodSchema>;
/**
 * @shortdesc Fetches detailed metadata for a single YouTube video using its link or ID.
 *
 * @description This function takes a YouTube video link or a raw video ID as input,
 * extracts the video ID, and then fetches comprehensive metadata for that video
 * using the `youtubei.js` library.
 *
 * The function requires a valid YouTube video link or ID as a string input.
 *
 * The process involves:
 * 1. Validating the input `videoLink` parameter.
 * 2. Using the `YouTubeID` utility to parse the link and extract the video ID.
 * 3. Fetching the video details using the extracted video ID via the internal `youtubei.js` client.
 * 4. Structuring the fetched data into the `SingleVideoType` format.
 *
 * The function returns a Promise that resolves with a `SingleVideoType` object containing the video's metadata.
 *
 * @param {object} options - The configuration options for fetching video data.
 * @param {string} options.videoLink - The YouTube video link or raw video ID (minimum 2 characters). Supports standard URLs, shortened URLs (like youtu.be), and raw IDs. **Required**.
 *
 * @returns {Promise<SingleVideoType>} A Promise that resolves with a `SingleVideoType` object containing detailed information about the video, such as ID, title, thumbnails, upload date, description, duration, view count, channel info, tags, and like count.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input `options` fail schema validation (e.g., `videoLink` is missing or less than 2 characters).
 * - Throws an `Error` if the provided `videoLink` is not recognized as a valid YouTube link or ID by the `YouTubeID` utility.
 * - Throws an `Error` if fetching video data for the extracted ID fails (e.g., video does not exist, is private, or due to network/API issues).
 * - Throws a generic `Error` for any other unexpected issues during the process.
 *
 * @example
 * // 1. Running Basic Video Data Fetch Example with a googleusercontent redirect URL
 * try {
 * const result = await videoData({ videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
 * console.log("Video Data:", result);
 * } catch (error) {
 * console.error("Basic Video Data Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Video Data Fetch with a standard YouTube URL
 * try {
 * const result = await videoData({ videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
 * console.log("Video Data:", result);
 * } catch (error) {
 * console.error("Standard URL Video Data Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Video Data Fetch with a Shortened YouTube URL
 * try {
 * const result = await videoData({ videoLink: "https://youtu.be/dQw4w9WgXcQ" });
 * console.log("Video Data:", result);
 * } catch (error) {
 * console.error("Shortened URL Video Data Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Video Data Fetch with a raw Video ID
 * try {
 * const result = await videoData({ videoLink: "dQw4w9WgXcQ" });
 * console.log("Video Data:", result);
 * } catch (error) {
 * console.error("Video ID Video Data Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Running Zod Validation Error Example (Missing videoLink - will throw ZodError)
 * try {
 * await videoData({} as any); // Using 'as any' to simulate missing required parameter
 * console.log("This should not be reached - Missing videoLink Example.");
 * } catch (error) {
 * console.error("Expected Error (Missing videoLink):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Running Zod Validation Error Example (Short videoLink - will throw ZodError)
 * try {
 * await videoData({ videoLink: "a" }); // Link is less than minimum length (2)
 * console.log("This should not be reached - Short videoLink Example.");
 * } catch (error) {
 * console.error("Expected Error (videoLink Too Short):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 7. Running Invalid videoLink Example (Link cannot be parsed - will throw Error)
 * try {
 * await videoData({ videoLink: "this is not a youtube link" });
 * console.log("This should not be reached - Invalid videoLink Example.");
 * } catch (error) {
 * console.error("Expected Error (Incorrect videoLink):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 8. Running Nonexistent or Unavailable Video Example (will throw Error)
 * // Use an ID format that is valid but likely doesn't exist or is inaccessible.
 * try {
 * await videoData({ videoLink: "aaaaaaaaaaa" }); // A random 11-character string
 * console.log("This should not be reached - Nonexistent Video Example.");
 * } catch (error) {
 * console.error("Expected Error (Unable to Fetch Video Data):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 9. Example of an Unexpected Error during fetch (e.g., network issue, API change)
 * // This is harder to trigger predictably with a simple example.
 * // try {
 * //    // Use a link that might somehow cause an unexpected issue with the internal client
 * //    await videoData({ videoLink: "https://www.youtube.com/watch?v=query-causing-internal-error" });
 * // } catch (error) {
 * //    console.error("Expected Unexpected Error:", error instanceof Error ? error.message : error);
 * // }
 */
export default async function videoData({ videoLink }: VideoDataOptions): Promise<SingleVideoType> {
    try {
        ZodSchema.parse({ videoLink });
        const vId = await YouTubeID(videoLink);
        if (!vId) {
            throw new Error(`${colors.red("@error:")} Incorrect video link provided.`);
        }
        const metaData = await singleVideo({ videoId: vId });
        return metaData;
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
    try {
        console.log("--- Running Basic Video Data Fetch Example ---");
        const result = await videoData({ videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
        console.log("Video Data:", result);
    } catch (error) {
        console.error("Basic Video Data Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Video Data Fetch with Shortened URL Example ---");
        const result = await videoData({ videoLink: "https://youtu.be/dQw4w9WgXcQ" });
        console.log("Video Data:", result);
    } catch (error) {
        console.error("Shortened URL Video Data Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Video Data Fetch with Video ID Example ---");
        const result = await videoData({ videoLink: "dQw4w9WgXcQ" });
        console.log("Video Data:", result);
    } catch (error) {
        console.error("Video ID Video Data Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Missing videoLink Example ---");
        await videoData({} as any);
        console.log("This should not be reached - Missing videoLink Example.");
    } catch (error) {
        console.error("Expected Error (Missing videoLink):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Invalid videoLink Example ---");
        await videoData({ videoLink: "this is not a youtube link" });
        console.log("This should not be reached - Invalid videoLink Example.");
    } catch (error) {
        console.error("Expected Error (Incorrect videoLink):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Nonexistent Video Example ---");
        await videoData({ videoLink: "https://www.youtube.com/watch?v=nonexistentvideo123" });
        console.log("This should not be reached - Nonexistent Video Example.");
    } catch (error) {
        console.error("Expected Error (Unable to Fetch Video Data):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
