import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
function searchVideos(options: { query: string }): Promise<void> {
    return new Promise((resolve, reject) => {
        YouTubeDLX.Search.Video.Multiple(options)
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
        { label: "1", query: "Node.js tutorial" },
        { label: "2", query: "INVALID_QUERY" },
        { label: "3", query: "https://www.youtube.com/watch?v=yOiO2Zi0IRw" },
    ];
    for (const test of tests) {
        try {
            console.log(colors.bold.blue("@info"), `SearchVideos: (${test.label}): Searching for query: ${test.query}`);
            await searchVideos({ query: test.query });
        } catch (e) {
            console.error(colors.red(`SearchVideos: (${test.label}) failed:`), e);
        }
    }
})();
