import ProgBar from "./utils/ProgBar";
import YouTubeID from "./utils/YouTubeId";
import Misc_System_Help from "./routes/Misc/System/Help";
import Audio_Lowest from "./routes/Audio/Lowest";
import Audio_Custom from "./routes/Audio/Custom";
import Video_Lowest from "./routes/Video/Lowest";
import Video_Custom from "./routes/Video/Custom";
import Misc_Video_Extract from "./routes/Misc/Video/Extract";
import Audio_Highest from "./routes/Audio/Highest";
import Video_Highest from "./routes/Video/Highest";
import Account_HomeFeed from "./routes/Account/HomeFeed";
import Account_History from "./routes/Account/History";
import Search_Video_Single from "./routes/Search/Video/Single";
import Misc_Video_Related from "./routes/Misc/Video/Related";
import Misc_Video_Comments from "./routes/Misc/Video/Comments";
import Search_Channel_Single from "./routes/Search/Channel/Single";
import Audio_Video_Custom from "./routes/Audio_Video/Custom";
import Audio_Video_Lowest from "./routes/Audio_Video/Lowest";
import Search_Video_Multiple from "./routes/Search/Video/Multiple";
import Search_Playlist_Single from "./routes/Search/Playlist/Single";
import Audio_Video_Highest from "./routes/Audio_Video/Highest";
import Misc_Video_Transcript from "./routes/Misc/Video/Transcript";
import Search_Channel_Multiple from "./routes/Search/Channel/Multiple";
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
            ProgressBar: ProgBar, // YouTubeDLX.Misc.System.ProgressBar
        },
        Video: {
            GetId: YouTubeID, // YouTubeDLX.Misc.Video.GetId
            Extract: extract, // YouTubeDLX.Misc.Video.Extract
            Related: related_videos, // YouTubeDLX.Misc.Video.Related
            Comments: video_comments, // YouTubeDLX.Video.Misc.Comments
            Transcript: video_transcript, // YouTubeDLX.Misc.Video.Transcript
        },
    },
};
export default YouTubeDLX;
