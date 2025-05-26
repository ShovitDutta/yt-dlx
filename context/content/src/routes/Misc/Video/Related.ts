import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
const ZodSchema = z.object({ VideoId: z.string().min(2), Verbose: z.boolean().optional() });
export interface RelatedVideosType {
    id: string;
    title: string;
    isLive: boolean;
    duration: number;
    uploadDate: string;
    thumbnails: string[];
}
async function relatedVideos({ VideoId }: { VideoId: string }): Promise<RelatedVideosType[]> {
    try {
        const youtube = new Client();
        const videoData: any = await youtube.getVideo(VideoId);
        if (!videoData?.related?.items) return [];
        return videoData.related.items.map((item: any) => ({
            id: item.id,
            title: item.title,
            isLive: item.isLive,
            duration: item.duration,
            uploadDate: item.uploadDate,
            thumbnails: item.thumbnails?.[0] || null,
        }));
    } catch (error: any) {
        throw new Error(error.message);
    }
}
type RelatedVideosOptions = z.infer<typeof ZodSchema>;
/**
 * @shortdesc Fetches a list of related YouTube videos for a given video ID.
 *
 * @description This function retrieves a list of videos that YouTube considers related to the provided `VideoId`.
 * It leverages the `youtubei` library to access YouTube's video data, extracting relevant information such as video ID, title, live status, duration, upload date, and thumbnails for each related video.
 *
 * @param options - An object containing the options for retrieving related videos.
 * @param options.VideoId - A string representing the YouTube video ID for which to find related videos. This is a mandatory parameter and must be at least 2 characters long.
 * @param options.Verbose - An optional boolean. If `true`, enables verbose logging, displaying additional information during the execution process. Defaults to `false`.
 *
 * @returns {Promise<RelatedVideosType[]>} A promise that resolves to an array of `RelatedVideosType` objects.
 * Each object in the array represents a related video and has the following properties:
 * - `id`: The unique identifier of the related video.
 * - `title`: The title of the related video.
 * - `isLive`: A boolean indicating whether the related video is a live stream.
 * - `duration`: The duration of the related video in seconds.
 * - `uploadDate`: The date when the related video was uploaded.
 * - `thumbnails`: An array of thumbnail URLs for the related video. (Note: The implementation currently only extracts the first thumbnail.)
 *
 * @throws {Error}
 * - If the `VideoId` is invalid or results in no related videos being found: `Error: @error: No related videos found for the provided video ID.`
 * - If argument validation fails due to invalid `options` (e.g., incorrect type or missing required fields): `Error: @error: Argument validation failed: [path.to.field]: [message]`
 * - For any unexpected errors during the process: `Error: @error: An unexpected error occurred: [error_message]`
 */
export default async function relatedVideosFn({ VideoId, Verbose }: RelatedVideosOptions): Promise<RelatedVideosType[]> {
    try {
        ZodSchema.parse({ VideoId, Verbose });
        const videos = await relatedVideos({ VideoId });
        if (!videos || videos.length === 0) throw new Error(colors.red("@error: ") + " No related videos found for the provided video ID.");
        return videos;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(colors.red("@error: ") + " Argument validation failed: " + error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", "));
        else if (error instanceof Error) throw error;
        else throw new Error(colors.red("@error: ") + " An unexpected error occurred: " + String(error));
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
