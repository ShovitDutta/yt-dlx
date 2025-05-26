import ProgBar from "./utils/ProgBar";
import YouTubeID from "./utils/YouTubeId";
import Misc_System_Help from "./routes/Misc/System/Help";
import Misc_Video_Extract from "./routes/Misc/Video/Extract";
import Misc_Video_Related from "./routes/Misc/Video/Related";
import Misc_Video_Comments from "./routes/Misc/Video/Comments";
import Misc_Video_Transcript from "./routes/Misc/Video/Transcript";
import Audio_Lowest from "./routes/Audio/Lowest";
import Audio_Custom from "./routes/Audio/Custom";
import Audio_Highest from "./routes/Audio/Highest";
import Video_Lowest from "./routes/Video/Lowest";
import Video_Custom from "./routes/Video/Custom";
import Video_Highest from "./routes/Video/Highest";
import Audio_Video_Custom from "./routes/Audio_Video/Custom";
import Audio_Video_Lowest from "./routes/Audio_Video/Lowest";
import Audio_Video_Highest from "./routes/Audio_Video/Highest";
import Account_History from "./routes/Account/History";
import Account_HomeFeed from "./routes/Account/HomeFeed";
import Account_SubscriptionsFeed from "./routes/Account/SubscriptionsFeed";
import Account_UnseenNotifications from "./routes/Account/UnseenNotifications";
import Search_Video_Single from "./routes/Search/Video/Single";
import Search_Video_Multiple from "./routes/Search/Video/Multiple";
import Search_Channel_Single from "./routes/Search/Channel/Single";
import Search_Playlist_Single from "./routes/Search/Playlist/Single";
import Search_Channel_Multiple from "./routes/Search/Channel/Multiple";
import Search_Playlist_Multiple from "./routes/Search/Playlist/Multiple";
var YouTubeDLX = {
    Audio: {
        Custom: Audio_Custom, // YouTubeDLX.Audio.Custom
        Lowest: Audio_Lowest, // YouTubeDLX.Audio.Lowest
        Highest: Audio_Highest, // YouTubeDLX.Audio.Highest
    },
    Video: {
        Custom: Video_Custom, // YouTubeDLX.Video.Custom
        Lowest: Video_Lowest, // YouTubeDLX.Video.Lowest
        Highest: Video_Highest, // YouTubeDLX.Video.Highest
    },
    Audio_Video: {
        Custom: Audio_Video_Custom, // YouTubeDLX.Audio_Video.Custom
        Lowest: Audio_Video_Lowest, // YouTubeDLX.Audio_Video.Lowest
        Highest: Audio_Video_Highest, // YouTubeDLX.Audio_Video.Highest
    },
    Search: {
        Channel: {
            Single: Search_Channel_Single, // YouTubeDLX.Search.Channel.Single
            Multiple: Search_Channel_Multiple, // YouTubeDLX.Search.Channel.Multiple
        },
        Playlist: {
            Single: Search_Playlist_Single, // YouTubeDLX.Search.Playlist.Single
            Multiple: Search_Playlist_Multiple, // YouTubeDLX.Search.Playlist.Multiple
        },
        Video: {
            Single: Search_Video_Single, // YouTubeDLX.Search.Video.Single
            Multiple: Search_Video_Multiple, // YouTubeDLX.Search.Video.Multiple
        },
    },
    Account: {
        HomeFeed: Account_HomeFeed, // YouTubeDLX.Account.HomeFeed
        History: Account_History, // YouTubeDLX.Account.History
        SubscriptionsFeed: Account_SubscriptionsFeed, // YouTubeDLX.Account.SubscriptionsFeed
        UnseenNotifications: Account_UnseenNotifications, // YouTubeDLX.Account.UnseenNotifications
    },
    Misc: {
        System: {
            Help: Misc_System_Help, // YouTubeDLX.Misc.System.Help
            ProgressBar: ProgBar, // YouTubeDLX.Misc.System.ProgressBar
        },
        Video: {
            GetId: YouTubeID, // YouTubeDLX.Misc.Video.GetId
            Extract: Misc_Video_Extract, // YouTubeDLX.Misc.Video.Extract
            Related: Misc_Video_Related, // YouTubeDLX.Misc.Video.Related
            Comments: Misc_Video_Comments, // YouTubeDLX.Video.Misc.Comments
            Transcript: Misc_Video_Transcript, // YouTubeDLX.Misc.Video.Transcript
        },
    },
};
export default YouTubeDLX;
