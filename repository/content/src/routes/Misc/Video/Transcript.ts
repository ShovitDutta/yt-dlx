import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import { EventEmitter } from "events";
import YouTubeID from "../../../utils/YouTubeId";
const ZodSchema = z.object({ videoLink: z.string().min(2) });
export interface CaptionSegment {
  utf8: string;
  tOffsetMs?: number;
  acAsrConf: number;
}
export interface VideoTranscriptType {
  text: string;
  start: number;
  duration: number;
  segments: CaptionSegment[];
}
async function getVideoTranscript({ videoId }: { videoId: string }, emitter: EventEmitter): Promise<VideoTranscriptType[]> {
  try {
    const youtube = new Client();
    const captions = await youtube.getVideoTranscript(videoId);
    if (!captions) return [];
    return captions.map(caption => ({
      text: caption.text,
      start: caption.start,
      duration: caption.duration,
      segments: caption.segments.map(segment => ({
        utf8: segment.utf8,
        tOffsetMs: segment.tOffsetMs,
        acAsrConf: segment.acAsrConf,
      })),
    }));
  } catch (error: any) {
    emitter.emit("error", `${colors.red("@error: ")} ${error.message}`);
    return [];
  }
}
/**
 * @shortdesc Fetches the transcript of a YouTube video.
 *
 * @description This function retrieves the available transcript (captions) for a given YouTube video link.
 * It requires a valid video link as input.
 *
 * The function requires the following configuration option:
 * - **videoLink:** A string representing the URL of the YouTube video from which to fetch the transcript. This is a mandatory parameter.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - `"data"`: Emitted when the transcript data is successfully fetched and processed. The emitted data is an array of transcript segments.
 * - `"error"`: Emitted when an error occurs at any stage, such as argument validation, providing an incorrect video link, or failure to retrieve the transcript. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.videoLink - The URL of the YouTube video. **Required**.
 *
 * @returns {EventEmitter} An EventEmitter instance for handling events during transcript fetching.
 *
 * @example
 * // 1. Fetch transcript for a valid video link
 * YouTubeDLX.Misc.Video.Transcript({ videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" })
 * .on("data", (transcript) => console.log("Video Transcript:", transcript))
 * .on("error", (error) => console.error("Error fetching transcript:", error));
 *
 * @example
 * // 2. Fetch transcript using a shortened video URL
 * YouTubeDLX.Misc.Video.Transcript({ videoLink: "https://youtu.be/dQw4w9WgXcQ" })
 * .on("data", (transcript) => console.log("Video Transcript:", transcript))
 * .on("error", (error) => console.error("Error fetching transcript:", error));
 *
 * @example
 * // 3. Missing required 'videoLink' parameter (will result in a Zod error)
 * YouTubeDLX.Misc.Video.Transcript({} as any)
 * .on("error", (error) => console.error("Expected Error (missing videoLink):", error));
 *
 * @example
 * // 4. Invalid 'videoLink' format (will result in an error from YouTubeID)
 * YouTubeDLX.Misc.Video.Transcript({ videoLink: "this is not a video link" })
 * .on("error", (error) => console.error("Expected Error (incorrect video link):", error));
 *
 * @example
 * // 5. Video link for a video without a transcript
 * // Note: This scenario depends on the specific video.
 * // The error emitted would be: "@error: Unable to get transcript for this video!"
 * YouTubeDLX.Misc.Video.Transcript({ videoLink: "https://www.youtube.com/watch?v=VIDEO_ID_WITHOUT_TRANSCRIPT" })
 * .on("error", (error) => console.error("Expected Error (no transcript available):", error));
 *
 * @example
 * // 6. An unexpected error occurs during fetching (e.g., network issue, API change)
 * // Note: This scenario simulates a potential internal error during the fetching process.
 * // The error emitted would be: "@error: " followed by the underlying error message.
 * // YouTubeDLX.Misc.Video.Transcript({ videoLink: "valid_link_but_fetch_fails" })
 * // .on("error", (error) => console.error("Expected Error (fetch failed):", error));
 *
 */
export default function video_transcript({ videoLink }: z.infer<typeof ZodSchema>): EventEmitter {
  const emitter = new EventEmitter();
  (async () => {
    try {
      ZodSchema.parse({ videoLink });
      const vId = await YouTubeID(videoLink);
      if (!vId) {
        emitter.emit("error", `${colors.red("@error: ")} incorrect video link`);
        return;
      }
      const transcriptData: VideoTranscriptType[] = await getVideoTranscript({ videoId: vId }, emitter);
      if (!transcriptData || transcriptData.length === 0) {
        emitter.emit("error", `${colors.red("@error: ")} Unable to get transcript for this video!`);
        return;
      }
      emitter.emit("data", transcriptData);
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
