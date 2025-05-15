import path from "path";
import colors from "colors";
import { Client } from "youtubei";
import { z, ZodError } from "zod";
import Tuber from "../../../utils/Agent";
import { EventEmitter } from "events";
import { Innertube, UniversalCache } from "youtubei.js";
import { CommentType } from "../../../interfaces/CommentType";
import type EngineOutput from "../../../interfaces/EngineOutput";
const ZodSchema = z.object({ query: z.string().min(2), useTor: z.boolean().optional(), verbose: z.boolean().optional() });
interface CaptionSegment {
    utf8: string;
    tOffsetMs?: number;
    acAsrConf: number;
}
interface VideoTranscriptType {
    text: string;
    start: number;
    duration: number;
    segments: CaptionSegment[];
}
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
async function fetchCommentsByVideoId(videoId: string, verbose: boolean): Promise<CommentType[] | null> {
    try {
        if (verbose) console.log(colors.green("@info:"), `Fetching comments for video ID: ${videoId}`);
        const youtubeInnertube = await Innertube.create({
            user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            cache: new UniversalCache(true, path.join(process.cwd(), "YouTubeDLX")),
        });
        const response = await youtubeInnertube.getComments(videoId);
        const comments: CommentType[] = response.contents
            .map(thread => {
                const comment = thread?.comment;
                if (!comment || !comment.content?.text || !comment.published_time || !comment.author?.name) return null;
                return {
                    comment_id: comment.comment_id || "",
                    is_pinned: comment.is_pinned || false,
                    comment: comment.content.text,
                    published_time: comment.published_time,
                    author_is_channel_owner: comment.author_is_channel_owner || false,
                    creator_thumbnail_url: comment.creator_thumbnail_url || "",
                    like_count: comment.like_count || 0,
                    is_member: comment.is_member || false,
                    author: comment.author.name,
                    is_hearted: comment.is_hearted || false,
                    is_liked: comment.is_liked || false,
                    is_disliked: comment.is_disliked || false,
                    reply_count: comment.reply_count || 0,
                    hasReplies: thread.has_replies || false,
                } as CommentType;
            })
            .filter((item): item is CommentType => item !== null);
        if (comments.length === 0) {
            if (verbose) console.log(colors.red("@error:"), "No comments found for the video");
            return null;
        }
        if (verbose) console.log(colors.green("@info:"), "Video comments fetched!");
        return comments;
    } catch (error: any) {
        if (verbose) console.error(colors.red("@error: ") + error.message);
        return null;
    }
}
async function fetchVideoTranscript(videoId: string, verbose: boolean): Promise<VideoTranscriptType[] | null> {
    try {
        if (verbose) console.log(colors.green("@info:"), `Fetching transcript for video ID: ${videoId}`);
        const youtube = new Client();
        const captions = await youtube.getVideoTranscript(videoId);
        if (!captions) {
            if (verbose) console.log(colors.red("@error:"), "No transcript found for the video");
            return null;
        }
        const transcript = captions.map(caption => ({
            text: caption.text,
            start: caption.start,
            duration: caption.duration,
            segments: caption.segments.map(segment => ({
                utf8: segment.utf8,
                tOffsetMs: segment.tOffsetMs,
                acAsrConf: segment.acAsrConf,
            })),
        }));
        if (verbose) console.log(colors.green("@info:"), "Video transcript fetched!");
        return transcript;
    } catch (error: any) {
        if (verbose) console.error(colors.red("@error: ") + error.message);
        return null;
    }
}
/**
 * @shortdesc Extracts comprehensive information about a YouTube video.
 *
 * @description This function extracts detailed data for a given YouTube video, including its metadata, available audio and video formats, comments, and transcript. It uses multiple internal tools to gather this information based on a search query or video URL. Optional parameters allow for using Tor and enabling verbose logging.
 *
 * The function requires a search query or video URL. It compiles data from various sources into a single, comprehensive output.
 *
 * It supports the following configuration options:
 * - **query:** A string representing the search query or video URL of the video to extract information from. This is a mandatory parameter.
 * - **useTor:** An optional boolean value. If true, the function will attempt to use Tor for certain network requests (specifically, those made by the internal Tuber agent), enhancing anonymity.
 * - **verbose:** An optional boolean value. If true, enables detailed logging to the console throughout the extraction process, including fetching metadata, comments, and transcript.
 *
 * The function returns an EventEmitter instance that emits events during the extraction process:
 * - `"data"`: Emitted when all requested information is successfully extracted and compiled. The emitted data is a comprehensive object containing video formats, detailed metadata, comments (if available), and the transcript (if available).
 * - `"error"`: Emitted when an error occurs at any stage, such as argument validation, failure to retrieve initial video data, or issues fetching comments or the transcript. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.query - The search query or video URL. **Required**.
 * @param {boolean} [options.useTor=false] - Whether to use Tor for certain requests.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 *
 * @returns {EventEmitter} An EventEmitter instance for handling events during the extraction process.
 *
 * @example
 * // 1. Extract information for a video using a query
 * YouTubeDLX.Misc.Video.Extract({ query: "your search query or url" })
 * .on("data", (data) => console.log("Video Data:", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 2. Extract information using a query and enable verbose logging
 * YouTubeDLX.Misc.Video.Extract({ query: "your search query or url", verbose: true })
 * .on("data", (data) => console.log("Video Data (Verbose):", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 3. Extract information using a query and attempt to use Tor
 * YouTubeDLX.Misc.Video.Extract({ query: "your search query or url", useTor: true })
 * .on("data", (data) => console.log("Video Data (with Tor):", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 4. Extract information using a query with both verbose logging and Tor
 * YouTubeDLX.Misc.Video.Extract({ query: "your search query or url", verbose: true, useTor: true })
 * .on("data", (data) => console.log("Video Data (Verbose, with Tor):", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 5. Missing required 'query' parameter (will result in an error)
 * YouTubeDLX.Misc.Video.Extract({} as any)
 * .on("error", (error) => console.error("Expected Error (missing query):", error));
 *
 * @example
 * // 6. Query results in no engine data
 * // Note: This scenario depends on the internal Tuber function's behavior.
 * // You can simulate by providing a query that is unlikely to return results.
 * YouTubeDLX.Misc.Video.Extract({ query: "a query that should return no results 12345abcde" })
 * .on("error", (error) => console.error("Expected Error (no engine data):", error));
 *
 * @example
 * // 7. Engine data missing metadata
 * // Note: This is an internal error scenario, difficult to trigger via simple example call.
 * // The error emitted would be: "@error: Metadata not found in the response!"
 *
 * @example
 * // 8. Failed to parse upload date (internal error)
 * // Note: This is an internal error scenario, unlikely with standard YouTube data.
 * // The error emitted would be: "@error: Failed to parse upload date: ..."
 *
 * @example
 * // 9. Failed to fetch comments
 * // Note: This can happen if comments are disabled or due to network issues during comment fetching.
 * // The `comments` property in the output will be null, and an error might be logged if verbose is true.
 * // The main emitter will only emit an error if the *entire* process fails critically before fetching comments/transcript.
 * // If comments fetching fails but the rest succeeds, the 'data' event will fire with `comments: null`.
 * // Example showing data event even if comments fail:
 * YouTubeDLX.Misc.Video.Extract({ query: "a video where comments are disabled" })
 * .on("data", (data) => console.log("Video Data (comments null):", data.comments === null))
 * .on("error", (error) => console.error("Error:", error)); // This error is less likely unless the main data fetch fails
 *
 * @example
 * // 10. Failed to fetch transcript
 * // Note: This can happen if subtitles/transcripts are not available for the video or due to network issues.
 * // The `transcript` property in the output will be null, and an error might be logged if verbose is true.
 * // Similar to comments, the main emitter will only emit an error if the entire process fails critically before fetching comments/transcript.
 * // If transcript fetching fails but the rest succeeds, the 'data' event will fire with `transcript: null`.
 * // Example showing data event even if transcript fails:
 * YouTubeDLX.Misc.Video.Extract({ query: "a video with no transcript" })
 * .on("data", (data) => console.log("Video Data (transcript null):", data.transcript === null))
 * .on("error", (error) => console.error("Error:", error)); // This error is less likely unless the main data fetch fails
 *
 * @example
 * // 11. An unexpected error occurs during processing
 * // Note: This is a catch-all for unforeseen errors. The emitted error message will vary.
 * // YouTubeDLX.Misc.Video.Extract({...})
 * // .on("error", (error) => console.error("Unexpected Error:", error)); // Emits "@error: An unexpected error occurred: ..."
 */
export default function extract(options: z.infer<typeof ZodSchema>): EventEmitter {
    const emitter = new EventEmitter();
    (async () => {
        try {
            const { query, useTor, verbose } = ZodSchema.parse(options);
            const metaBody: EngineOutput = await Tuber({ query, verbose, useTor });
            if (!metaBody) {
                emitter.emit("error", `${colors.red("@error:")} Unable to get response!`);
                return;
            }
            if (!metaBody.metaData) {
                emitter.emit("error", `${colors.red("@error:")} Metadata not found in the response!`);
                return;
            }
            let uploadDate: Date | undefined;
            try {
                if (metaBody.metaData.upload_date) {
                    uploadDate = new Date(metaBody.metaData.upload_date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));
                }
            } catch (error) {
                emitter.emit("error", `${colors.red("@error:")} Failed to parse upload date: ${error instanceof Error ? error.message : String(error)}`);
            }
            const currentDate = new Date();
            const daysAgo = uploadDate ? Math.floor((currentDate.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
            const prettyDate = uploadDate?.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) || "N/A";
            const uploadAgoObject = calculateUploadAgo(daysAgo);
            const videoTimeInSeconds = metaBody.metaData.duration;
            const videoDuration = calculateVideoDuration(videoTimeInSeconds);
            const viewCountFormatted = metaBody.metaData.view_count !== undefined ? formatCount(metaBody.metaData.view_count) : "N/A";
            const likeCountFormatted = metaBody.metaData.like_count !== undefined ? formatCount(metaBody.metaData.like_count) : "N/A";
            const commentCountFormatted = metaBody.metaData.comment_count !== undefined ? formatCount(metaBody.metaData.comment_count) : "N/A";
            const channelFollowerCountFormatted = metaBody.metaData.channel_follower_count !== undefined ? formatCount(metaBody.metaData.channel_follower_count) : "N/A";
            const commentsPromise = fetchCommentsByVideoId(metaBody.metaData.id, verbose ?? false);
            const transcriptPromise = fetchVideoTranscript(metaBody.metaData.id, verbose ?? false);
            const [comments, transcript] = await Promise.all([commentsPromise, transcriptPromise]);
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
                    comment_count_formatted: commentCountFormatted,
                    channel_id: metaBody.metaData.channel_id,
                    channel_name: metaBody.metaData.channel,
                    channel_url: metaBody.metaData.channel_url,
                    channel_follower_count: metaBody.metaData.channel_follower_count,
                    channel_follower_count_formatted: channelFollowerCountFormatted,
                },
                comments,
                transcript,
            };
            emitter.emit("data", payload);
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
