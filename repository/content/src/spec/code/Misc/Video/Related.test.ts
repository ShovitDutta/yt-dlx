import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
function fetchRelatedVideos(options: { videoId: string }): Promise<void> {
    return new Promise((resolve, reject) => {
        YouTubeDLX.Misc.Video.Related(options)
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
    const tests = [
        { label: "1", options: { videoId: "dQw4w9WgXcQ" } },
        { label: "2", options: { videoId: "INVALID_yOiO2Zi0IRw" } },
    ];
    for (const test of tests) {
        try {
            console.log(colors.bold.blue("@info"), `RelatedVideos: (${test.label}): Fetch related videos for video ID: "${test.options.videoId}"`);
            await fetchRelatedVideos(test.options);
        } catch (e) {
            console.error(colors.red(`RelatedVideos: (${test.label}) failed:`), e);
        }
    }
})();
