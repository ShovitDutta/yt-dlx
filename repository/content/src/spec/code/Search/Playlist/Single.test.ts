import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
function fetchPlaylistData(options: { playlistLink: string }): Promise<void> {
    return new Promise((resolve, reject) => {
        YouTubeDLX.Search.Playlist.Single(options)
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
        { label: "1", playlistLink: "https://www.youtube.com/playlist?list=PLw-VjHDlEOgs6k8xQ6sB9zAqS6vhJh2tV" },
        { label: "2", playlistLink: "https://www.youtube.com/playlist?list=INVALID" },
    ];
    for (const test of tests) {
        try {
            console.log(colors.bold.blue("@info"), `PlaylistData: (${test.label}): Fetching playlist data for link: ${test.playlistLink}`);
            await fetchPlaylistData({ playlistLink: test.playlistLink });
        } catch (e) {
            console.error(colors.red(`PlaylistData: (${test.label}) failed:`), e);
        }
    }
})();
