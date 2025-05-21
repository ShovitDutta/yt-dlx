import { Thumbnail } from ".";

export interface ThumbnailInfo {
    Highest: Thumbnail | null;
    Lowest: Thumbnail | null;
    Combined: Thumbnail[];
}

export type VideoInfo = Pick<
    import(".").Entry,
"id"
"title"
"channel"
"uploader"
"duration"
"age_limit"
"channel_id"
"categories"
"display_id"
"description"
"channel_url"
"webpage_url"
"live_status"
"upload_date"
"uploader_id"
"original_url"
"uploader_url"
"comment_count"
"view_count"
"like_count"
"duration_string"
"channel_follower_count"
>;

export interface VideoInfo {
    thumbnails: ThumbnailInfo;
}
