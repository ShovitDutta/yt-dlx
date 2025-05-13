import colors from "colors";
import { z, ZodError } from "zod";
import { EventEmitter } from "events";
import YouTubeID from "../../web/YouTubeId";
import web, { playlistVideosType } from "../../web";

const ZodSchema = z.object({
  query: z.string().min(2),
});
/**
 * Extracts metadata for videos in a YouTube playlist.
 *
 * @param query - The YouTube playlist URL or ID for which to extract metadata.
 * @returns A Promise that resolves with the metadata of videos in the playlist.
 * @throws An error if the playlist link is incorrect or if unable to get a response.
 */
export default function playlist_data({ query }: z.infer<typeof ZodSchema>): EventEmitter {
  const emitter = new EventEmitter();
  (async () => {
    try {
      ZodSchema.parse({ query });
      const playlistId = await YouTubeID(query);
      if (!playlistId) {
        throw new Error(colors.red("@error: ") + "incorrect playlist link");
      }
      const metaData: playlistVideosType = await web.playlistVideos({ playlistId });
      if (!metaData) {
        throw new Error(colors.red("@error: ") + "Unable to get response!");
      }
      emitter.emit("data", metaData);
    } catch (error: any) {
      switch (true) {
        case error instanceof ZodError:
          emitter.emit("error", error.errors);
          break;
        default:
          emitter.emit("error", error.message);
          break;
      }
    } finally {
      console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
  })().catch(error => emitter.emit("error", error.message));
  return emitter;
}
