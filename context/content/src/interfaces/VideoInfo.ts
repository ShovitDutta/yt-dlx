import { Thumbnail } from ".";

export interface ThumbnailInfo {
    Highest: Thumbnail | null;
    Lowest: Thumbnail | null;
    Combined: Thumbnail[];
}

export interface VideoInfo {
    id: string;
    title: string;
    channel: string;
    uploader: string;
    duration: number;
    age_limit: number;
    channel_id: string;
    categories: string[];
    display_id: string;
    description: string;
    channel_url: string;
    webpage_url: string;
    live_status: string;
    upload_date: string;
    uploader_id: string;
    original_url: string;
    uploader_url: string;
    comment_count: number;
    view_count: number;
    like_count: number;
    duration_string: string;
    channel_follower_count: number | null;
    thumbnails: ThumbnailInfo;
}
