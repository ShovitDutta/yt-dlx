import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
function searchChannels(options: { query: string }): Promise<void> {
    return new Promise((resolve, reject) => {
        YouTubeDLX.Search.Channel.Multiple(options)
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
        { label: "1", options: { query: "Tech channels" } },
        { label: "2", options: { query: "INVALID_QUERY" } },
    ];
    for (const test of tests) {
        try {
            console.log(colors.bold.blue("@info"), `SearchChannels: (${test.label}): Searching for channels with query: "${test.options.query}"`);
            await searchChannels(test.options);
        } catch (e) {
            console.error(colors.red(`SearchChannels: (${test.label}) failed:`), e);
        }
    }
})();
