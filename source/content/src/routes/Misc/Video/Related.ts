import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import { EventEmitter } from "events";
const ZodSchema = z.object({ videoId: z.string().min(2) });
export interface relatedVideosType {
  id: string;
  title: string;
  isLive: boolean;
  duration: number;
  uploadDate: string;
  thumbnails: string[];
}
async function relatedVideos({ videoId }: { videoId: string }, emitter: EventEmitter): Promise<relatedVideosType[] | null> {
  try {
    const youtube = new Client();
    const videoData: any = await youtube.getVideo(videoId);
    if (!videoData?.related?.items) {
      return [];
    }
    const result: relatedVideosType[] = videoData.related.items.map((item: any) => ({
      id: item.id,
      title: item.title,
      isLive: item.isLive,
      duration: item.duration,
      uploadDate: item.uploadDate,
      thumbnails: item.thumbnails,
    }));
    return result;
  } catch (error: any) {
    emitter.emit("error", `${colors.red("@error: ")} ${error.message}`);
    return null;
  }
}
/**
 * @shortdesc Fetches a list of videos related to a specified YouTube video.
 *
 * @description This function takes a YouTube video ID as input and retrieves a list of videos that are suggested as related to the specified video. The function utilizes the `youtubei` library to fetch this data.
 *
 * @param {object} options - Options for fetching related videos.
 * @param {string} options.videoId - The ID of the YouTube video for which to fetch related videos. **Required**.
 *
 * @returns {EventEmitter} An EventEmitter that emits the following events:
 * - `"data"`: Emitted with an array of related video objects (`relatedVideosType`) when the related videos are successfully fetched.
 * - `"error"`: Emitted when an error occurs during the process, such as argument validation or if the video ID is invalid.
 *
 * @example
 * // Define the structure for relatedVideosType
 * interface relatedVideosType {
 * id: string;
 * title: string;
 * isLive: boolean;
 * duration: number;
 * uploadDate: string;
 * thumbnails: string[];
 * }
 *
 * @example
 * // Fetch related videos for a given video ID.
 * YouTubeDLX.related_videos({ videoId: "dQw4w9WgXcQ" })
 * .on("data", (relatedVideos: relatedVideosType[]) => console.log("Related Videos:", relatedVideos))
 * .on("error", (error) => console.error("Error:", error));
 */
export default function related_videos({ videoId }: z.infer<typeof ZodSchema>): EventEmitter {
  const emitter = new EventEmitter();
  (async () => {
    try {
      ZodSchema.parse({ videoId });
      const videos = await relatedVideos({ videoId }, emitter);
      if (!videos || videos.length === 0) {
        emitter.emit("error", `${colors.red("@error: ")} No related videos found for the provided video ID.`);
        return;
      }
      emitter.emit("data", videos);
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
