import * as path from "path";
import * as colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import Tuber from "../../../utils/Agent";
import { Innertube, UniversalCache } from "youtubei.js";
import type { CommentType } from "../../../interfaces/CommentType";
import { EngineOutput } from "../../../interfaces/EngineOutput";
const ZodSchema = z.object({ Query: z.string().min(2), UseTor: z.boolean().optional(), Verbose: z.boolean().optional() });
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
interface UploadAgo {
    years: number;
    months: number;
    days: number;
    formatted: string;
}
interface VideoDuration {
    hours: number;
    minutes: number;
    seconds: number;
    formatted: string;
}
interface PayloadType {
    MetaData: EngineOutput["MetaData"] & {
        upload_ago: number;
        upload_ago_formatted: UploadAgo;
        view_count_formatted: string;
        like_count_formatted: string;
        comment_count_formatted: string;
        channel_follower_count_formatted: string;
        VideoLink?: string;
        videoId?: string;
    };
    AudioOnly: EngineOutput["AudioOnly"];
    VideoOnly: EngineOutput["VideoOnly"];
    Thumbnails: EngineOutput["Thumbnails"];
    Heatmap: EngineOutput["Heatmap"];
    Chapters: EngineOutput["Chapters"];
    Subtitle: EngineOutput["Subtitle"];
    Captions: EngineOutput["Captions"];
    comments: CommentType[] | null;
    transcript: VideoTranscriptType[] | null;
}
function calculateUploadAgo(days: number): UploadAgo {
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;
    const formattedString = `${years > 0 ? years + " years, " : ""}${months > 0 ? months + " months, " : ""}${remainingDays} days`;
    return { years, months, days: remainingDays, formatted: formattedString };
}
function calculateVideoDuration(seconds: number): VideoDuration {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    const formattedString = `${hours > 0 ? hours + " hours, " : ""}${minutes > 0 ? minutes + " minutes, " : ""}${remainingSeconds} seconds`;
    return { hours, minutes, seconds: remainingSeconds, formatted: formattedString };
}
function formatCount(count: number): string {
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
async function fetchCommentsByVideoId(VideoId: string, Verbose: boolean): Promise<CommentType[] | null> {
    try {
        if (Verbose) console.log(colors.green("@info: ") + "Workspaceing comments for video ID: " + VideoId);
        const youtubeInnertube = await Innertube.create({
            user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            cache: new UniversalCache(true, path.join(process.cwd(), "YouTubeDLX")),
        });
        const response = await youtubeInnertube.getComments(VideoId);
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
            if (Verbose) console.log(colors.red("@error: ") + "No comments found for the video");
            return null;
        }
        if (Verbose) console.log(colors.green("@info: ") + "Video comments fetched!");
        return comments;
    } catch (error: any) {
        if (Verbose) console.error(colors.red("@error: ") + error.message);
        return null;
    }
}
async function fetchVideoTranscript(VideoId: string, Verbose: boolean): Promise<VideoTranscriptType[] | null> {
    try {
        if (Verbose) console.log(colors.green("@info: ") + "Working on transcript for video ID: " + VideoId);
        const youtube = new Client();
        const captions = await youtube.getVideoTranscript(VideoId);
        if (!captions) {
            if (Verbose) console.log(colors.red("@error: ") + "No transcript found for the video");
            return null;
        }
        const transcript = captions.map(caption => ({
            text: caption.text,
            start: caption.start,
            duration: caption.duration,
            segments: caption.segments.map(segment => ({ utf8: segment.utf8, tOffsetMs: segment.tOffsetMs, acAsrConf: segment.acAsrConf })),
        }));
        if (Verbose) console.log(colors.green("@info: ") + "Video transcript fetched!");
        return transcript;
    } catch (error: any) {
        if (Verbose) console.error(colors.red("@error: ") + error.message);
        return null;
    }
}
/**
 * @shortdesc Extracts comprehensive metadata, audio/video formats, comments, and transcript for a given YouTube video.
 *
 * @description This powerful function serves as a central point for extracting a wide array of information about a YouTube video.
 * It fetches general metadata (title, views, likes, etc.), available audio-only and video-only formats, thumbnails,
 * heatmap data, chapters, subtitles, captions, and attempts to retrieve comments and video transcripts.
 * The function enhances some metadata fields with formatted versions (e.g., human-readable upload date, abbreviated counts).
 * It uses both `youtubei` and `youtubei.js` (Innertube) clients for robust data retrieval and supports optional Tor usage for privacy.
 *
 * @param options - An object containing the query and optional verbose mode.
 * @param options.Query - A string representing the YouTube video URL or ID. This is a mandatory parameter and must be at least 2 characters long.
 * @param options.UseTor - An optional boolean. If `true`, network requests will attempt to be routed through the Tor network. Defaults to `false`.
 * @param options.Verbose - An optional boolean. If `true`, enables verbose logging, providing detailed output during the extraction process, including progress messages for comments and transcripts. Defaults to `false`.
 *
 * @returns {Promise<PayloadType>} A promise that resolves to a `PayloadType` object containing:
 * - `MetaData`: An extended `EngineOutput["MetaData"]` object with additional formatted fields:
 * - `upload_ago`: The number of days since the video was uploaded.
 * - `upload_ago_formatted`: An object with `years`, `months`, `days`, and a human-readable `formatted` string (e.g., "1 year, 2 months, 5 days").
 * - `view_count_formatted`: The view count formatted with abbreviations (e.g., "1.2M").
 * - `like_count_formatted`: The like count formatted with abbreviations (e.g., "50K").
 * - `comment_count_formatted`: The comment count formatted with abbreviations (e.g., "10K").
 * - `channel_follower_count_formatted`: The channel follower count formatted with abbreviations (e.g., "2M").
 * - `VideoLink`: (Optional) The original video link if available from the engine.
 * - `videoId`: (Optional) The video ID if available from the engine.
 * - `duration`: The video duration in seconds (overwrites original duration with parsed seconds).
 * - `upload_date`: The upload date formatted as a human-readable string (e.g., "May 26, 2025").
 * - `AudioOnly`: Available audio-only formats as returned by the engine.
 * - `VideoOnly`: Available video-only formats as returned by the engine.
 * - `Thumbnails`: Thumbnail URLs as returned by the engine.
 * - `Heatmap`: Heatmap data (engagement data) as returned by the engine.
 * - `Chapters`: Chapter information as returned by the engine.
 * - `Subtitle`: Subtitle information as returned by the engine.
 * - `Captions`: Caption information as returned by the engine.
 * - `comments`: An array of `CommentType` objects if comments are found, otherwise `null`. Each comment includes:
 * - `comment_id`: Unique ID of the comment.
 * - `is_pinned`: Whether the comment is pinned by the creator.
 * - `comment`: The text content of the comment.
 * - `published_time`: The time the comment was published (e.g., "2 days ago").
 * - `author_is_channel_owner`: Whether the comment author is the channel owner.
 * - `creator_thumbnail_url`: URL to the comment author's thumbnail.
 * - `like_count`: Number of likes on the comment.
 * - `is_member`: Whether the author is a channel member.
 * - `author`: The author's name.
 * - `is_hearted`: Whether the comment is hearted by the creator.
 * - `is_liked`: Whether the comment is liked by the current user.
 * - `is_disliked`: Whether the comment is disliked by the current user.
 * - `reply_count`: Number of replies to the comment.
 * - `hasReplies`: Whether the comment has replies.
 * - `transcript`: An array of `VideoTranscriptType` objects if a transcript is found, otherwise `null`. Each transcript segment includes:
 * - `text`: The text of the segment.
 * - `start`: The start time of the segment in seconds.
 * - `duration`: The duration of the segment in seconds.
 * - `segments`: More granular `CaptionSegment` details including `utf8`, `tOffsetMs`, and `acAsrConf`.
 *
 * @throws {Error}
 * - If the `Query` is invalid or results in no response from the engine: `Error: @error: Unable to get response!`
 * - If metadata is not found in the engine's response: `Error: @error: Metadata not found in the response!`
 * - If the upload date cannot be parsed: `Error: @error: Failed to parse upload date: [error_message]`
 * - If argument validation fails due to invalid `options` (e.g., incorrect type or missing required fields): `Error: @error: Argument validation failed: [path.to.field]: [message]`
 * - For any other unexpected errors during the process: `Error: @error: An unexpected error occurred: [error_message]`
 */
export default async function Misc_Video_Extracted(options: z.infer<typeof ZodSchema>): Promise<PayloadType> {
    let Verbose = false;
    try {
        const parsedOptions = ZodSchema.parse(options);
        const { Query, UseTor, Verbose: parsedVerbose } = parsedOptions;
        Verbose = parsedVerbose ?? false;
        const metaBody: EngineOutput | null = await Tuber({ Query: Query, Verbose: Verbose, UseTor: UseTor });
        if (!metaBody) throw new Error(colors.red("@error: ") + " Unable to get response!");
        if (!metaBody.MetaData) throw new Error(colors.red("@error: ") + " Metadata not found in the response!");
        let uploadDate: Date | undefined;
        try {
            if (metaBody.MetaData.upload_date) uploadDate = new Date(metaBody.MetaData.upload_date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));
        } catch (error) {
            throw new Error(colors.red("@error: ") + " Failed to parse upload date: " + (error instanceof Error ? error.message : String(error)));
        }
        const currentDate = new Date();
        const daysAgo = uploadDate ? Math.floor((currentDate.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        const prettyDate = uploadDate?.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) || "N/A";
        const uploadAgoObject = calculateUploadAgo(daysAgo);
        const videoTimeInSeconds = metaBody.MetaData.duration;
        const videoDuration = calculateVideoDuration(videoTimeInSeconds ?? 0);
        const viewCountFormatted = metaBody.MetaData.view_count !== undefined ? formatCount(metaBody.MetaData.view_count) : "N/A";
        const likeCountFormatted = metaBody.MetaData.like_count !== undefined ? formatCount(metaBody.MetaData.like_count) : "N/A";
        const channelFollowerCountFormatted = metaBody.MetaData.channel_follower_count !== undefined ? formatCount(metaBody.MetaData.channel_follower_count || 0) : "N/A";
        const commentsPromise = fetchCommentsByVideoId(metaBody.MetaData.videoId || "", Verbose ?? false);
        const transcriptPromise = fetchVideoTranscript(metaBody.MetaData.videoId || "", Verbose ?? false);
        const [comments, transcript] = await Promise.all([commentsPromise, transcriptPromise]);
        const commentCountFormatted = comments !== null ? formatCount(comments.length) : "N/A";
        const payload: PayloadType = {
            MetaData: {
                ...metaBody.MetaData,
                upload_date: prettyDate,
                upload_ago: uploadAgoObject.days,
                duration: videoDuration.seconds ?? 0,
                upload_ago_formatted: uploadAgoObject,
                like_count_formatted: likeCountFormatted,
                view_count_formatted: viewCountFormatted,
                comment_count_formatted: commentCountFormatted,
                channel_follower_count_formatted: channelFollowerCountFormatted ?? "0",
                channel_follower_count: metaBody.MetaData.channel_follower_count !== null ? metaBody.MetaData.channel_follower_count : undefined,
            },
            AudioOnly: metaBody.AudioOnly,
            VideoOnly: metaBody.VideoOnly,
            Thumbnails: metaBody.Thumbnails,
            Heatmap: metaBody.Heatmap,
            Chapters: metaBody.Chapters,
            Subtitle: metaBody.Subtitle,
            Captions: metaBody.Captions,
            comments,
            transcript,
        };
        return payload;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(colors.red("@error: ") + " Argument validation failed: " + error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", "));
        else if (error instanceof Error) throw error;
        else throw new Error(colors.red("@error: ") + " An unexpected error occurred: " + String(error));
    } finally {
        if (Verbose) console.log(colors.green("@info: ") + "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
