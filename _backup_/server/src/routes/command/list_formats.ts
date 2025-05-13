import WebSocket from "ws";
import colors from "colors";
import { z, ZodError } from "zod";
import ytdlx from "../../base/Agent";
import { EventEmitter } from "events";
import type EngineOutput from "../../interfaces/EngineOutput";

const routeListFormats = (
  ws: WebSocket,
  message: {
    query: string;
    verbose: boolean;
  },
) => {
  const ZodSchema = z.object({
    query: z.string().min(2),
    verbose: z.boolean().optional(),
  });
  function list_formats({ query, verbose }: z.infer<typeof ZodSchema>): EventEmitter {
    const emitter = new EventEmitter();
    (async () => {
      try {
        ZodSchema.parse({ query, verbose });
        const metaBody: EngineOutput = await ytdlx({ query, verbose });
        if (!metaBody) {
          throw new Error("@error: Unable to get response from YouTube.");
        }
        const formatData = {
          AudioLow: metaBody.AudioLow.map(item => ({
            filesizeP: item.filesizeP,
            format_note: item.format_note,
          })),
          AudioLowDRC: metaBody.AudioLowDRC.map(item => ({
            filesizeP: item.filesizeP,
            format_note: item.format_note,
          })),
          AudioHigh: metaBody.AudioHigh.map(item => ({
            filesizeP: item.filesizeP,
            format_note: item.format_note,
          })),
          AudioHighDRC: metaBody.AudioHighDRC.map(item => ({
            filesizeP: item.filesizeP,
            format_note: item.format_note,
          })),
          VideoLow: metaBody.VideoLow.map(item => ({
            filesizeP: item.filesizeP,
            format_note: item.format_note,
          })),
          VideoLowHDR: metaBody.VideoLowHDR.map(item => ({
            filesizeP: item.filesizeP,
            format_note: item.format_note,
          })),
          VideoHigh: metaBody.VideoHigh.map(item => ({
            filesizeP: item.filesizeP,
            format_note: item.format_note,
          })),
          VideoHighHDR: metaBody.VideoHighHDR.map(item => ({
            filesizeP: item.filesizeP,
            format_note: item.format_note,
          })),
          ManifestLow: metaBody.ManifestLow.map(item => ({ format: item.format, tbr: item.tbr })),
          ManifestHigh: metaBody.ManifestHigh.map(item => ({ format: item.format, tbr: item.tbr })),
        };
        emitter.emit("data", formatData);
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
  const res = list_formats({
    query: message.query,
    verbose: message.verbose,
  });
  res.on("data", data => ws.send(JSON.stringify({ event: "data", data })));
  res.on("info", data => ws.send(JSON.stringify({ event: "info", data })));
  res.on("error", data => ws.send(JSON.stringify({ event: "error", data })));
};

export default routeListFormats;
