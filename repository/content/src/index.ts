// Suggestion: Add JSDoc comments to the `YouTubeDLX` object and its properties to provide better documentation and type information. Consider using a more modular approach by exporting individual functions or classes instead of grouping them under a single object.
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
import video_data from "./routes/Search/Video/Single";
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
var YouTubeDLX = {
    Audio: {
        Custom: AudioCustom, // YouTubeDLX.Audio.Custom
        Lowest: AudioLowest, // YouTubeDLX.Audio.Lowest
        Highest: AudioHighest, // YouTubeDLX.Audio.Highest
    },
    Video: {
        Custom: VideoCustom, // YouTubeDLX.Video.Custom
        Lowest: VideoLowest, // YouTubeDLX.Video.Lowest
        Highest: VideoHighest, // YouTubeDLX.Video.Highest
    },
    Audio_Video: {
        Custom: AudioVideoCustom, // YouTubeDLX.Audio_Video.Custom
        Lowest: AudioVideoLowest, // YouTubeDLX.Audio_Video.Lowest
        Highest: AudioVideoHighest, // YouTubeDLX.Audio_Video.Highest
    },
    Search: {
        Channel: {
            Single: channel_data, // YouTubeDLX.Search.Channel.Single
            Multiple: search_channels, // YouTubeDLX.Search.Channel.Multiple
        },
        Playlist: {
            Single: playlist_data, // YouTubeDLX.Search.Playlist.Single
            Multiple: search_playlists, // YouTubeDLX.Search.Playlist.Multiple
        },
        Video: {
            Single: video_data, // YouTubeDLX.Search.Video.Single
            Multiple: search_videos, // YouTubeDLX.Search.Video.Multiple
        },
    },
    Account: {
        HomeFeed: home_feed, // YouTubeDLX.Account.HomeFeed
        History: watch_history, // YouTubeDLX.Account.History
        SubscriptionsFeed: subscriptions_feed, // YouTubeDLX.Account.SubscriptionsFeed
        UnseenNotifications: unseen_notifications, // YouTubeDLX.Account.UnseenNotifications
    },
    Misc: {
        System: {
            Help: help, // YouTubeDLX.Misc.System.Help
            ProgressBar: progbar, // YouTubeDLX.Misc.System.ProgressBar
        },
        Video: {
            GetId: YouTubeID, // YouTubeDLX.Misc.Video.GetId
            Extract: extract, // YouTubeDLX.Misc.Video.Extract
            Formats: list_formats, // YouTubeDLX.Misc.Video.Formats
            Related: related_videos, // YouTubeDLX.Misc.Video.Related
            Comments: video_comments, // YouTubeDLX.Video.Misc.Comments
            Transcript: video_transcript, // YouTubeDLX.Misc.Video.Transcript
        },
    },
};
export default YouTubeDLX;
