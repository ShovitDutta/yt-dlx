import WebSocket from "ws";
import colors from "colors";
import { z, ZodError } from "zod";
import { EventEmitter } from "events";
import YouTubeID from "../../web/YouTubeId";
import web, { searchVideosType } from "../../web";

const routeSearchVideos = (
  ws: WebSocket,
  message: {
    query: string;
  },
) => {
  const ZodSchema = z.object({
    query: z.string().min(2),
  });
  function search_videos({ query }: z.infer<typeof ZodSchema>): EventEmitter {
    const emitter = new EventEmitter();
    (async () => {
      try {
        ZodSchema.parse({ query });
        const isID = await YouTubeID(query);
        if (isID) {
          throw new Error(colors.red("@error: ") + "use video_data() for video link!");
        }
        const metaData: searchVideosType[] = await web.searchVideos({ query });
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
  const res = search_videos({
    query: message.query,
  });
  res.on("data", data => ws.send(JSON.stringify({ event: "data", data })));
  res.on("info", data => ws.send(JSON.stringify({ event: "info", data })));
  res.on("error", data => ws.send(JSON.stringify({ event: "error", data })));
};

export default routeSearchVideos;
