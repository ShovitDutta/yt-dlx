import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "SearchVideos: (1): Search for videos with a valid query");
    YouTubeDLX.Search.Video.Multiple({ query: "Node.js tutorial" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "SearchVideos: (2): Search for videos with an invalid query");
    YouTubeDLX.Search.Video.Multiple({ query: "INVALID_QUERY" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "SearchVideos: (3): Search for videos with a video link (not supported)");
    YouTubeDLX.Search.Video.Multiple({ query: "https://www.youtube.com/watch?v=yOiO2Zi0IRw" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
