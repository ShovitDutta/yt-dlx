import WebSocket from "ws";
import colors from "colors";
import { z, ZodError } from "zod";
import { EventEmitter } from "events";
import YouTubeID from "../../web/YouTubeId";
import web, { playlistVideosType } from "../../web";

const routePlaylistData = (
  ws: WebSocket,
  message: {
    query: string;
  },
) => {
  const ZodSchema = z.object({
    query: z.string().min(2),
  });
  function playlist_data({ query }: z.infer<typeof ZodSchema>): EventEmitter {
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
        if (error instanceof ZodError) emitter.emit("error", error.errors);
        else emitter.emit("error", error.message);
      } finally {
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
      }
    })().catch(error => emitter.emit("error", error.message));
    return emitter;
  }
  const res = playlist_data({
    query: message.query,
  });
  res.on("data", data => ws.send(JSON.stringify({ event: "data", data })));
  res.on("info", data => ws.send(JSON.stringify({ event: "info", data })));
  res.on("error", data => ws.send(JSON.stringify({ event: "error", data })));
};

export default routePlaylistData;
