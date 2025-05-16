import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
function listFormats(options: { query: string; verbose?: boolean }): Promise<void> {
    return new Promise((resolve, reject) => {
        YouTubeDLX.Misc.Video.Formats(options)
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
    ];
    for (const test of tests) {
        try {
            console.log(colors.bold.blue("@info"), `ListFormats: (${test.label}): List formats for query: "${test.options.query}"` + (test.options.verbose ? " with verbose" : ""));
            await listFormats(test.options);
        } catch (e) {
            console.error(colors.red(`ListFormats: (${test.label}) failed:`), e);
        }
    }
})();
