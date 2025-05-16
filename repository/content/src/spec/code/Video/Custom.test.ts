import YouTubeDLX from "../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
function runVideoCustom(options: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const stream = YouTubeDLX.Video.Custom(options);
        let handled = false;
        stream
            .on("data", data => {
                console.log(colors.italic.green("@data:"), data);
                handled = true;
            })
            .on("stream", streamData => {
                console.log(colors.italic.green("@stream:"), streamData);
                handled = true;
            })
            .on("metadata", metadata => {
                console.log(colors.italic.green("@metadata:"), metadata);
                handled = true;
            })
            .on("error", error => {
                console.error(colors.italic.red("@error:"), error);
                reject(error);
            })
            .on("end", () => {
                if (!handled) {
                    console.log(colors.yellow("@info:"), "No data emitted for this case.");
                }
                resolve();
            });
    });
}
(async () => {
    const testCases = [
        { label: "1", options: { query: "test video", resolution: "720p" } },
        { label: "2", options: { query: "test video", resolution: "1080p", filter: "grayscale" } },
        { label: "3", options: { query: "test video", resolution: "480p", stream: true } },
        { label: "4", options: { query: "test video", resolution: "720p", verbose: true } },
        { label: "5", options: { query: "test video", resolution: "1080p", metadata: true } },
        { label: "6", options: { query: "test video", resolution: "720p", filter: "grayscale", stream: true, metadata: true } },
        { label: "7", options: { query: "test video", output: "output", resolution: "720p", filter: "grayscale", stream: true, verbose: true, metadata: true } },
    ];
    for (const testCase of testCases) {
        try {
            console.log(colors.bold.blue("@info"), `VideoCustom: (${testCase.label}): Running with options`, testCase.options);
            await runVideoCustom(testCase.options);
        } catch (error) {
            console.error(colors.red("@error:"), `Test case (${testCase.label}) failed:`, error);
        }
    }
})();
