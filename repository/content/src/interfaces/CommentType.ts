// Suggestion: Add JSDoc comments to each property of the interface to provide more context and explain the meaning of each field.
export interface CommentType {
    comment_id: string;
    is_pinned: boolean;
    comment: string;
    published_time: string;
    author_is_channel_owner: boolean;
    creator_thumbnail_url: string;
    like_count: number;
    is_member: boolean;
    author: string;
    is_hearted: boolean;
    is_liked: boolean;
    is_disliked: boolean;
    reply_count: number;
    hasReplies: boolean;
}
