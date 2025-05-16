import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
function extractVideoData(options: { query: string; verbose?: boolean; useTor?: boolean }): Promise<void> {
    return new Promise((resolve, reject) => {
        YouTubeDLX.Misc.Video.Extract(options)
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
        { label: "1", options: { query: "test video" } },
        { label: "2", options: { query: "test video", verbose: true } },
        { label: "3", options: { query: "test video", useTor: true } },
        { label: "4", options: { query: "test video", verbose: true, useTor: true } },
    ];
    for (const test of tests) {
        try {
            console.log(colors.bold.blue("@info"), `Extract: (${test.label}): Extract video data with options: ${JSON.stringify(test.options)}`);
            await extractVideoData(test.options);
        } catch (e) {
            console.error(colors.red(`Extract: (${test.label}) failed:`), e);
        }
    }
})();
