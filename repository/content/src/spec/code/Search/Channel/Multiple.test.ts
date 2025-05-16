import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "SearchChannels: (1): Search for channels with a valid query");
    YouTubeDLX.Search.Channel.Multiple({ query: "Tech channels" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "SearchChannels: (2): Search for channels with an invalid query");
    YouTubeDLX.Search.Channel.Multiple({ query: "INVALID_QUERY" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
