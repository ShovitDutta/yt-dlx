import colors from "colors";
import { z, ZodError } from "zod";
import { EventEmitter } from "events";
import YouTubeID from "../../web/YouTubeId";
import web, { singleVideoType } from "../../web";

const ZodSchema = z.object({
  query: z.string().min(2),
});
/**
 * Fetches data for a single YouTube video based on the video ID or link.
 *
 * @param query - The video ID or link.
 * @returns A Promise that resolves with the metadata for the single video.
 * @throws An error if the input is an incorrect video link or if unable to get a response.
 */
export default function video_data({ query }: z.infer<typeof ZodSchema>): EventEmitter {
  const emitter = new EventEmitter();
  (async () => {
    try {
      ZodSchema.parse({ query });
      const videoId = await YouTubeID(query);
      if (!videoId) {
        throw new Error(colors.red("@error: ") + "incorrect video link");
      }
      const metaData: singleVideoType = await web.singleVideo({ videoId });
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
