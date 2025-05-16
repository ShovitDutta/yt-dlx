import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
function fetchVideoData(options: { videoLink: string }): Promise<void> {
    return new Promise((resolve, reject) => {
        YouTubeDLX.Search.Video.Single(options)
            .on("data", data => {
                console.log(colors.italic.green("@data:"), data);
            })
            .on("error", error => {
                console.error(colors.italic.red("@error:"), error);
                reject(error);
            })
            .on("end", () => {
                resolve();
            });
    });
}
(async () => {
    const testCases = [
        { label: "1", videoLink: "https://www.youtube.com/watch?v=yOiO2Zi0IRw" },
        { label: "2", videoLink: "https://www.youtube.com/watch?v=INVALID_ID" },
    ];
    for (const testCase of testCases) {
        try {
            console.log(colors.bold.blue("@info"), `VideoData: (${testCase.label}): Fetching data for link: ${testCase.videoLink}`);
            await fetchVideoData({ videoLink: testCase.videoLink });
        } catch (error) {
            console.error(colors.red("@error:"), `VideoData (${testCase.label}) failed:`, error);
        }
    }
})();
