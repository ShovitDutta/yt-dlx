// Suggestion: Add JSDoc comments to each property of the interface to provide more context and explain the meaning of each field.
export default interface VideoInfo {
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
    description: string;
    channel_url: string;
    webpage_url: string;
    live_status: string;
    view_count: number;
    like_count: number;
    comment_count: number;
    channel_follower_count: number;
    upload_date?: string | null;
    uploader_id: string;
    original_url: string;
    uploader_url: string;
    duration_string: string;
}
