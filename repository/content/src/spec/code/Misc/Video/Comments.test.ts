import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "VideoComments: (1): Fetch all video comments with only the query");
    YouTubeDLX.Misc.Video.Comments({ query: "Node.js tutorial" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoComments: (2): Fetch all video comments with verbose output enabled");
    YouTubeDLX.Misc.Video.Comments({ query: "Node.js tutorial", verbose: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoComments: (3): Fetch video comments with an invalid (too short) query");
    YouTubeDLX.Misc.Video.Comments({ query: "a" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoComments: (4): Fetch video comments with a query that returns no videos");
    YouTubeDLX.Misc.Video.Comments({ query: "asdhfkjashdfkjh", verbose: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoComments: (5): Fetch video comments for a video likely to have no comments");
    YouTubeDLX.Misc.Video.Comments({ query: "silent ASMR no comments", verbose: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
