import YouTubeDLX from "../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
function runAudioVideoCustom(options: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const stream = YouTubeDLX.Audio_Video.Custom(options);
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
    const query = "test song";
    const resolution = "720p";
    const filter = "grayscale";
    const testCases = [
        { label: "1", options: { query, resolution, filter } },
        { label: "2", options: { query, resolution, filter, verbose: true } },
        { label: "3", options: { query, resolution, filter, output: "output" } },
        { label: "4", options: { query, resolution, stream: true } },
        { label: "5", options: { query, resolution, filter, metadata: true } },
        { label: "6", options: { query, resolution, filter, stream: true, metadata: true } },
        { label: "7", options: { query, resolution, output: "output", filter, stream: true, verbose: true, metadata: true } },
    ];
    for (const testCase of testCases) {
        try {
            console.log(colors.bold.blue("@info"), `AudioVideoCustom: (${testCase.label}): Running with options`, testCase.options);
            await runAudioVideoCustom(testCase.options);
        } catch (error) {
            console.error(colors.red("@error:"), `Test case (${testCase.label}) failed:`, error);
        }
    }
})();
