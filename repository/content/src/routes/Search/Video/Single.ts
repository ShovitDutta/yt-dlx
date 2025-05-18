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
 * @shortdesc Fetches detailed metadata for a YouTube video using its link or ID.
 *
 * @description This function takes a YouTube video link or ID, extracts the video ID,
 * and then retrieves comprehensive metadata for that video using an internal YouTube client.
 *
 * The function performs validation on the input `videoLink` to ensure it meets the minimum length requirement
 * and attempts to extract a valid YouTube video ID from it.
 *
 * It requires a valid YouTube video link or ID as input.
 *
 * The function supports the following configuration option:
 * - **VideoLink:** A string representing the YouTube video link or ID. Must be at least 2 characters long. **Required**.
 *
 * The function returns a Promise that resolves with a `SingleVideoType` object containing detailed video information if successful.
 *
 * @param {object} options - The configuration options for fetching video data.
 * @param {string} options.videoLink - The YouTube video link or ID (minimum 2 characters). **Required**.
 *
 * @returns {Promise<SingleVideoType>} A Promise that resolves with a `SingleVideoType` object containing metadata such as ID, title, thumbnails, upload date, description, duration, view count, channel info, tags, and like count.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing `videoLink`, `videoLink` is less than 2 characters).
 * - Throws an `Error` if the provided `videoLink` is in an incorrect format and a valid YouTube video ID cannot be extracted by the internal utility (`YouTubeID`).
 * - Throws an `Error` if the internal YouTube client (`youtubei.js`) is unable to fetch data for the extracted video ID (e.g., video does not exist, is private, or due to API issues).
 * - Throws a generic `Error` for any other unexpected issues during the process.
 *
 * @example
 * // 1. Handling basic video data fetch with a standard link
 * const validVideoLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Use a real video link
 * try {
 * const result = await videoData({ videoLink: validVideoLink });
 * console.log("Video Title:", result.title);
 * console.log("Channel Name:", result.channelname);
 * console.log("View Count:", result.viewCount);
 * } catch (error) {
 * console.error("Basic Video Data Fetch Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Handling video data fetch with a shortened link or ID
 * const shortenedVideoLink = "https://youtu.be/dQw4w9WgXcQ"; // Or just "dQw4w9WgXcQ"
 * try {
 * const result = await videoData({ videoLink: shortenedVideoLink });
 * console.log("Video ID:", result.id);
 * console.log("Duration:", result.duration);
 * } catch (error) {
 * console.error("Shortened Link/ID Fetch Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Example of Zod validation error for missing videoLink
 * try {
 * await videoData({} as any); // Simulate missing required parameter
 * } catch (error) {
 * console.error("Expected Zod Error (Missing videoLink):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Example of Zod validation error for short videoLink
 * try {
 * await videoData({ videoLink: "a" }); // Link is less than minimum length (2)
 * } catch (error) {
 * console.error("Expected Zod Error (VideoLink too short):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Example of error for invalid videoLink format
 * try {
 * await videoData({ videoLink: "this is not a youtube link" });
 * } catch (error) {
 * console.error("Expected Error (Invalid videoLink format):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Example of error for a nonexistent or inaccessible video ID
 * // Use an ID known to be invalid or for a private/deleted video.
 * const nonexistentVideoId = "nonexistentvideoid123"; // Example of a likely nonexistent ID
 * try {
 * await videoData({ videoLink: nonexistentVideoId });
 * } catch (error) {
 * console.error("Expected Error (Nonexistent Video):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 7. Example of an Unexpected Error during fetch (e.g., API change, network issue)
 * // This is harder to trigger predictably with a simple example.
 * // try {
 * //    // Use a video link that might somehow cause an unexpected issue with the internal client
 * //    await videoData({ videoLink: "link-causing-internal-error" });
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
