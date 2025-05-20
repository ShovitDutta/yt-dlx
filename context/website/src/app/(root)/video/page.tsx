"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import YouTube from "react-youtube";
interface Format {
    asr: number | null;
    filesize: number | null;
    filesizeP: string;
    format_note: string;
    tbr: number | null;
    url: string;
    ext: string;
    acodec: string | null;
    container: string;
    resolution: string;
    audio_ext: string | null;
    abr: number | null;
    format?: string;
    format_id?: string;
    source_preference?: number;
    fps?: number;
    audio_channels?: number | null;
    height?: number;
    quality?: number;
    has_drm?: boolean;
    filesize_approx?: number;
    width?: number;
    language?: string | null;
    language_preference?: number;
    preference?: number | null;
    vcodec?: string;
    dynamic_range?: string;
    downloader_options?: { http_chunk_size: number };
    protocol?: string;
    video_ext?: string;
    vbr?: number | null;
    aspect_ratio?: number;
    http_headers?: {
        "User-Agent": string;
        Accept: string;
        "Accept-Language": string;
        "Sec-Fetch-Mode": string;
    };
    manifest_url?: string;
}

interface Comment {
    comment_id: string;
    is_pinned: boolean;
    comment: string;
    published_time: string;
    author_is_channel_owner: boolean;
    creator_thumbnail_url: string;
    like_count: string;
    is_member: boolean;
    author: string;
    is_hearted: boolean;
    is_liked: boolean;
    is_disliked: boolean;
    reply_count: string;
    hasReplies: boolean;
}

interface MetaData {
    id: string;
    title: string;
    channel: string;
    uploader: string;
    duration: number;
    thumbnail: string;
    age_limit: number;
    channel_id: string;
    categories: string[];
    display_id: string;
    view_count: number;
    like_count: number;
    description: string | null;
    channel_url: string;
    webpage_url: string;
    live_status: string;
    upload_date: string;
    uploader_id: string;
    original_url: string;
    uploader_url: string;
    comment_count: number;
    duration_string: string;
    channel_follower_count: number;
    view_count_formatted: string;
    like_count_formatted: string;
    upload_ago: number;
    upload_ago_formatted: { years: number; months: number; days: number; formatted: string };
    comment_count_formatted: string;
    channel_follower_count_formatted: string;
}

interface ExtractedVideoData {
    data: {
        BestAudioLow: Format;
        BestAudioHigh: Format;
        BestVideoLow: Format;
        BestVideoHigh: Format;
        AudioLowDRC: Format[];
        AudioHighDRC: Format[];
        AudioLow: Format[];
        AudioHigh: Format[];
        VideoLowHDR: Format[];
        VideoHighHDR: Format[];
        VideoLow: Format[];
        VideoHigh: Format[];
        ManifestLow: Format[];
        ManifestHigh: Format[];
        meta_data: MetaData;
        comments: Comment[];
        transcript: any;
    };
}

export default function VideoPage() {
    const searchParams = useSearchParams();
    const videoId = searchParams.get("v");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [videoData, setVideoData] = useState<ExtractedVideoData | null>(null);
    useEffect(() => {
        if (videoId) {
            const fetchVideoData = async () => {
                try {
                    const response = await fetch(`/api/Misc/Video/Extract?query=${encodeURIComponent(videoId)}`);
                    if (!response.ok) throw new Error(`Error fetching video data: ${response.statusText}`);
                    const data: ExtractedVideoData = await response.json();
                    setVideoData(data);
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchVideoData();
        } else {
            setError("Video ID is missing.");
            setIsLoading(false);
        }
    }, [videoId]);
    if (isLoading) return <div>Loading video data...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!videoData || !videoData.data || !videoData.data.meta_data) return <div>No video data found.</div>;
    const { meta_data, comments } = videoData.data;
    const opts = { height: "390", width: "640", playerVars: { autoplay: 1 } };
    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">{meta_data.title}</h1>
            <div className="mb-4">
                <YouTube videoId={videoId} opts={opts} />
            </div>
            <p>
                <strong>Channel:</strong> {meta_data.channel}
            </p>
            <p>
                <strong>Views:</strong> {meta_data.view_count}
            </p>
            <p>
                <strong>Likes:</strong> {meta_data.like_count}
            </p>
            <h2 className="text-xl font-semibold mt-4 mb-2">Description</h2>
            <p>{meta_data.description}</p>
            <h2 className="text-xl font-semibold mt-4 mb-2">Comments</h2>
            <ul>
                {comments.map((comment, index) => (
                    <li key={index} className="mb-2 border-b border-gray-700 pb-2">
                        <p>
                            <strong>{comment.author}:</strong> {comment.comment}
                        </p>
                        <p className="text-sm text-gray-500">
                            {comment.published_time} - {comment.like_count} likes
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
