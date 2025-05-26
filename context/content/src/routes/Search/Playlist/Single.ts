import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import YouTubeID from "../../../utils/YouTubeId";
const ZodSchema = z.object({ playlistLink: z.string().min(2), Verbose: z.boolean().optional() });
export interface playlistVideosType {
    id: string;
    title: string;
    videoCount: number;
    result: { id: string; title: string; isLive: boolean; duration: number; thumbnails: string[] }[];
}
async function playlistVideos({ PlaylistId }: { PlaylistId: string }): Promise<playlistVideosType | null> {
    try {
        const youtube = new Client();
        const playlistVideosData: any = await youtube.getPlaylist(PlaylistId);
        if (!playlistVideosData) throw new Error(colors.red("@error: ") + " Unable to fetch playlist data.");
        const result = playlistVideosData.videos.items.map((item: any) => ({ id: item.id, title: item.title, isLive: item.isLive, duration: item.duration, thumbnails: item.thumbnails?.[0] || null }));
        return { id: playlistVideosData.id, title: playlistVideosData.title, videoCount: playlistVideosData.videoCount, result };
    } catch (error: any) {
        throw new Error(colors.red("@error: ") + " " + error.message);
    }
}
/**
 * @shortdesc Retrieves detailed information and video listings for a given YouTube playlist.
 *
 * @description This function takes a YouTube playlist link as input and fetches comprehensive data about the playlist,
 * including its ID, title, total video count, and a list of all videos within the playlist.
 * For each video in the playlist, it extracts the video ID, title, live status, duration, and thumbnail URLs.
 * The function leverages the `youtubei` library to interact with YouTube's API.
 *
 * @param options - An object containing the playlist link and optional verbose mode.
 * @param options.playlistLink - A string representing the YouTube playlist URL or ID. This is a mandatory parameter and must be at least 2 characters long.
 * @param options.Verbose - An optional boolean. If `true`, enables verbose logging, displaying additional information during execution. Defaults to `false`.
 *
 * @returns {Promise<playlistVideosType>} A promise that resolves to an object of type `playlistVideosType`.
 * The `playlistVideosType` object includes:
 * - `id`: The unique identifier of the playlist.
 * - `title`: The title of the playlist.
 * - `videoCount`: The total number of videos in the playlist.
 * - `result`: An array of objects, each representing a video in the playlist:
 * - `id`: The unique identifier of the video.
 * - `title`: The title of the video.
 * - `isLive`: A boolean indicating whether the video is a live stream.
 * - `duration`: The duration of the video in seconds.
 * - `thumbnails`: An array of thumbnail URLs for the video. (Note: The current implementation only extracts the first thumbnail.)
 *
 * @throws {Error}
 * - If the `playlistLink` is incorrect or cannot be resolved to a valid playlist ID: `Error: @error: Incorrect playlist link provided.`
 * - If the function is unable to fetch data for the provided playlist: `Error: @error: Unable to fetch playlist data.` or `Error: @error: Unable to retrieve playlist information.`
 * - If argument validation fails due to invalid `options` (e.g., incorrect type or missing required fields): `Error: @error: Argument validation failed: [path.to.field]: [message]`
 * - For any other unexpected errors during the process: `Error: @error: An unexpected error occurred: [error_message]`
 */
export default async function Search_Playlist_Single({ playlistLink, Verbose }: z.infer<typeof ZodSchema>): Promise<playlistVideosType> {
    try {
        ZodSchema.parse({ playlistLink, Verbose });
        const PlaylistId = await YouTubeID(playlistLink);
        if (!PlaylistId) throw new Error(colors.red("@error: ") + " Incorrect playlist link provided.");
        const metaData: playlistVideosType | null = await playlistVideos({ PlaylistId });
        if (!metaData) throw new Error(colors.red("@error: ") + " Unable to retrieve playlist information.");
        return metaData;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(colors.red("@error: ") + " Argument validation failed: " + error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", "));
        else if (error instanceof Error) throw error;
        else throw new Error(colors.red("@error: ") + " An unexpected error occurred: " + String(error));
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
