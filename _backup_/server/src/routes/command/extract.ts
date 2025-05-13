import WebSocket from "ws";
import colors from "colors";
import { z, ZodError } from "zod";
import ytdlx from "../../base/Agent";
import { EventEmitter } from "events";
import type EngineOutput from "../../interfaces/EngineOutput";

function calculateUploadAgo(days: number) {
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days % 30;
  const formattedString = `${years > 0 ? years + " years, " : ""}${months > 0 ? months + " months, " : ""}${remainingDays} days`;
  return { years, months, days: remainingDays, formatted: formattedString };
}
function calculateVideoDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const formattedString = `${hours > 0 ? hours + " hours, " : ""}${minutes > 0 ? minutes + " minutes, " : ""}${remainingSeconds} seconds`;
  return { hours, minutes, seconds: remainingSeconds, formatted: formattedString };
}
function formatCount(count: number) {
  const abbreviations = ["K", "M", "B", "T"];
  for (let i = abbreviations.length - 1; i >= 0; i--) {
    const size = Math.pow(10, (i + 1) * 3);
    if (size <= count) {
      const formattedCount = Math.round((count / size) * 10) / 10;
      return `${formattedCount}${abbreviations[i]}`;
    }
  }
  return `${count}`;
}

const routeExtract = (
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
  function extract({ query, verbose }: z.infer<typeof ZodSchema>): EventEmitter {
    const emitter = new EventEmitter();
    (async () => {
      try {
        ZodSchema.parse({ query, verbose });
        const metaBody: EngineOutput = await ytdlx({ query, verbose });
        if (!metaBody) {
          throw new Error("Unable to get response!");
        }
        const uploadDate = new Date(metaBody.metaData.upload_date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));
        const currentDate = new Date();
        const daysAgo = Math.floor((currentDate.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));
        const prettyDate = uploadDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const uploadAgoObject = calculateUploadAgo(daysAgo);
        const videoTimeInSeconds = metaBody.metaData.duration;
        const videoDuration = calculateVideoDuration(videoTimeInSeconds);
        const viewCountFormatted = formatCount(metaBody.metaData.view_count);
        const likeCountFormatted = formatCount(metaBody.metaData.like_count);
        const payload = {
          AudioLowF: metaBody.AudioLowF,
          AudioHighF: metaBody.AudioHighF,
          VideoLowF: metaBody.VideoLowF,
          VideoHighF: metaBody.VideoHighF,
          AudioLowDRC: metaBody.AudioLowDRC,
          AudioHighDRC: metaBody.AudioHighDRC,
          AudioLow: metaBody.AudioLow,
          AudioHigh: metaBody.AudioHigh,
          VideoLowHDR: metaBody.VideoLowHDR,
          VideoHighHDR: metaBody.VideoHighHDR,
          VideoLow: metaBody.VideoLow,
          VideoHigh: metaBody.VideoHigh,
          ManifestLow: metaBody.ManifestLow,
          ManifestHigh: metaBody.ManifestHigh,
          meta_data: {
            id: metaBody.metaData.id,
            original_url: metaBody.metaData.original_url,
            webpage_url: metaBody.metaData.webpage_url,
            title: metaBody.metaData.title,
            view_count: metaBody.metaData.view_count,
            like_count: metaBody.metaData.like_count,
            view_count_formatted: viewCountFormatted,
            like_count_formatted: likeCountFormatted,
            uploader: metaBody.metaData.uploader,
            uploader_id: metaBody.metaData.uploader_id,
            uploader_url: metaBody.metaData.uploader_url,
            thumbnail: metaBody.metaData.thumbnail,
            categories: metaBody.metaData.categories,
            time: videoTimeInSeconds,
            duration: videoDuration,
            age_limit: metaBody.metaData.age_limit,
            live_status: metaBody.metaData.live_status,
            description: metaBody.metaData.description,
            full_description: metaBody.metaData.description,
            upload_date: prettyDate,
            upload_ago: daysAgo,
            upload_ago_formatted: uploadAgoObject,
            comment_count: metaBody.metaData.comment_count,
            comment_count_formatted: formatCount(metaBody.metaData.comment_count),
            channel_id: metaBody.metaData.channel_id,
            channel_name: metaBody.metaData.channel,
            channel_url: metaBody.metaData.channel_url,
            channel_follower_count: metaBody.metaData.channel_follower_count,
            channel_follower_count_formatted: formatCount(metaBody.metaData.channel_follower_count),
          },
        };
        emitter.emit("data", payload);
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
  const res = extract({
    query: message.query,
    verbose: message.verbose,
  });
  res.on("data", data => ws.send(JSON.stringify({ event: "data", data })));
  res.on("info", data => ws.send(JSON.stringify({ event: "info", data })));
  res.on("error", data => ws.send(JSON.stringify({ event: "error", data })));
};

export default routeExtract;
