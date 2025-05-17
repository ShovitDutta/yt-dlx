import path from "path";
import colors from "colors";
import { Client } from "youtubei";
import { z, ZodError } from "zod";
import Tuber from "../../../utils/Agent";
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
            segments: caption.segments.map(segment => ({ utf8: segment.utf8, tOffsetMs: segment.tOffsetMs, acAsrConf: segment.acAsrConf })),
        }));
        if (verbose) console.log(colors.green("@info:"), "Video transcript fetched!");
        return transcript;
    } catch (error: any) {
        if (verbose) console.error(colors.red("@error: ") + error.message);
        return null;
    }
}
export default async function extract(options: z.infer<typeof ZodSchema>): Promise<{ data: any }> {
    try {
        const { query, useTor, verbose } = ZodSchema.parse(options);
        const metaBody: EngineOutput = await Tuber({ query, verbose, useTor });
        if (!metaBody) {
            throw new Error(`${colors.red("@error:")} Unable to get response!`);
        }
        if (!metaBody.metaData) {
            throw new Error(`${colors.red("@error:")} Metadata not found in the response!`);
        }
        let uploadDate: Date | undefined;
        try {
            if (metaBody.metaData.upload_date) {
                uploadDate = new Date(metaBody.metaData.upload_date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));
            }
        } catch (error) {
            throw new Error(`${colors.red("@error:")} Failed to parse upload date: ${error instanceof Error ? error.message : String(error)}`);
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
            BestAudioLow: metaBody.BestAudioLow,
            BestAudioHigh: metaBody.BestAudioHigh,
            BestVideoLow: metaBody.BestVideoLow,
            BestVideoHigh: metaBody.BestVideoHigh,
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
        return { data: payload };
    } catch (error: any) {
        if (error instanceof ZodError) {
            const errorMessage = `${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        } else if (error instanceof Error) {
            console.error(error.message);
            throw error;
        } else {
            const unexpectedError = `${colors.red("@error:")} An unexpected error occurred: ${String(error)}`;
            console.error(unexpectedError);
            throw new Error(unexpectedError);
        }
    } finally {
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
(async () => {
    const query = "your search query or url";
    try {
        console.log("--- Running Basic Video Extract ---");
        const result = await extract({ query });
        console.log("Video Data:", result.data);
    } catch (error) {
        console.error("Basic Video Extract Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Video Extract with Verbose Logging ---");
        const result = await extract({ query, verbose: true });
        console.log("Video Data (Verbose):", result.data);
    } catch (error) {
        console.error("Video Extract with Verbose Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Video Extract with Tor ---");
        const result = await extract({ query, useTor: true });
        console.log("Video Data (with Tor):", result.data);
    } catch (error) {
        console.error("Video Extract with Tor Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Video Extract with Verbose and Tor ---");
        const result = await extract({ query, verbose: true, useTor: true });
        console.log("Video Data (Verbose, with Tor):", result.data);
    } catch (error) {
        console.error("Video Extract with Verbose and Tor Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Missing Query Error ---");
        await extract({} as any);
        console.log("This should not be reached - Missing Query Error.");
    } catch (error) {
        console.error("Expected Error (Missing Query):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running No Engine Data Error ---");
        await extract({ query: "a query that should return no results 12345abcde" });
        console.log("This should not be reached - No Engine Data Error.");
    } catch (error) {
        console.error("Expected Error (No Engine Data):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Video with No Comments ---");
        const result = await extract({ query: "a video where comments are disabled" });
        console.log("Video Data (Comments Null):", result.data.comments === null);
    } catch (error) {
        console.error("Video with No Comments Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Video with No Transcript ---");
        const result = await extract({ query: "a video with no transcript" });
        console.log("Video Data (Transcript Null):", result.data.transcript === null);
    } catch (error) {
        console.error("Video with No Transcript Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
