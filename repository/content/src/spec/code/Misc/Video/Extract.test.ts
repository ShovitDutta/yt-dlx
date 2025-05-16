import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "Extract: (1): Extract video data with only the query");
    YouTubeDLX.Misc.Video.Extract({ query: "test video" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "Extract: (2): Extract video data with verbose output enabled");
    YouTubeDLX.Misc.Video.Extract({ query: "test video", verbose: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "Extract: (3): Extract video data with Tor enabled");
    YouTubeDLX.Misc.Video.Extract({ query: "test video", useTor: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "Extract: (4): Extract video data with all parameters");
    YouTubeDLX.Misc.Video.Extract({ query: "test video", verbose: true, useTor: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
