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
interface BaseEngineMetaData {
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
}
interface MetadataPayload extends Omit<BaseEngineMetaData, "duration"> {
    view_count_formatted: string;
    like_count_formatted: string;
    duration: number;
    upload_date: string;
    upload_ago: number;
    upload_ago_formatted: UploadAgo;
    comment_count_formatted: string;
    channel_follower_count_formatted: string;
}
interface PayloadType {
    BestAudioLow?: any;
    BestAudioHigh?: any;
    BestVideoLow?: any;
    BestVideoHigh?: any;
    AudioLowDRC?: any;
    AudioHighDRC?: any;
    AudioLow?: any;
    AudioHigh?: any;
    VideoLowHDR?: any;
    VideoHighHDR?: any;
    VideoLow?: any;
    VideoHigh?: any;
    ManifestLow?: any;
    ManifestHigh?: any;
    meta_data: MetadataPayload;
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
async function fetchCommentsByVideoId(videoId: string, verbose: boolean): Promise<CommentType[] | null> {
    try {
        if (verbose) console.log(colors.green("@info:"), `Workspaceing comments for video ID: ${videoId}`);
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
        if (verbose) console.log(colors.green("@info:"), `Workspaceing transcript for video ID: ${videoId}`);
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
/**
 * @shortdesc Extracts comprehensive data (metadata, comments, transcript) for a YouTube video based on a query or URL.
 *
 * @description This function provides a comprehensive extraction of information for a YouTube video.
 * It searches for a video based on a provided query or URL using an internal engine (`Tuber`),
 * fetches detailed metadata, available audio/video format data, comments, and the video transcript.
 * The fetched data is processed and formatted for easier use.
 *
 * It requires a valid search query or URL to identify the YouTube video.
 * The function leverages internal utilities (`Tuber`, `youtubei.js` via helper functions) to perform the data retrieval.
 *
 * The function supports the following configuration options:
 * - **Query:** A string representing the Youtube query or video URL. Must be at least 2 characters long. **Required**.
 * - **UseTor:** An optional boolean flag to route requests through Tor via the internal engine. Defaults to `false`.
 * - **Verbose:** An optional boolean value that, if true, enables detailed console logging during the process, including messages from the internal engine and helper functions. Defaults to `false`.
 *
 * The function returns a Promise that resolves with an object containing the extracted data under a `data` property.
 * The `data` property is a `PayloadType` object which includes:
 * - `meta_data`: Formatted metadata about the video (title, uploader, view count, like count, duration, upload date/ago, etc.). Counts and duration are provided in raw numbers and formatted strings.
 * - Various audio and video format data objects (`BestAudioLow`, `BestAudioHigh`, etc.) as returned by the internal engine.
 * - `comments`: An array of `CommentType` objects representing the video comments, or `null` if no comments are found or could be fetched.
 * - `transcript`: An array of `VideoTranscriptType` objects representing the video transcript, or `null` if no transcript is found or could be fetched.
 *
 * Helper functions are used internally to format counts, duration, upload date, and fetch comments and transcript. Errors during comment or transcript fetching within the helper functions are caught and result in `null` for those properties in the returned payload, rather than throwing an error from the main `extract` function.
 *
 * @param {object} options - The configuration options for the data extraction.
 * @param {string} options.query - The Youtube query or video URL (minimum 2 characters). **Required**.
 * @param {boolean} [options.useTor=false] - Use Tor for requests via the internal engine.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 *
 * @returns {Promise<{ data: PayloadType }>} A Promise that resolves with an object containing the extracted data (`meta_data`, format data, `comments`, `transcript`) under the `data` property.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing required `query`, `query` is less than 2 characters).
 * - Throws an `Error` if the internal engine (`Tuber`) fails to retrieve a response or returns no metadata for the given query.
 * - Throws an `Error` if parsing the upload date from the metadata fails.
 * - Throws a generic `Error` for any other unexpected issues during the main extraction process.
 *
 * @example
 * // 1. Running Basic Video Data Extract Example
 * try {
 * const result = await extract({ query: "a popular video" });
 * console.log("Extracted Data:", result.data);
 * console.log("Metadata:", result.data.meta_data);
 * console.log("Comments:", result.data.comments); // May be null or an array
 * console.log("Transcript:", result.data.transcript); // May be null or an array
 * } catch (error) {
 * console.error("Basic Extract Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Video Data Extract with Verbose Logging Example
 * try {
 * const result = await extract({ query: "another video query", verbose: true });
 * console.log("Extracted Data:", result.data);
 * } catch (error) {
 * console.error("Verbose Extract Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Video Data Extract with Use Tor Example
 * // Note: Requires Tor service to be running and accessible.
 * try {
 * const result = await extract({ query: "video query with tor", useTor: true });
 * console.log("Extracted Data (with Tor):", result.data);
 * } catch (error) {
 * console.error("Extract with Tor Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Video Data Extract with Verbose Logging and Use Tor Example
 * try {
 * const result = await extract({ query: "full options query", verbose: true, useTor: true });
 * console.log("Extracted Data (Verbose, with Tor):", result.data);
 * } catch (error) {
 * console.error("Extract with Verbose and Tor Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Running Zod Validation Error Example (Missing Query - will throw ZodError)
 * try {
 * await extract({} as any); // Using 'as any' to simulate missing required parameter
 * console.log("This should not be reached - Missing Query Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Missing Query):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Running Zod Validation Error Example (Short Query - will throw ZodError)
 * try {
 * await extract({ query: "a" }); // Query is less than minimum length (2)
 * console.log("This should not be reached - Short Query Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Query Too Short):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 7. Example of Engine Failure (Unable to get response or metadata)
 * // Use a query very unlikely to return any valid data.
 * try {
 * await extract({ query: "a query that should return no results 12345abcde" });
 * console.log("This should not be reached - Engine Failure Example.");
 * } catch (error) {
 * console.error("Expected Error (Engine Failure):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 8. Example where Comments might be null
 * // Use a query for a video known to exist but have comments disabled or no comments posted.
 * // The function will not throw an error, but the `comments` property in the result will be null.
 * // try {
 * //    const result = await extract({ query: "a video where comments are disabled" });
 * //    console.log("Comments are:", result.data.comments); // Expected to be null
 * // } catch (error) {
 * //    console.error("Error during extract (unexpectedly):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 9. Example where Transcript might be null
 * // Use a query for a video known to exist but have no transcript available.
 * // The function will not throw an error, but the `transcript` property in the result will be null.
 * // try {
 * //    const result = await extract({ query: "a video with no transcript" });
 * //    console.log("Transcript is:", result.data.transcript); // Expected to be null
 * // } catch (error) {
 * //    console.error("Error during extract (unexpectedly):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 10. Example of Failed to Parse Upload Date (Highly unlikely with standard YouTube data)
 * // This scenario would only occur if the internal engine returns upload date in an unexpected format.
 * // try {
 * //    // Simulate an engine response with a bad upload date format
 * //    await extract({ query: "query leading to bad date format" });
 * // } catch (error) {
 * //    console.error("Expected Error (Failed to Parse Upload Date):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 11. Example of an Unexpected Error during the main process
 * // This is difficult to trigger predictably via simple example.
 * // try {
 * //    // Use a query or options that might cause an issue in the main logic outside of helper calls
 * //    await extract({ query: "query causing unexpected error" });
 * // } catch (error) {
 * //    console.error("Expected Unexpected Error:", error instanceof Error ? error.message : error);
 * // }
 */
export default async function extract(options: z.infer<typeof ZodSchema>): Promise<{ data: PayloadType }> {
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
        const payload: PayloadType = {
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
                ...metaBody.metaData,
                view_count_formatted: viewCountFormatted,
                like_count_formatted: likeCountFormatted,
                duration: videoDuration.seconds,
                upload_date: prettyDate,
                upload_ago: daysAgo,
                upload_ago_formatted: uploadAgoObject,
                comment_count_formatted: commentCountFormatted,
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
