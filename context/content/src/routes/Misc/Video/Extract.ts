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
        if (Verbose) console.log(colors.green("@info:") + `Workspaceing comments for video ID: ${VideoId}`);
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
            if (Verbose) console.log(colors.red("@error:") + `No comments found for the video`);
            return null;
        }
        if (Verbose) console.log(colors.green("@info:") + `Video comments fetched!`);
        return comments;
    } catch (error: any) {
        if (Verbose) console.error(colors.red("@error: ") + `${error.message}`);
        return null;
    }
}
async function fetchVideoTranscript(VideoId: string, Verbose: boolean): Promise<VideoTranscriptType[] | null> {
    try {
        if (Verbose) console.log(colors.green("@info:") + `Working on transcript for video ID: ${VideoId}`);
        const youtube = new Client();
        const captions = await youtube.getVideoTranscript(VideoId);
        if (!captions) {
            if (Verbose) console.log(colors.red("@error:") + `No transcript found for the video`);
            return null;
        }
        const transcript = captions.map(caption => ({
            text: caption.text,
            start: caption.start,
            duration: caption.duration,
            segments: caption.segments.map(segment => ({ utf8: segment.utf8, tOffsetMs: segment.tOffsetMs, acAsrConf: segment.acAsrConf })),
        }));
        if (Verbose) console.log(colors.green("@info:") + `Video transcript fetched!`);
        return transcript;
    } catch (error: any) {
        if (Verbose) console.error(colors.red("@error: ") + `${error.message}`);
        return null;
    }
}
export default async function extract(options: z.infer<typeof ZodSchema>): Promise<PayloadType> {
    let Verbose = false;
    try {
        const parsedOptions = ZodSchema.parse(options);
        const { Query, UseTor, Verbose: parsedVerbose } = parsedOptions;
        Verbose = parsedVerbose ?? false;
        const metaBody: EngineOutput | null = await Tuber({ Query: Query, Verbose: Verbose, UseTor: UseTor });
        if (!metaBody) throw new Error(colors.red("@error:") + ` Unable to get response!`);
        if (!metaBody.MetaData) throw new Error(colors.red("@error:") + ` Metadata not found in the response!`);
        let uploadDate: Date | undefined;
        try {
            if (metaBody.MetaData.upload_date) uploadDate = new Date(metaBody.MetaData.upload_date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));
        } catch (error) {
            throw new Error(colors.red("@error:") + ` Failed to parse upload date: ${error instanceof Error ? error.message : String(error)}`);
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
        if (error instanceof ZodError) throw new Error(colors.red("@error:") + ` Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw error;
        else throw new Error(colors.red("@error:") + ` An unexpected error occurred: ${String(error)}`);
    } finally {
        if (Verbose) console.log(colors.green("@info:") + `❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.`);
    }
}
