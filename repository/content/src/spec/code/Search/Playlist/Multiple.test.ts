import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
function searchPlaylists(options: { playlistLink: string }): Promise<void> {
    return new Promise((resolve, reject) => {
        YouTubeDLX.Search.Playlist.Multiple(options)
            .on("data", data => console.log(colors.italic.green("@data:"), data))
            .on("error", error => {
                console.error(colors.italic.red("@error:"), error);
                reject(error);
            })
            .on("end", () => resolve());
    });
}
(async () => {
    const tests = [
        { label: "1", playlistLink: "Top 10 Music Playlists" },
        { label: "2", playlistLink: "INVALID_PLAYLIST_LINK" },
        { label: "3", playlistLink: "https://www.youtube.com/playlist?list=PLAYLIST_ID" },
    ];
    for (const test of tests) {
        try {
            console.log(colors.bold.blue("@info"), `SearchPlaylists: (${test.label}): Searching playlists for query/link: ${test.playlistLink}`);
            await searchPlaylists({ playlistLink: test.playlistLink });
        } catch (e) {
            console.error(colors.red(`SearchPlaylists: (${test.label}) failed:`), e);
        }
    }
})();
