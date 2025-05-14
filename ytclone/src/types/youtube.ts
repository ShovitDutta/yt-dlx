// ./ytclone/src/types/youtube.ts

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface Video {
  id: string;
  title: string;
  thumbnails: Thumbnail[];
  channelname: string;
  viewCount?: number;
  uploadDate?: string;
  isLive?: boolean;
  duration?: number;
  description?: string;
  channelid?: string;
  tags?: string;
  likeCount?: number;
}

export interface Comment {
  comment_id: string;
  author: string;
  comment: string;
  published_time: string;
  like_count: number;
  is_pinned?: boolean;
  author_is_channel_owner?: boolean;
  creator_thumbnail_url?: string;
  is_member?: boolean;
  is_hearted?: boolean;
  is_liked?: boolean;
  is_disliked?: boolean;
  reply_count?: number;
  hasReplies?: boolean;
}

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
  // Including segments property from yt-dlx definition, though not used in current display
  segments: {
    utf8: string;
    tOffsetMs?: number;
    acAsrConf: number;
  }[];
}

export interface Format {
  format?: string;
  tbr?: number;
  filesizeP?: string;
  format_note?: string;
  url?: string;
}

export interface VideoDetails {
  meta_data: {
    id: string;
    original_url?: string;
    webpage_url?: string;
    title?: string;
    view_count?: number;
    like_count?: number;
    view_count_formatted?: string;
    like_count_formatted?: string;
    uploader?: string;
    uploader_id?: string;
    uploader_url?: string;
    thumbnail?: string;
    categories?: string[];
    time?: number;
    duration?: {
      hours: number;
      minutes: number;
      seconds: number;
      formatted: string;
    };
    age_limit?: number;
    live_status?: string;
    description?: string;
    full_description?: string;
    upload_date?: string; // Assuming this is the prettyDate string
    upload_ago?: number;
    upload_ago_formatted?: {
      years: number;
      months: number;
      days: number;
      formatted: string;
    };
    comment_count?: number;
    comment_count_formatted?: string;
    channel_id?: string;
    channel_name?: string;
    channel_url?: string;
    channel_follower_count?: number;
    channel_follower_count_formatted?: string;
  };
  AudioLowF?: Format;
  AudioHighF?: Format;
  VideoLowF?: Format;
  VideoHighF?: Format;
  AudioLowDRC?: Format;
  AudioHighDRC?: Format;
  AudioLow?: Format[];
  AudioHigh?: Format[];
  VideoLowHDR?: Format[];
  VideoHighHDR?: Format[];
  VideoLow?: Format[];
  VideoHigh?: Format[];
  ManifestLow?: Format[];
  ManifestHigh?: Format[];
  comments?: Comment[];
  transcript?: TranscriptSegment[];
}

export interface RelatedVideo {
  id: string;
  title: string;
  isLive: boolean;
  duration: number;
  uploadDate: string;
  thumbnails: Thumbnail[];
}