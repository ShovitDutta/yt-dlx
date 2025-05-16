import YouTubeDLX from "../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
function runAudioCustom(options: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const stream = YouTubeDLX.Audio.Custom(options);
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
        { label: "1", options: { query: "4k Dolby Nature Scene", resolution: "high" } },
        { label: "2", options: { query: "4k Dolby Nature Scene", resolution: "high", verbose: true } },
        { label: "3", options: { query: "4k Dolby Nature Scene", resolution: "high", output: "output" } },
        { label: "4", options: { query: "4k Dolby Nature Scene", resolution: "high", stream: true } },
        { label: "5", options: { query: "4k Dolby Nature Scene", resolution: "high", filter: "bassboost" } },
        { label: "6", options: { query: "4k Dolby Nature Scene", resolution: "high", metadata: true } },
        { label: "7", options: { query: "4k Dolby Nature Scene", resolution: "high", output: "output", stream: true, filter: "echo", verbose: true, metadata: true } },
    ];
    for (const testCase of testCases) {
        try {
            console.log(colors.bold.blue("@info"), `AudioCustom: (${testCase.label}): Running with options`, testCase.options);
            await runAudioCustom(testCase.options);
        } catch (error) {
            console.error(colors.red("@error:"), `Test case (${testCase.label}) failed:`, error);
        }
    }
})();
