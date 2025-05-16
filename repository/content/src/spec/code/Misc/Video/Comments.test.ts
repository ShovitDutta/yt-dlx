import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
function fetchVideoComments(options: { query: string; verbose?: boolean }): Promise<void> {
    return new Promise((resolve, reject) => {
        YouTubeDLX.Misc.Video.Comments(options)
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
        { label: "1", options: { query: "Node.js tutorial" } },
        { label: "2", options: { query: "Node.js tutorial", verbose: true } },
        { label: "3", options: { query: "a" } },
        { label: "4", options: { query: "asdhfkjashdfkjh", verbose: true } },
        { label: "5", options: { query: "silent ASMR no comments", verbose: true } },
    ];
    for (const test of tests) {
        try {
            console.log(colors.bold.blue("@info"), `VideoComments: (${test.label}): Fetch video comments with options: ${JSON.stringify(test.options)}`);
            await fetchVideoComments(test.options);
        } catch (error) {
            console.error(colors.red(`VideoComments: (${test.label}) failed:`), error);
        }
    }
})();
