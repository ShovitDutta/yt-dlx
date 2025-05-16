import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "SearchPlaylists: (1): Search for playlists with a valid query");
    YouTubeDLX.Search.Playlist.Multiple({ playlistLink: "Top 10 Music Playlists" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "SearchPlaylists: (2): Search for playlists with an invalid query");
    YouTubeDLX.Search.Playlist.Multiple({ playlistLink: "INVALID_PLAYLIST_LINK" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "SearchPlaylists: (3): Search for playlists with a playlist ID");
    YouTubeDLX.Search.Playlist.Multiple({ playlistLink: "https://www.youtube.com/playlist?list=PLAYLIST_ID" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
