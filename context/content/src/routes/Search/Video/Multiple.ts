import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
const ZodSchema = z.object({
    Query: z.string().min(2),
    minViews: z.number().optional(),
    maxViews: z.number().optional(),
    Verbose: z.boolean().optional(),
    orderBy: z.enum(["relevance", "viewCount", "rating", "date"]).optional(),
});
type SearchVideosOptions = z.infer<typeof ZodSchema>;
interface VideoSearchResult {
    id: string;
    title: string;
    isLive: boolean;
    duration?: number;
    viewCount?: number;
    uploadDate?: string;
    channelid?: string;
    thumbnails?: any[];
    description?: string;
    channelname?: string;
}
/**
 * @shortdesc Searches for YouTube videos based on a query and optional criteria, including view count filters and sorting.
 *
 * @description This function allows you to search for YouTube videos using a specified query.
 * It provides advanced filtering capabilities based on minimum and maximum view counts,
 * and allows you to sort the results by relevance, view count, rating, or upload date.
 * The function retrieves essential video details such as ID, title, live status, duration, view count,
 * upload date, channel information, and thumbnails.
 *
 * @param options - An object containing the search query and optional filters.
 * @param options.Query - A string representing the search query for YouTube videos. This is a mandatory parameter and must be at least 2 characters long.
 * @param options.minViews - An optional number specifying the minimum number of views a video must have to be included in the search results.
 * @param options.maxViews - An optional number specifying the maximum number of views a video can have to be included in the search results.
 * @param options.Verbose - An optional boolean. If `true`, enables verbose logging, displaying additional information during the search process. Defaults to `false`.
 * @param options.orderBy - An optional enum specifying the order in which the search results should be sorted:
 * - `"relevance"`: Sorts results by relevance to the query (default YouTube behavior).
 * - `"viewCount"`: Sorts results by the number of views in descending order.
 * - `"rating"`: Sorts results by rating (currently not implemented in the provided code, will default to original order).
 * - `"date"`: Sorts results by upload date in descending order (newest first).
 *
 * @returns {Promise<VideoSearchResult[]>} A promise that resolves to an array of `VideoSearchResult` objects.
 * Each object in the array represents a video found and has the following properties:
 * - `id`: The unique identifier of the video.
 * - `title`: The title of the video.
 * - `isLive`: A boolean indicating whether the video is a live stream.
 * - `duration`: (Optional) The duration of the video in seconds.
 * - `viewCount`: (Optional) The number of views the video has.
 * - `uploadDate`: (Optional) The upload date of the video in a string format (e.g., "YYYY-MM-DD").
 * - `channelid`: (Optional) The ID of the channel that uploaded the video.
 * - `thumbnails`: (Optional) The URL of the highest quality thumbnail available for the video. (Note: The implementation currently only extracts the highest quality thumbnail URL).
 * - `description`: (Optional) A brief description of the video.
 * - `channelname`: (Optional) The name of the channel that uploaded the video.
 *
 * @throws {Error}
 * - If no videos are found matching the given query and criteria: `Error: @error: No videos found with the given criteria.`
 * - If argument validation fails due to invalid `options` (e.g., incorrect type, missing required fields, or invalid enum value for `orderBy`): `Error: @error: Argument validation failed: [path.to.field]: [message]`
 * - For any unexpected errors during the search operation: `Error: @error: An unexpected error occurred: [error_message]`
 */
export default async function Search_Video_Multiple({ Query, minViews, maxViews, orderBy, Verbose }: SearchVideosOptions): Promise<VideoSearchResult[]> {
    try {
        ZodSchema.parse({ Query, minViews, maxViews, orderBy, Verbose });
        const youtube = new Client();
        const searchResults = await youtube.search(Query, { type: "video" });
        let videos: VideoSearchResult[] = searchResults.items.map((item: any) => ({
            id: item.id,
            title: item.title,
            isLive: item.isLive,
            duration: item.duration,
            viewCount: item.viewCount,
            uploadDate: item.uploadDate,
            channelid: item.channel?.id,
            thumbnails: item.thumbnails?.[0]?.Highest?.url || null,
            description: item.description,
            channelname: item.channel?.name,
        }));
        if (minViews !== undefined) videos = videos.filter(video => (video.viewCount ?? 0) >= minViews);
        if (maxViews !== undefined) videos = videos.filter(video => (video.viewCount ?? 0) <= maxViews);
        if (orderBy) {
            if (orderBy === "viewCount") videos.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
            else if (orderBy === "date") videos.sort((a, b) => new Date(b.uploadDate ?? 0).getTime() - new Date(a.uploadDate ?? 0).getTime());
        }
        if (videos.length === 0) throw new Error(colors.red("@error: ") + " No videos found with the given criteria.");
        return videos;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(colors.red("@error: ") + " Argument validation failed: " + error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", "));
        else if (error instanceof Error) throw error;
        else throw new Error(colors.red("@error: ") + " An unexpected error occurred: " + String(error));
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
