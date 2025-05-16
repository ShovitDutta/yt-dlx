import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
function fetchChannelData(options: { channelLink: string }): Promise<void> {
    return new Promise((resolve, reject) => {
        YouTubeDLX.Search.Channel.Single(options)
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
    const tests = [{ label: "1", options: { channelLink: "https://www.youtube.com/c/testchannel" } }];
    for (const test of tests) {
        try {
            console.log(colors.bold.blue("@info"), `ChannelData: (${test.label}): Fetching channel data for link: ${test.options.channelLink}`);
            await fetchChannelData(test.options);
        } catch (e) {
            console.error(colors.red(`ChannelData: (${test.label}) failed:`), e);
        }
    }
})();
