import colors from "colors";
import { z, ZodError } from "zod";
import { EventEmitter } from "events";
import YouTubeID from "../../web/YouTubeId";
import web, { searchPlaylistsType } from "../../web";

const ZodSchema = z.object({
  query: z.string().min(2),
});
/**
 * Searches for YouTube playlists based on the query.
 *
 * @param query - The search query for playlists.
 * @returns A Promise that resolves with the search results for playlists.
 * @throws An error if the input is a playlist link (use playlist_data instead) or if unable to get a response.
 */
export default function search_playlists({ query }: z.infer<typeof ZodSchema>): EventEmitter {
  const emitter = new EventEmitter();
  (async () => {
    try {
      ZodSchema.parse({ query });
      const isID = await YouTubeID(query);
      if (isID) {
        throw new Error(colors.red("@error: ") + "use playlist_data() for playlist link!");
      }
      const metaData: searchPlaylistsType[] = await web.searchPlaylists({ query });
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
