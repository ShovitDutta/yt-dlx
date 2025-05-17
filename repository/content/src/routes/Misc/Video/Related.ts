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
 * @shortdesc Fetches videos related to a specific YouTube video ID.
 *
 * @description This function retrieves a list of videos that YouTube considers related
 * to the video identified by the provided `videoId`.
 * It uses the `youtubei.js` library internally to fetch the video data and extract the related items.
 * The function requires a valid video ID string as input.
 *
 * The process involves:
 * 1. Fetching data for the specified `videoId`.
 * 2. Extracting the list of related videos from the fetched data.
 * 3. Mapping the related video data to a standardized `RelatedVideosType` format.
 *
 * The function requires the following option:
 * - **VideoId:** A string representing the YouTube video ID. Must be at least 2 characters long. **Required**.
 *
 * The function returns a Promise that resolves with an array of related video objects (`RelatedVideosType[]`).
 * Each object in the array contains details like the video ID, title, duration, thumbnails, etc.
 *
 * @param {object} options - The configuration options for fetching related videos.
 * @param {string} options.videoId - The ID of the YouTube video to find related videos for (minimum 2 characters). **Required**.
 *
 * @returns {Promise<RelatedVideosType[]>} A Promise that resolves with an array of `RelatedVideosType` objects representing the related videos. Returns an empty array or throws an error if no related videos are found.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing `videoId`, `videoId` is less than 2 characters).
 * - Throws an `Error` if no related videos are found for the provided `videoId`. This can happen if the video exists but has no related videos listed, or if the `videoId` is invalid/non-existent (as `youtubei.js` might return data without related items in such cases, which is then checked).
 * - Throws an `Error` for any underlying issues during the video data fetching using the internal `youtubei.js` client (e.g., network errors, API changes, fetching data for a truly non-existent video ID might cause an error in the internal client).
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Running Basic Related Videos Fetch Example
 * try {
 * const result = await relatedVideosFn({ videoId: "dQw4w9WgXcQ" }); // Example video ID
 * console.log("Related Videos:", result);
 * } catch (error) {
 * console.error("Basic Related Videos Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Zod Validation Error Example (Missing videoId - will throw ZodError)
 * try {
 * await relatedVideosFn({} as any); // Using 'as any' to simulate missing required parameter
 * console.log("This should not be reached - Missing videoId Example.");
 * } catch (error) {
 * console.error("Expected Error (Missing videoId):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Zod Validation Error Example (Short videoId - will throw ZodError)
 * try {
 * await relatedVideosFn({ videoId: "a" }); // videoId is less than minimum length (2)
 * console.log("This should not be reached - Short videoId Example.");
 * } catch (error) {
 * console.error("Expected Error (Short videoId):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Nonexistent or Video Without Related Videos Example (will throw Error)
 * // Use a video ID that is non-existent or known to have no related videos.
 * try {
 * await relatedVideosFn({ videoId: "nonexistentvideoid123" }); // Example non-existent ID
 * console.log("This should not be reached - No Related Videos Found Example.");
 * } catch (error) {
 * console.error("Expected Error (No Related Videos Found):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Example of an Unexpected Error during fetch (e.g., network issue, API change, internal client error for a valid ID)
 * // This is harder to trigger predictably with a simple example.
 * // try {
 * //    // Use a video ID that might somehow cause an unexpected issue with the internal client
 * //    await relatedVideosFn({ videoId: "somevideoidcausingerror" });
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
(async () => {
    try {
        console.log("--- Running Basic Related Videos Fetch Example ---");
        const result = await relatedVideosFn({ videoId: "dQw4w9WgXcQ" });
        console.log("Related Videos:", result);
    } catch (error) {
        console.error("Basic Related Videos Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Missing videoId Example ---");
        await relatedVideosFn({} as any);
        console.log("This should not be reached - Missing videoId Example.");
    } catch (error) {
        console.error("Expected Error (Missing videoId):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Short videoId Example ---");
        await relatedVideosFn({ videoId: "a" });
        console.log("This should not be reached - Short videoId Example.");
    } catch (error) {
        console.error("Expected Error (Short videoId):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Nonexistent videoId Example ---");
        await relatedVideosFn({ videoId: "nonexistentvideoid123" });
        console.log("This should not be reached - Nonexistent videoId Example.");
    } catch (error) {
        console.error("Expected Error (No Related Videos Found):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
