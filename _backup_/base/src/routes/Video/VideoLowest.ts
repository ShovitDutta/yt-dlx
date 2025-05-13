import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import ytdlx from "../../base/Agent";
import { EventEmitter } from "events";
import { locator } from "../../base/locator";

var ZodSchema = z.object({
  query: z.string().min(2),
  output: z.string().optional(),
  useTor: z.boolean().optional(),
  stream: z.boolean().optional(),
  verbose: z.boolean().optional(),
  metadata: z.boolean().optional(),
  filter: z.enum(["invert", "rotate90", "rotate270", "grayscale", "rotate180", "flipVertical", "flipHorizontal"]).optional(),
});

/**
 * Downloads the lowest quality version of a YouTube video with optional video filter.
 *
 * @param query - The YouTube video URL or ID or name.
 * @param stream - (optional) Whether to return the FfmpegCommand instead of downloading the video.
 * @param verbose - (optional) Whether to log verbose output or not.
 * @param useTor - (optional) Whether to use Tor for the download or not.
 * @param output - (optional) The output directory for the processed files.
 * @param metadata - (optional) If true, the function returns the extracted metadata and filename without processing the audio. This can be useful for debugging or obtaining metadata without downloading the audio.
 * @param filter - (optional) The video filter to apply. Available options: "invert", "rotate90", "rotate270", "grayscale", "rotate180", "flipVertical", "flipHorizontal".
 *
 * @returns An EventEmitter instance to handle events.
 */
export default function VideoLowest({ query, stream, verbose, output, metadata, useTor, filter }: z.infer<typeof ZodSchema>): EventEmitter {
  const emitter = new EventEmitter();
  (async () => {
    try {
      ZodSchema.parse({
        query,
        stream,
        verbose,
        output,
        metadata,
        useTor,
        filter,
      });
      const engineData = await ytdlx({
        query,
        verbose,
        useTor,
      });
      if (!engineData) {
        throw new Error(`${colors.red("@error:")} unable to get response!`);
      }
      const title = engineData.metaData.title.replace(/[^a-zA-Z0-9_]+/g, "_");
      const folder = output ? output : process.cwd();
      if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
      const proc: ffmpeg.FfmpegCommand = ffmpeg();
      proc.setFfmpegPath(path.join(process.cwd(), "public", "ffmpeg.exe"));
      proc.setFfprobePath(path.join(process.cwd(), "public", "ffprobe.exe"));
      proc.addOption("-headers", `X-Forwarded-For: ${engineData.ipAddress}`);
      proc.addInput(engineData.VideoLowF.url);
      proc.withOutputFormat("matroska");
      proc.videoCodec("copy");
      const filenameBase = `yt-dlx_VideoLowest_`;
      let filename = `${filenameBase}${filter ? filter + "_" : "_"}${title}.mkv`;
      const filterMap: Record<string, string[]> = {
        grayscale: ["colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3"],
        invert: ["negate"],
        rotate90: ["rotate=PI/2"],
        rotate180: ["rotate=PI"],
        rotate270: ["rotate=3*PI/2"],
        flipHorizontal: ["hflip"],
        flipVertical: ["vflip"],
      };
      if (filter && filterMap[filter]) proc.withVideoFilter(filterMap[filter]);
      proc.addOption("-headers", `X-Forwarded-For: ${engineData.ipAddress}`);
      proc.on("progress", progress => emitter.emit("progress", progress));
      proc.on("error", error => emitter.emit("error", error.message));
      proc.on("start", start => emitter.emit("start", start));
      proc.on("end", () => emitter.emit("end", filename));
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
          filename,
          metaData: engineData.metaData,
          ipAddress: engineData.ipAddress,
          VideoLowF: engineData.VideoLowF,
          VideoLowHDR: engineData.VideoLowHDR,
          ManifestLow: engineData.ManifestLow,
        });
      }
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
