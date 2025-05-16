import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "PlaylistData: (1): Fetch playlist data with only the playlist link");
    YouTubeDLX.Search.Playlist.Single({ playlistLink: "https://www.youtube.com/playlist?list=PLw-VjHDlEOgs6k8xQ6sB9zAqS6vhJh2tV" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "PlaylistData: (2): Fetch playlist data with an invalid playlist link");
    YouTubeDLX.Search.Playlist.Single({ playlistLink: "https://www.youtube.com/playlist?list=INVALID" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
