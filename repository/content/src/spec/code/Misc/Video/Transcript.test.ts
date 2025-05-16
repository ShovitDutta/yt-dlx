import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
function fetchTranscript(options: { videoLink: string }): Promise<void> {
    return new Promise((resolve, reject) => {
        YouTubeDLX.Misc.Video.Transcript(options)
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
        { label: "1", options: { videoLink: "https://www.youtube.com/watch?v=yOiO2Zi0IRw" } },
        { label: "2", options: { videoLink: "https://www.youtube.com/watch?v=INVALID_ID" } },
    ];
    for (const test of tests) {
        try {
            console.log(colors.bold.blue("@info"), `VideoTranscript: (${test.label}): Fetch transcript data for video link: "${test.options.videoLink}"`);
            await fetchTranscript(test.options);
        } catch (e) {
            console.error(colors.red(`VideoTranscript: (${test.label}) failed:`), e);
        }
    }
})();
