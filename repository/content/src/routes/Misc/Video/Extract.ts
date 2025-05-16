import path from "path";
import colors from "colors";
import { Client } from "youtubei"; // Assuming 'youtubei' is used for fetching transcripts
import { z, ZodError } from "zod";
import { CommentType } from "./Comments"; // Assuming CommentType is imported
import Tuber from "../../../utils/Agent"; // Assuming Tuber is refactored and returns Promise<EngineOutput | null> or throws
// import { EventEmitter } from "events"; // Remove EventEmitter import as we are refactoring to async/await
import { Innertube, UniversalCache } from "youtubei.js"; // Assuming 'youtubei.js' is used for fetching comments
import { EngineOutput } from "../../../utils/Engine";

// Define internal types based on the original code's usage
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

// Define the Zod schema for input validation
const ZodSchema = z.object({ query: z.string().min(2), useTor: z.boolean().optional(), verbose: z.boolean().optional() });

// Synchronous utility functions (can remain as they are)
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
function formatCount(count: number): string {
    // Added return type string
    // Ensure count is a number before formatting
    if (typeof count !== "number" || isNaN(count)) {
        return "N/A"; // Or throw an error, depending on desired behavior for invalid input
    }
    const abbreviations = ["", "K", "M", "B", "T"]; // Added "" for counts less than 1000
    let i = 0;
    // Find the appropriate abbreviation level
    while (count >= 1000 && i < abbreviations.length - 1) {
        count /= 1000;
        i++;
    }
    // Format to one decimal place if not a whole number
    const formattedCount = parseFloat(count.toFixed(1));

    return `${formattedCount}${abbreviations[i]}`;
}

// Helper function to fetch comments by video ID
// Refactored to return Promise<CommentType[] | null> and handle its own logging
async function fetchCommentsByVideoIdHelper(videoId: string, verbose: boolean): Promise<CommentType[] | null> {
    try {
        if (verbose) console.log(colors.green("@info:"), `Workspaceing comments for video ID: ${videoId}`);

        // Use youtubei.js Innertube for fetching comments
        // Assuming Innertube.create returns a Promise<Innertube instance>
        // Assuming Innertube instance has a getComments method that returns a Promise<Response>
        // where Response has a contents array of comment threads, and each thread has a comment property
        const youtubeInnertube = await Innertube.create({
            user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", // Hardcoded user agent from original
            cache: new UniversalCache(true, path.join(process.cwd(), "YouTubeDLX")), // Cache configuration from original
        });

        // Fetch comments for the video ID
        const response = await youtubeInnertube.getComments(videoId); // Assuming videoId is valid

        // Map the fetched comments to the CommentType interface and filter out invalid ones
        const comments: CommentType[] = response.contents
            .map((thread: any) => {
                // Assuming 'thread' structure from youtubei.js response
                const comment = thread?.comment; // Use optional chaining

                // Check for essential comment properties before mapping
                if (!comment || !comment.content?.text || !comment.published_time || !comment.author?.name) {
                    return null; // Skip comments that lack required fields
                }

                return {
                    comment_id: comment.comment_id || "", // Default to empty string if missing
                    is_pinned: comment.is_pinned || false, // Default to false if missing
                    comment: comment.content.text,
                    published_time: comment.published_time,
                    author_is_channel_owner: comment.author_is_channel_owner || false, // Default to false
                    creator_thumbnail_url: comment.creator_thumbnail_url || "", // Default to empty string
                    like_count: comment.like_count || 0, // Default to 0 if missing
                    is_member: comment.is_member || false, // Default to false
                    author: comment.author.name,
                    is_hearted: comment.is_hearted || false, // Default to false
                    is_liked: comment.is_liked || false, // Default to false
                    is_disliked: comment.is_disliked || false, // Default to false
                    reply_count: comment.reply_count || 0, // Default to 0
                    hasReplies: thread.has_replies || false, // Default to false
                } as CommentType; // Explicitly cast to CommentType
            })
            .filter((item): item is CommentType => item !== null); // Filter out any null values resulting from mapping failures

        if (comments.length === 0) {
            if (verbose) console.log(colors.red("@info:"), "No comments found for the video.");
            // Return null if no comments are found after filtering
            return null;
        }

        if (verbose) console.log(colors.green("@info:"), "Video comments fetched!");
        return comments; // Return the array of comments
    } catch (error: any) {
        // Catch any errors during comment fetching
        if (verbose) console.error(`${colors.red("@error: ")} Failed to fetch comments: ${error.message}`);
        // Return null on failure, allowing the main function to proceed
        return null;
    }
}

// Helper function to fetch video transcript
// Refactored to return Promise<VideoTranscriptType[] | null> and handle its own logging
async function fetchVideoTranscriptHelper(videoId: string, verbose: boolean): Promise<VideoTranscriptType[] | null> {
    try {
        if (verbose) console.log(colors.green("@info:"), `Workspaceing transcript for video ID: ${videoId}`);

        // Use youtubei Client for fetching transcripts
        const youtube = new Client(); // Assuming Client constructor is synchronous
        // Assuming youtube.getVideoTranscript returns a Promise<Caption[] | null>
        const captions = await youtube.getVideoTranscript(videoId); // Assuming videoId is valid

        if (!captions) {
            if (verbose) console.log(colors.red("@info:"), "No transcript found for the video.");
            // Return null if no transcript is found
            return null;
        }

        // Map the captions to the desired VideoTranscriptType structure
        const transcript: VideoTranscriptType[] = captions.map(caption => ({
            text: caption.text,
            start: caption.start, // Assuming property name is start
            duration: caption.duration, // Assuming property name is duration
            segments: caption.segments.map((segment: any) => ({
                // Assuming segments is an array of objects
                utf8: segment.utf8,
                tOffsetMs: segment.tOffsetMs, // Optional property
                acAsrConf: segment.acAsrConf,
            })),
        }));

        if (verbose) console.log(colors.green("@info:"), "Video transcript fetched!");
        return transcript; // Return the array of transcript entries
    } catch (error: any) {
        // Catch any errors during transcript fetching
        if (verbose) console.error(`${colors.red("@error: ")} Failed to fetch transcript: ${error.message}`);
        // Return null on failure, allowing the main function to proceed
        return null;
    }
}

// Define the interface for the comprehensive video extraction result
export interface VideoExtractionResult {
    BestAudioLow: EngineOutput["BestAudioLow"];
    BestAudioHigh: EngineOutput["BestAudioHigh"];
    BestVideoLow: EngineOutput["BestVideoLow"];
    BestVideoHigh: EngineOutput["BestVideoHigh"];
    AudioLowDRC: EngineOutput["AudioLowDRC"];
    AudioHighDRC: EngineOutput["AudioHighDRC"];
    AudioLow: EngineOutput["AudioLow"];
    AudioHigh: EngineOutput["AudioHigh"];
    VideoLowHDR: EngineOutput["VideoLowHDR"];
    VideoHighHDR: EngineOutput["VideoHighHDR"];
    VideoLow: EngineOutput["VideoLow"];
    VideoHigh: EngineOutput["VideoHigh"];
    ManifestLow: EngineOutput["ManifestLow"];
    ManifestHigh: EngineOutput["ManifestHigh"];
    meta_data: {
        id: EngineOutput["metaData"]["id"];
        original_url: EngineOutput["metaData"]["original_url"];
        webpage_url: EngineOutput["metaData"]["webpage_url"];
        title: EngineOutput["metaData"]["title"];
        view_count: EngineOutput["metaData"]["view_count"];
        like_count: EngineOutput["metaData"]["like_count"];
        view_count_formatted: string; // Formatted string from helper
        like_count_formatted: string; // Formatted string from helper
        uploader: EngineOutput["metaData"]["uploader"];
        uploader_id: EngineOutput["metaData"]["uploader_id"];
        uploader_url: EngineOutput["metaData"]["uploader_url"];
        thumbnail: EngineOutput["metaData"]["thumbnail"];
        categories: EngineOutput["metaData"]["categories"];
        time: EngineOutput["metaData"]["duration"]; // Raw duration in seconds
        duration: ReturnType<typeof calculateVideoDuration>; // Structured duration from helper
        age_limit: EngineOutput["metaData"]["age_limit"];
        live_status: EngineOutput["metaData"]["live_status"];
        description: EngineOutput["metaData"]["description"];
        full_description: EngineOutput["metaData"]["description"]; // Alias?
        upload_date: string; // Formatted date string from localeDateString
        upload_ago: number; // Days ago number
        upload_ago_formatted: ReturnType<typeof calculateUploadAgo>; // Structured time ago from helper
        comment_count: EngineOutput["metaData"]["comment_count"];
        comment_count_formatted: string; // Formatted string from helper
        channel_id: EngineOutput["metaData"]["channel_id"];
        channel_name: EngineOutput["metaData"]["channel"]; // Assuming channel name property is 'channel'
        channel_url: EngineOutput["metaData"]["channel_url"];
        channel_follower_count: EngineOutput["metaData"]["channel_follower_count"];
        channel_follower_count_formatted: string; // Formatted string from helper
    };
    comments: CommentType[] | null; // Can be null if fetching fails or no comments
    transcript: VideoTranscriptType[] | null; // Can be null if fetching fails or no transcript
}

/**
 * @shortdesc Extracts comprehensive information about a YouTube video using async/await instead of events.
 *
 * @description This function extracts detailed data for a given YouTube video using async/await, including its metadata, available audio and video formats, comments, and transcript. It uses multiple internal tools to gather this information based on a search query or video URL. Optional parameters allow for using Tor and enabling verbose logging.
 *
 * The function requires a search query or video URL and returns a Promise that resolves with a comprehensive object containing all extracted data upon success, or rejects with a critical error. Failures in fetching comments or the transcript will result in those fields being `null` in the resolved object, rather than rejecting the entire promise.
 *
 * @param options - An object containing the configuration options validated by ZodSchema.
 * @param {string} options.query - The search query or video URL. **Required**, minimum length is 2 characters.
 * @param {boolean} [options.useTor=false] - Whether to use Tor for certain requests (by the internal Tuber agent).
 * @param {boolean} [options.verbose=false] - Enable verbose logging throughout the extraction process.
 *
 * @returns {Promise<VideoExtractionResult>} A Promise that resolves with a comprehensive object containing video details, formats, comments (if available), and transcript (if available).
 * @throws {Error} Throws a formatted error if argument validation fails (ZodError), if the initial metadata/format retrieval fails, or if critical processing errors occur. Errors fetching comments or the transcript will be logged (if verbose) and result in those fields being `null` in the returned object.
 */
export default async function extract(options: z.infer<typeof ZodSchema>): Promise<VideoExtractionResult> {
    // Refactored to use async/await and return a Promise directly, replacing EventEmitter pattern.
    try {
        // Perform Zod schema validation on the provided options. This call is synchronous.
        // It will throw a ZodError if validation fails based on the defined schema.
        const { query, useTor, verbose } = ZodSchema.parse(options);

        // Await the asynchronous call to Tuber (Agent) to get initial metadata and formats.
        // Assuming Tuber returns Promise<EngineOutput | null> or throws.
        const metaBody: EngineOutput | null = await Tuber({ query, verbose, useTor });

        // Check if Tuber returned data.
        if (!metaBody) {
            // If Tuber returned null, throw a critical error.
            throw new Error(`${colors.red("@error:")} Unable to get initial response from the engine!`);
        }

        // Check if essential metadata is present in the response.
        if (!metaBody.metaData) {
            // If metadata is missing, throw a critical error.
            throw new Error(`${colors.red("@error:")} Metadata not found in the response!`);
        }

        // --- Process Metadata ---
        let uploadDate: Date | undefined;
        try {
            // Attempt to parse the upload date string into a Date object.
            if (metaBody.metaData.upload_date) {
                // Format 'YYYYMMDD' to 'YYYY-MM-DD' for correct Date parsing.
                uploadDate = new Date(metaBody.metaData.upload_date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));
                // Check if the parsed date is valid
                if (isNaN(uploadDate.getTime())) {
                    // If parsing results in an invalid date, treat it as undefined and log if verbose.
                    if (verbose) console.log(colors.red("@error:"), `Failed to parse upload date string: ${metaBody.metaData.upload_date}`);
                    uploadDate = undefined; // Set to undefined if invalid
                }
            }
        } catch (error: any) {
            // Catch any errors during date parsing. Log if verbose, but continue execution.
            if (verbose) console.log(colors.red("@error:"), `Error parsing upload date: ${error.message}`);
            uploadDate = undefined; // Ensure uploadDate is undefined on error
        }

        const currentDate = new Date();
        // Calculate days ago, defaulting to 0 if uploadDate is undefined or invalid.
        const daysAgo = uploadDate ? Math.floor((currentDate.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        // Format the upload date string, defaulting to "N/A" if uploadDate is undefined or invalid.
        const prettyDate = uploadDate?.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) || "N/A";

        // Use utility functions for calculated/formatted metadata
        const uploadAgoObject = calculateUploadAgo(daysAgo);
        const videoTimeInSeconds = metaBody.metaData.duration; // Assuming duration is in seconds
        const videoDuration = calculateVideoDuration(videoTimeInSeconds);
        // Use formatCount for counts, handling potential undefined or null values from metaData
        const viewCountFormatted = metaBody.metaData.view_count !== undefined && metaBody.metaData.view_count !== null ? formatCount(metaBody.metaData.view_count) : "N/A";
        const likeCountFormatted = metaBody.metaData.like_count !== undefined && metaBody.metaData.like_count !== null ? formatCount(metaBody.metaData.like_count) : "N/A";
        const commentCountFormatted = metaBody.metaData.comment_count !== undefined && metaBody.metaData.comment_count !== null ? formatCount(metaBody.metaData.comment_count) : "N/A";
        const channelFollowerCountFormatted =
            metaBody.metaData.channel_follower_count !== undefined && metaBody.metaData.channel_follower_count !== null ? formatCount(metaBody.metaData.channel_follower_count) : "N/A";

        // --- Fetch Comments and Transcript in Parallel ---
        // Use Promise.all to fetch comments and transcript concurrently.
        // Wrap each helper call in an immediately invoked async function with its own try/catch
        // so that a failure in one does not prevent the other from finishing,
        // and the main promise only rejects on critical errors.
        const commentsPromise = (async () => {
            try {
                // Call the refactored helper function for comments.
                return await fetchCommentsByVideoIdHelper(metaBody.metaData.id, verbose ?? false);
            } catch (error: any) {
                // Log the error if verbose, but return null to indicate failure for this specific part.
                if (verbose) console.error(`${colors.red("@error: ")} Failed to fetch comments: ${error.message}`);
                return null;
            }
        })();

        const transcriptPromise = (async () => {
            try {
                // Call the refactored helper function for transcript.
                return await fetchVideoTranscriptHelper(metaBody.metaData.id, verbose ?? false);
            } catch (error: any) {
                // Log the error if verbose, but return null to indicate failure for this specific part.
                if (verbose) console.error(`${colors.red("@error: ")} Failed to fetch transcript: ${error.message}`);
                return null;
            }
        })();

        // Await both promises. This array will contain the results (CommentType[] | null, VideoTranscriptType[] | null).
        const [comments, transcript] = await Promise.all([commentsPromise, transcriptPromise]);

        // --- Construct Final Payload ---
        const payload: VideoExtractionResult = {
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
                thumbnail: metaBody.metaData.thumbnail, // Assuming this is a string URL
                categories: metaBody.metaData.categories, // Assuming array of strings
                time: videoTimeInSeconds,
                duration: videoDuration, // Object { hours, minutes, seconds, formatted }
                age_limit: metaBody.metaData.age_limit,
                live_status: metaBody.metaData.live_status,
                description: metaBody.metaData.description,
                full_description: metaBody.metaData.description, // Seems to be an alias
                upload_date: prettyDate, // Formatted string
                upload_ago: daysAgo, // Number of days
                upload_ago_formatted: uploadAgoObject, // Object { years, months, days, formatted }
                comment_count: metaBody.metaData.comment_count,
                comment_count_formatted: commentCountFormatted,
                channel_id: metaBody.metaData.channel_id,
                channel_name: metaBody.metaData.channel,
                channel_url: metaBody.metaData.channel_url,
                channel_follower_count: metaBody.metaData.channel_follower_count,
                channel_follower_count_formatted: channelFollowerCountFormatted,
            },
            comments: comments, // Will be CommentType[] or null
            transcript: transcript, // Will be VideoTranscriptType[] or null
        };

        // If successful, return the comprehensive payload. The async function automatically wraps this in a resolved Promise.
        return payload;
    } catch (error: any) {
        // Catch any critical errors that occurred during the process (Zod validation, Tuber failure, critical metadata issues).
        // Errors from comment/transcript fetching are caught within their respective helper wrappers and result in nulls.
        // Format the error message based on the error type and re-throw it to reject the main function's Promise.
        if (error instanceof ZodError) {
            // Handle Zod validation errors by formatting the error details.
            throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        } else if (error instanceof Error) {
            // Re-throw standard Error objects with their existing message.
            throw new Error(`${colors.red("@error:")} ${error.message}`);
        } else {
            // Handle any other unexpected error types by converting them to a string.
            throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
        }
    } finally {
        // This block executes after the try block successfully returns or the catch block throws.
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
