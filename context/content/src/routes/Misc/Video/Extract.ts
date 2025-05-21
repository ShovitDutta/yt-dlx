import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import Tuber from "../../../utils/Agent";
import type { AudioFormat } from "../../../interfaces/AudioFormat";
import type { VideoFormat } from "../../../interfaces/VideoFormat";
import type { ManifestFormat } from "../../../interfaces/ManifestFormat";
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
interface VideoInfo {
    id: string;
    original_url?: string;
    webpage_url?: string;
    title?: string;
    view_count?: number;
    like_count?: number;
    uploader?: string;
    uploader_id?: string;
    uploader_url?: string;
    thumbnail?: string;
    categories?: string[];
    duration: number;
    age_limit?: number;
    live_status?: string;
    description?: string;
    upload_date?: string;
    comment_count?: number;
    channel_id?: string;
    channel_name?: string;
    channel_url?: string;
    channel_follower_count?: number;
    view_count_formatted: string;
    like_count_formatted: string;
    upload_ago: number;
    upload_ago_formatted: UploadAgo;
    comment_count_formatted: string;
    channel_follower_count_formatted: string;
}
interface PayloadType {
    MetaData: VideoInfo;
    AvailableFormats: { Audio: AudioFormat[]; Video: VideoFormat[]; Manifest: ManifestFormat[] };
    Audio: {
        SingleQuality: { Lowest: AudioFormat; Highest: AudioFormat };
        MultipleQuality: { Lowest: AudioFormat[]; Highest: AudioFormat[] };
        HasDRC: { Lowest?: AudioFormat[]; Highest?: AudioFormat[] };
    };
    Video: {
        SingleQuality: { Lowest: VideoFormat; Highest: VideoFormat };
        MultipleQuality: { Lowest: VideoFormat[]; Highest: VideoFormat[] };
        HasHDR: { Lowest?: VideoFormat[]; Highest?: VideoFormat[] };
    };
    Manifest: { SingleQuality: { Lowest: ManifestFormat; Highest: ManifestFormat }; MultipleQuality: { Lowest: ManifestFormat[]; Highest: ManifestFormat[] } };
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
export default async function extract(options: z.infer<typeof ZodSchema>): Promise<{ data: PayloadType }> {
    let verbose = false;
    try {
        const parsedOptions = ZodSchema.parse(options);
        const { query, useTor, verbose: parsedVerbose } = parsedOptions;
        verbose = parsedVerbose ?? false;
        const metaBody = await Tuber({ query, verbose, useTor });
        if (!metaBody) {
            throw new Error(`${colors.red("@error:")} Unable to get response!`);
        }
        if (!metaBody.MetaData) {
            throw new Error(`${colors.red("@error:")} Metadata not found in the response!`);
        }
        let uploadDate: Date | undefined;
        try {
            if (metaBody.MetaData.upload_date) {
                uploadDate = new Date(metaBody.MetaData.upload_date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));
            }
        } catch (error) {
            throw new Error(`${colors.red("@error:")} Failed to parse upload date: ${error instanceof Error ? error.message : String(error)}`);
        }
        const currentDate = new Date();
        const daysAgo = uploadDate ? Math.floor((currentDate.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        const prettyDate = uploadDate?.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) || "N/A";
        const uploadAgoObject = calculateUploadAgo(daysAgo);
        const videoTimeInSeconds = metaBody.MetaData.duration;
        const videoDuration = calculateVideoDuration(videoTimeInSeconds);
        const viewCountFormatted = metaBody.MetaData.view_count !== undefined ? formatCount(metaBody.MetaData.view_count) : "N/A";
        const likeCountFormatted = metaBody.MetaData.like_count !== undefined ? formatCount(metaBody.MetaData.like_count) : "N/A";
        const commentCountFormatted = metaBody.MetaData.comment_count !== undefined ? formatCount(metaBody.MetaData.comment_count) : "N/A";
        const channelFollowerCountFormatted = metaBody.MetaData.channel_follower_count !== undefined ? formatCount(metaBody.MetaData.channel_follower_count || 0) : "N/A";
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
            AvailableFormats: { Audio: metaBody.AvailableFormats.Audio, Video: metaBody.AvailableFormats.Video, Manifest: metaBody.AvailableFormats.Manifest },
            Audio: {
                SingleQuality: { Lowest: metaBody.Audio.SingleQuality.Lowest, Highest: metaBody.Audio.SingleQuality.Highest },
                MultipleQuality: { Lowest: metaBody.AvailableFormats.Audio, Highest: metaBody.AvailableFormats.Audio },
                HasDRC: { Lowest: metaBody.Audio.HasDRC.Lowest, Highest: metaBody.Audio.HasDRC.Highest },
            },
            Video: {
                SingleQuality: { Lowest: metaBody.Video.SingleQuality.Lowest, Highest: metaBody.Video.SingleQuality.Highest },
                MultipleQuality: { Lowest: metaBody.AvailableFormats.Video, Highest: metaBody.AvailableFormats.Video },
                HasHDR: { Lowest: metaBody.Video.HasHDR.Lowest, Highest: metaBody.Video.HasHDR.Highest },
            },
            Manifest: {
                SingleQuality: { Lowest: metaBody.Manifest.SingleQuality.Lowest, Highest: metaBody.Manifest.SingleQuality.Highest },
                MultipleQuality: { Lowest: metaBody.AvailableFormats.Manifest, Highest: metaBody.AvailableFormats.Manifest },
            },
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
        if (verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
