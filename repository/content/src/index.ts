import progbar from "./utils/progbar";
import YouTubeID from "./utils/YouTubeId";
import help from "./routes/Misc/System/Help";
import AudioLowest from "./routes/Audio/Lowest";
import AudioCustom from "./routes/Audio/Custom";
import VideoLowest from "./routes/Video/Lowest";
import VideoCustom from "./routes/Video/Custom";
import extract from "./routes/Misc/Video/Extract";
import AudioHighest from "./routes/Audio/Highest";
import VideoHighest from "./routes/Video/Highest";
import home_feed from "./routes/Account/HomeFeed";
import watch_history from "./routes/Account/History";
import video_data from "./routes/Search/Video/SIngle";
import list_formats from "./routes/Misc/Video/Formats";
import related_videos from "./routes/Misc/Video/Related";
import video_comments from "./routes/Misc/Video/Comments";
import channel_data from "./routes/Search/Channel/Single";
import AudioVideoCustom from "./routes/Audio_Video/Custom";
import AudioVideoLowest from "./routes/Audio_Video/Lowest";
import search_videos from "./routes/Search/Video/Multiple";
import playlist_data from "./routes/Search/Playlist/Single";
import AudioVideoHighest from "./routes/Audio_Video/Highest";
import video_transcript from "./routes/Misc/Video/Transcript";
import search_channels from "./routes/Search/Channel/Multiple";
import search_playlists from "./routes/Search/Playlist/Multiple";
import subscriptions_feed from "./routes/Account/SubscriptionsFeed";
import unseen_notifications from "./routes/Account/UnseenNotifications";

/**
 * A collection of functions and utilities for interacting with YouTube data
 * and downloading audio/video, refactored to use async/await internally.
 */
var YouTubeDLX = {
    /**
     * Functions for downloading audio streams.
     */
    Audio: {
        /**
         * Downloads audio stream with custom options.
         */
        Custom: AudioCustom,
        /**
         * Downloads the lowest quality audio stream.
         */
        Lowest: AudioLowest,
        /**
         * Downloads the highest quality audio stream.
         */
        Highest: AudioHighest,
    },
    /**
     * Functions for downloading video streams (without audio).
     */
    Video: {
        /**
         * Downloads video stream with custom options.
         */
        Custom: VideoCustom,
        /**
         * Downloads the lowest quality video stream.
         */
        Lowest: VideoLowest,
        /**
         * Downloads the highest quality video stream.
         */
        Highest: VideoHighest,
    },
    /**
     * Functions for downloading combined audio/video streams.
     */
    Audio_Video: {
        /**
         * Downloads combined audio/video stream with custom options.
         */
        Custom: AudioVideoCustom,
        /**
         * Downloads the lowest quality combined audio/video stream.
         */
        Lowest: AudioVideoLowest,
        /**
         * Downloads the highest quality combined audio/video stream.
         */
        Highest: AudioVideoHighest,
    },
    /**
     * Functions for searching YouTube content.
     */
    Search: {
        /**
         * Functions for searching YouTube channels.
         */
        Channel: {
            /**
             * Retrieves data for a single YouTube channel.
             */
            Single: channel_data,
            /**
             * Searches for multiple YouTube channels.
             */
            Multiple: search_channels,
        },
        /**
         * Functions for searching YouTube playlists.
         */
        Playlist: {
            /**
             * Retrieves data for a single YouTube playlist.
             */
            Single: playlist_data,
            /**
             * Searches for multiple YouTube playlists.
             */
            Multiple: search_playlists,
        },
        /**
         * Functions for searching YouTube videos.
         */
        Video: {
            /**
             * Retrieves data for a single YouTube video.
             */
            Single: video_data,
            /**
             * Searches for multiple YouTube videos.
             */
            Multiple: search_videos,
        },
    },
    /**
     * Functions for accessing YouTube account data (requires authentication).
     */
    Account: {
        /**
         * Retrieves the user's home feed.
         */
        HomeFeed: home_feed,
        /**
         * Retrieves the user's watch history.
         */
        History: watch_history,
        /**
         * Retrieves the user's subscriptions feed.
         */
        SubscriptionsFeed: subscriptions_feed,
        /**
         * Retrieves the user's unseen notifications.
         */
        UnseenNotifications: unseen_notifications,
    },
    /**
     * Miscellaneous utility functions.
     */
    Misc: {
        /**
         * System-level utilities.
         */
        System: {
            /**
             * Displays help information.
             */
            Help: help,
            /**
             * Provides a progress bar utility.
             */
            ProgressBar: progbar,
        },
        /**
         * Video-related utilities.
         */
        Video: {
            /**
             * Extracts the YouTube video ID from a URL.
             */
            GetId: YouTubeID,
            /**
             * Extracts data from a video page.
             */
            Extract: extract,
            /**
             * Lists available formats for a video.
             */
            Formats: list_formats,
            /**
             * Retrieves related videos for a given video.
             */
            Related: related_videos,
            /**
             * Retrieves comments for a video.
             */
            Comments: video_comments,
            /**
             * Retrieves the transcript for a video.
             */
            Transcript: video_transcript,
        },
    },
};

export default YouTubeDLX;
