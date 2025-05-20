"use client";
import Hls from "hls.js";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Calendar, ThumbsUp, MessageSquare, User, Share2, Heart } from "lucide-react";

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
    format: string;
    format_id: string;
    source_preference: number | null;
    fps: number | null;
    audio_channels: number | null;
    height: number | null;
    quality: number | null;
    has_drm: boolean | null;
    filesize_approx: number | null;
    width: number | null;
    language: string | null;
    preference: number | null;
    vbr: number | null;
    vcodec: string | null;
    protocol: string | null;
    video_ext: string | null;
    aspect_ratio: number | null;
    manifest_url: string | null;
    dynamic_range: string | null;
    language_preference: number | null;
    downloader_options: { http_chunk_size: number } | null;
    http_headers: { "User-Agent": string; Accept: string; "Accept-Language": string; "Sec-Fetch-Mode": string } | null;
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
    const videoId = searchParams.get("videoId");
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [showFullDescription, setShowFullDescription] = useState(false);
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

    useEffect(() => {
        if (videoData && videoRef.current) {
            const video = videoRef.current;
            const manifestUrl = videoData.data.ManifestHigh?.[0]?.manifest_url || videoData.data.ManifestLow?.[0]?.manifest_url;

            if (manifestUrl) {
                if (Hls.isSupported()) {
                    const hls = new Hls({
                        maxBufferLength: 30,
                        maxMaxBufferLength: 60,
                        startLevel: -1, // Auto start with the optimal quality
                    });
                    hls.loadSource(manifestUrl);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        // Don't autoplay to give user control
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = manifestUrl;
                }
            } else {
                // If no HLS manifest is available, try direct video sources
                const videoSource = videoData.data.BestVideoHigh?.url || videoData.data.VideoHigh?.[0]?.url || videoData.data.VideoLow?.[0]?.url;

                if (videoSource) {
                    video.src = videoSource;
                } else {
                    setError("No video source found.");
                }
            }

            // Set up event listeners
            video.addEventListener("play", () => setIsPlaying(true));
            video.addEventListener("pause", () => setIsPlaying(false));

            return () => {
                video.removeEventListener("play", () => setIsPlaying(true));
                video.removeEventListener("pause", () => setIsPlaying(false));
            };
        }
    }, [videoData]);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        }
    };

    const formatUploadDate = (dateString: string) => {
        // Convert YYYYMMDD to YYYY-MM-DD
        if (dateString && dateString.length === 8) {
            return `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`;
        }
        return dateString;
    };

    // Truncate description with toggle
    const renderDescription = (description: string | null) => {
        if (!description) return null;

        const shouldTruncate = description.length > 300 && !showFullDescription;
        const displayText = shouldTruncate ? `${description.substring(0, 300)}...` : description;

        return (
            <div className="mt-4">
                <p className="whitespace-pre-line">{displayText}</p>
                {description.length > 300 && (
                    <button onClick={() => setShowFullDescription(!showFullDescription)} className="text-blue-500 mt-2 hover:underline">
                        {showFullDescription ? "Show less" : "Show more"}
                    </button>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-6 text-center">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700">Error: {error}</p>
                </div>
            </div>
        );
    }

    if (!videoData || !videoData.data || !videoData.data.meta_data) {
        return (
            <div className="container mx-auto px-4 py-6 text-center">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="text-yellow-700">No video data found.</p>
                </div>
            </div>
        );
    }

    const { meta_data, comments } = videoData.data;

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Video Player Section */}
            <div ref={videoContainerRef} className="relative mb-4 bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} className="w-full aspect-video" controls poster={meta_data.thumbnail} onClick={handlePlayPause}></video>
            </div>

            {/* Video Title */}
            <h1 className="text-2xl font-bold mb-2">{meta_data.title}</h1>

            {/* Video Stats & Actions */}
            <div className="flex flex-wrap md:flex-nowrap justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                    <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
                        <User size={20} />
                    </div>
                    <div>
                        <p className="font-semibold">{meta_data.channel}</p>
                        <p className="text-sm text-gray-600">{meta_data.channel_follower_count_formatted} subscribers</p>
                    </div>
                </div>

                <div className="flex mt-2 md:mt-0 space-x-2">
                    <button className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full">
                        <ThumbsUp size={18} />
                        <span>{meta_data.like_count_formatted}</span>
                    </button>
                    <button className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full">
                        <Share2 size={18} />
                        <span>Share</span>
                    </button>
                </div>
            </div>

            {/* Video Info */}
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-2">
                    <div className="flex items-center">
                        <div className="mr-2 text-gray-600">
                            <Calendar size={16} />
                        </div>
                        <span>{formatUploadDate(meta_data.upload_date)}</span>
                    </div>
                    <div className="flex items-center">
                        <div className="mr-2 text-gray-600">
                            <ThumbsUp size={16} />
                        </div>
                        <span>{meta_data.view_count_formatted} views</span>
                    </div>
                    <div className="flex items-center">
                        <div className="mr-2 text-gray-600">
                            <MessageSquare size={16} />
                        </div>
                        <span>{meta_data.comment_count_formatted} comments</span>
                    </div>
                </div>

                {meta_data.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {meta_data.categories.map((category, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {category}
                            </span>
                        ))}
                    </div>
                )}

                {renderDescription(meta_data.description)}
            </div>

            {/* Comments Section */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <MessageSquare size={20} className="mr-2" />
                    Comments ({meta_data.comment_count_formatted})
                </h2>

                {comments.length > 0 ? (
                    <ul className="space-y-4">
                        {comments.map((comment, index) => (
                            <li key={index} className="pb-4 border-b border-gray-200">
                                <div className="flex space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                                            {comment.creator_thumbnail_url ? (
                                                <img src={comment.creator_thumbnail_url} alt={comment.author} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User size={16} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center mb-1">
                                            <p className="font-medium mr-2">{comment.author}</p>
                                            <span className="text-xs text-gray-500">{comment.published_time}</span>
                                            {comment.author_is_channel_owner && <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">Creator</span>}
                                            {comment.is_pinned && (
                                                <span className="ml-2 text-xs text-gray-500 flex items-center">
                                                    <span className="mr-1">📌</span> Pinned
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-800 whitespace-pre-line">{comment.comment}</p>
                                        <div className="flex items-center mt-2 text-sm text-gray-600">
                                            <button className="flex items-center mr-4">
                                                <ThumbsUp size={14} className="mr-1" />
                                                <span>{comment.like_count}</span>
                                            </button>
                                            {comment.hasReplies && (
                                                <button className="text-blue-600">
                                                    {comment.reply_count} {parseInt(comment.reply_count) === 1 ? "reply" : "replies"}
                                                </button>
                                            )}
                                            {comment.is_hearted && (
                                                <span className="ml-3 text-red-500">
                                                    <Heart size={14} fill="currentColor" />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 py-4">No comments available for this video.</p>
                )}
            </div>
        </div>
    );
}
