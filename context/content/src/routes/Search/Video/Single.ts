import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import YouTubeID from "../../../utils/YouTubeId";
const ZodSchema = z.object({ VideoLink: z.string().min(2), Verbose: z.boolean().optional() });
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
async function singleVideo({ VideoId }: { VideoId: string }): Promise<SingleVideoType> {
    try {
        const youtube = new Client();
        const singleVideoData: any = await youtube.getVideo(VideoId);
        if (!singleVideoData) {
            throw new Error(colors.red("@error: ") + " Unable to fetch video data.");
        }
        return {
            id: singleVideoData.id,
            title: singleVideoData.title,
            thumbnails: singleVideoData.thumbnails?.[0] || null,
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
 * @shortdesc Retrieves detailed information about a single YouTube video.
 *
 * @description This function fetches comprehensive data for a specified YouTube video, including its title, thumbnails, upload date, description, duration, view count, channel information, tags, and like count.
 * It takes a YouTube video link as input and uses the `youtubei` library to interact with the YouTube API.
 *
 * @param options - An object containing the options for retrieving video data.
 * @param options.VideoLink - A string representing the YouTube video URL or ID. This is a mandatory parameter and must be at least 2 characters long.
 * @param options.Verbose - An optional boolean. If `true`, enables verbose logging, displaying additional information during execution. Defaults to `false`.
 *
 * @returns {Promise<SingleVideoType>} A promise that resolves to a `SingleVideoType` object, containing the following properties:
 * - `id`: The unique identifier of the video.
 * - `title`: The title of the video.
 * - `thumbnails`: An array of thumbnail URLs for the video. (Note: The implementation currently only extracts the first thumbnail).
 * - `uploadDate`: The date when the video was uploaded.
 * - `description`: The description of the video.
 * - `duration`: The duration of the video in seconds.
 * - `isLive`: A boolean indicating whether the video is a live stream.
 * - `viewCount`: The number of views the video has.
 * - `channelid`: The ID of the channel that uploaded the video.
 * - `channelname`: The name of the channel that uploaded the video.
 * - `tags`: Tags associated with the video (as a single string, if available).
 * - `likeCount`: The number of likes the video has.
 *
 * @throws {Error}
 * - If the `VideoLink` is incorrect or invalid: `Error: @error: Incorrect video link provided.`
 * - If the function is unable to fetch video data from YouTube: `Error: @error: Unable to fetch video data.`
 * - If argument validation fails due to invalid `options` (e.g., incorrect type or missing required fields): `Error: @error: Argument validation failed: [path.to.field]: [message]`
 * - For any unexpected errors during the process: `Error: @error: An unexpected error occurred: [error_message]`
 */
export default async function videoData({ VideoLink, Verbose }: VideoDataOptions): Promise<SingleVideoType> {
    try {
        ZodSchema.parse({ VideoLink, Verbose });
        const vId = await YouTubeID(VideoLink);
        if (!vId) throw new Error(colors.red("@error: ") + " Incorrect video link provided.");
        const metaData = await singleVideo({ VideoId: vId });
        return metaData;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(colors.red("@error: ") + " Argument validation failed: " + error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", "));
        else if (error instanceof Error) throw error;
        else throw new Error(colors.red("@error: ") + " An unexpected error occurred: " + String(error));
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
