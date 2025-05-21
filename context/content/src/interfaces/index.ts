export interface HTTPHeaders {
    "User-Agent": string;
    Accept: string;
    "Accept-Language": string;
    "Sec-Fetch-Mode": string;
}

export interface Thumbnail {
    url: string;
    preference: number;
    id: string;
    width?: number;
    height?: number;
    resolution?: string;
}

export interface Format {
    manifest_url?: string;
    format_id: string;
    format_note: string;
    ext: string;
    protocol: string;
    acodec: string;
    vcodec: string;
    url: string;
    width: number | null;
    height: number | null;
    fps: number | null;
    rows?: number;
    columns?: number;
    fragments?: { url: string; duration: number }[];
    audio_ext?: string;
    video_ext?: string;
    vbr: number;
    abr: number | null;
    tbr: number | null;
    resolution: string | null;
    aspect_ratio: number | null;
    filesize_approx: number | null;
    http_headers?: HTTPHeaders;
    format: string;
    format_index?: number | null;
    language?: string | null;
    preference?: number | null;
    quality?: number | null;
    has_drm?: boolean;
    source_preference?: number;
    filesize?: number;
    asr?: number;
    dynamic_range: string | null;
    container?: string;
    downloader_options?: { http_chunk_size: number };
    language_preference?: number;
}

export interface AutomaticCaptions {
    en?: { url: string; ext: string; name: string }[];
}

export interface Heatmap {
    start_time: number;
    end_time: number;
    value: number;
}

export interface CommentType {
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

export interface Entry {
    id: string;
    title: string;
    formats: Format[];
    thumbnails: Thumbnail[];
    description: string;
    channel_id: string;
    channel_url: string;
    duration: number;
    view_count: number;
    average_rating: null;
    age_limit: number;
    webpage_url: string;
    categories: string[];
    tags: string[];
    playable_in_embed: boolean;
    live_status: string;
    media_type: null;
    release_timestamp: null;
    _format_sort_fields: string[];
    automatic_captions?: AutomaticCaptions;
    subtitles?: { [key: string]: { url: string; ext: string; name: string }[] };
    comment_count: number;
    chapters: null;
    heatmap: Heatmap[];
    like_count: number;
    channel: string;
    channel_follower_count: number | null;
    channel_is_verified: boolean | null;
    uploader: string;
    uploader_id: string;
    uploader_url: string;
    upload_date: string;
    timestamp: number;
    availability: string;
    original_url: string;
    webpage_url_basename: string;
    webpage_url_domain: string;
    extractor: string;
    extractor_key: string;
    playlist_count: number;
    playlist: string;
    playlist_id: string;
    playlist_title: string;
    playlist_uploader: null;
    playlist_uploader_id: null;
    playlist_channel: null;
    playlist_channel_id: null;
    playlist_webpage_url: string;
    n_entries: number;
    playlist_index: number;
    __last_playlist_index: number;
    playlist_autonumber: number | null;
    display_id: string;
    fulltitle: string;
    duration_string: string;
    release_year: null;
    is_live: boolean;
    was_live: boolean;
    requested_subtitles: null;
    _has_drm: null;
    epoch: number;
    requested_downloads: {
        requested_formats: Format[];
        format?: string;
        format_id: string;
        ext: string;
        protocol: string;
        language: null;
        format_note: string;
        filesize_approx: number;
        tbr: number;
        width: number;
        height: number;
        dynamic_range: string;
        vcodec: string;
        acodec: string;
        asr: number;
        audio_channels: number;
    }[];
}
