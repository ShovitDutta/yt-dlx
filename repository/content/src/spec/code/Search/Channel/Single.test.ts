import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "ChannelData: (1): Fetch channel data with only the channel link");
    YouTubeDLX.Search.Channel.Single({ channelLink: "https://www.youtube.com/c/testchannel" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
