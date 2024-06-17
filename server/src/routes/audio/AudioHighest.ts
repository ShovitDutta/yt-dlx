import * as fs from "fs";
import WebSocket from "ws";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import ytdlx from "../../base/Agent";
import { EventEmitter } from "events";

const ZodSchema = z.object({
  query: z.string().min(2),
  output: z.string().optional(),
  useTor: z.boolean().optional(),
  stream: z.boolean().optional(),
  verbose: z.boolean().optional(),
  metadata: z.boolean().optional(),
  filter: z
    .enum([
      "echo",
      "slow",
      "speed",
      "phaser",
      "flanger",
      "panning",
      "reverse",
      "vibrato",
      "subboost",
      "surround",
      "bassboost",
      "nightcore",
      "superslow",
      "vaporwave",
      "superspeed",
    ])
    .optional(),
});

function AudioHighest({
  query,
  output,
  useTor,
  stream,
  filter,
  metadata,
  verbose,
}: z.infer<typeof ZodSchema>): EventEmitter {
  const emitter = new EventEmitter();
  (async () => {
    try {
      ZodSchema.parse({
        query,
        output,
        useTor,
        stream,
        filter,
        metadata,
        verbose,
      });

      const engineData = await ytdlx({
        query,
        verbose,
        useTor,
      }).catch(error => {
        throw new Error(`Engine error: ${error.message}`);
      });
      if (!engineData) {
        throw new Error(`${colors.red("@error:")} unable to get response!`);
      }
      const title = engineData.metaData.title.replace(/[^a-zA-Z0-9_]+/g, "_");
      const folder = output ? output : __dirname;
      if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
      const proc: ffmpeg.FfmpegCommand = ffmpeg();
      proc.setFfmpegPath(path.join(process.cwd(), "public", "ffmpeg.exe"));
      proc.setFfprobePath(path.join(process.cwd(), "public", "ffprobe.exe"));
      proc.addOption("-headers", `X-Forwarded-For: ${engineData.ipAddress}`);
      proc.addInput(engineData.metaData.thumbnail);
      proc.addInput(engineData.AudioHighF.url);
      proc.withOutputFormat("avi");
      const filenameBase = `yt-dlx_(AudioHighest_`;
      let filename = `${filenameBase}${filter ? filter + ")_" : ")_"}${title}.avi`;
      const filterMap: Record<string, string[]> = {
        bassboost: ["bass=g=10,dynaudnorm=f=150"],
        echo: ["aecho=0.8:0.9:1000:0.3"],
        flanger: ["flanger"],
        nightcore: ["aresample=48000,asetrate=48000*1.25"],
        panning: ["apulsator=hz=0.08"],
        phaser: ["aphaser=in_gain=0.4"],
        reverse: ["areverse"],
        slow: ["atempo=0.8"],
        speed: ["atempo=2"],
        subboost: ["asubboost"],
        superslow: ["atempo=0.5"],
        superspeed: ["atempo=3"],
        surround: ["surround"],
        vaporwave: ["aresample=48000,asetrate=48000*0.8"],
        vibrato: ["vibrato=f=6.5"],
      };
      if (filter && filterMap[filter]) proc.withAudioFilter(filterMap[filter]);
      proc.on("progress", progress => {
        emitter.emit("progress", progress);
      });
      proc.on("error", error => {
        emitter.emit("error", error.message);
      });
      proc.on("start", start => {
        emitter.emit("start", start);
      });
      proc.on("end", () => {
        emitter.emit("end", filename);
      });
      if (stream && !metadata) {
        emitter.emit("ready", {
          filename: path.join(folder, filename),
          ffmpeg: proc,
        });
        proc.output(path.join(folder, filename));
        proc.run();
      }
      if (!stream && metadata) {
        emitter.emit("metadata", {
          AudioLowDRC: engineData.AudioLowDRC,
          AudioLowF: engineData.AudioLowF,
          ipAddress: engineData.ipAddress,
          metaData: engineData.metaData,
          filename,
        });
      }
    } catch (error: any) {
      if (error instanceof ZodError) emitter.emit("error", error.errors);
      else emitter.emit("error", error.message);
    } finally {
      emitter.emit(
        "info",
        colors.green("@info:"),
        "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.",
      );
    }
  })().catch(error => {
    emitter.emit("error", error.message);
  });
  return emitter;
}

const routeAudioHighest = (
  ws: WebSocket,
  message: {
    query: string;
    output: string;
    useTor: boolean;
    stream: boolean;
    verbose: boolean;
    metadata: boolean;
  },
) => {
  const res = AudioHighest({
    query: message.query,
    output: message.output,
    useTor: message.useTor,
    stream: message.stream,
    verbose: message.verbose,
    metadata: message.metadata,
  });
  res.on("end", data => {
    ws.send(JSON.stringify({ event: "end", data }));
    ws.close();
  });
  res.on("error", data => ws.send(JSON.stringify({ event: "error", data })));
  res.on("start", data => ws.send(JSON.stringify({ event: "start", data })));
  res.on("progress", data => ws.send(JSON.stringify({ event: "progress", data })));
  res.on("metadata", data => ws.send(JSON.stringify({ event: "metadata", data })));
};

export default routeAudioHighest;
