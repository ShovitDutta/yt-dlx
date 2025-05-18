import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
const ZodSchema = z.object({ videoId: z.string().min(2) });
export interface RelatedVideosType {
    id: string;
    title: string;
    isLive: boolean;
    duration: number;
    uploadDate: string;
    thumbnails: string[];
}
async function relatedVideos({ videoId }: { videoId: string }): Promise<RelatedVideosType[]> {
    try {
        const youtube = new Client();
        const videoData: any = await youtube.getVideo(videoId);
        if (!videoData?.related?.items) {
            return [];
        }
        return videoData.related.items.map((item: any) => ({ id: item.id, title: item.title, isLive: item.isLive, duration: item.duration, uploadDate: item.uploadDate, thumbnails: item.thumbnails }));
    } catch (error: any) {
        throw new Error(error.message);
    }
}
type RelatedVideosOptions = z.infer<typeof ZodSchema>;
/**
 * @shortdesc Fetches related videos for a given YouTube video ID.
 *
 * @description This function retrieves a list of videos that YouTube considers related to the video specified by the `videoId`.
 * It uses the `youtubei.js` library internally to fetch the video data and extract the related items.
 * The function requires a valid YouTube video ID as input.
 *
 * The process involves:
 * 1. Fetching detailed information for the video using the provided `videoId`.
 * 2. Extracting the list of related videos from the fetched data.
 * 3. Mapping the related video data to the `RelatedVideosType` structure.
 *
 * The function supports the following configuration option:
 * - **VideoId:** A string representing the YouTube video ID. Must be at least 2 characters long. **Required**.
 *
 * The function returns a Promise that resolves with an array of `RelatedVideosType` objects if successful. If the API returns no related videos for the given ID, a specific error is thrown.
 *
 * @param {object} options - The configuration options for fetching related videos.
 * @param {string} options.videoId - The YouTube video ID for which to fetch related videos (minimum 2 characters). **Required**.
 *
 * @returns {Promise<RelatedVideosType[]>} A Promise that resolves with an array of `RelatedVideosType` objects. Each object contains basic information about a related video, such as `id`, `title`, `isLive`, `duration`, `uploadDate`, and `thumbnails`.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing `videoId`, `videoId` is less than 2 characters).
 * - Throws an `Error` if the internal `youtubei.js` client fails to fetch the video data for the given `videoId`.
 * - Throws an `Error` with the message "No related videos found for the provided video ID." if the API response for the video does not contain any related video items.
 * - Throws a generic `Error` for any other unexpected issues during the process.
 *
 * @example
 * // 1. Running Basic Related Videos Fetch Example
 * const videoId = "dQw4w9WgXcQ"; // Example video ID
 * try {
 * const result = await relatedVideosFn({ videoId });
 * console.log(`Related videos for ${videoId}:`, result);
 * if (result.length > 0) {
 * console.log("First related video title:", result[0].title);
 * }
 * } catch (error) {
 * console.error("Basic Related Videos Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Zod Validation Error Example (Missing videoId - will throw ZodError)
 * try {
 * await relatedVideosFn({} as any); // Using 'as any' to simulate missing required parameter
 * } catch (error) {
 * console.error("Expected Zod Error (Missing videoId):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Zod Validation Error Example (Short videoId - will throw ZodError)
 * try {
 * await relatedVideosFn({ videoId: "a" }); // videoId is less than minimum length (2)
 * } catch (error) {
 * console.error("Expected Zod Error (Short videoId):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Example where no related videos are found (will throw Error)
 * // Use a video ID that is known to have no related videos.
 * const videoIdWithNoRelated = "nonexistentvideoid123abc"; // Replace with a real video ID that has no related videos if possible
 * try {
 * await relatedVideosFn({ videoId: videoIdWithNoRelated });
 * console.log("This should not be reached - No Related Videos Found Example.");
 * } catch (error) {
 * console.error("Expected Error (No Related Videos Found):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Example of an Error during internal video data fetch (e.g., invalid video ID or API issue)
 * // Using a syntactically valid but non-existent video ID will likely trigger this or the "no related videos" error.
 * // const invalidVideoId = "INVALIDVIDEOID123";
 * // try {
 * //    await relatedVideosFn({ videoId: invalidVideoId });
 * // } catch (error) {
 * //    console.error("Expected Error (Internal Fetch Failed):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 6. Example of an Unexpected Error
 * // This is harder to trigger predictably.
 * // try {
 * //    // Code that might cause an unexpected error
 * //    await relatedVideosFn({ videoId: "someValidId" });
 * // } catch (error) {
 * //    console.error("Expected Unexpected Error:", error instanceof Error ? error.message : error);
 * // }
 */
export default async function relatedVideosFn({ videoId }: RelatedVideosOptions): Promise<RelatedVideosType[]> {
    try {
        ZodSchema.parse({ videoId });
        const videos = await relatedVideos({ videoId });
        if (!videos || videos.length === 0) {
            throw new Error(`${colors.red("@error:")} No related videos found for the provided video ID.`);
        }
        return videos;
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
