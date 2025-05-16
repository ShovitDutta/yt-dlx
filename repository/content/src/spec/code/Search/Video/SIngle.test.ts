import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "VideoData: (1): Fetch video data with a valid video link");
    YouTubeDLX.Search.Video.Single({ videoLink: "https://www.youtube.com/watch?v=yOiO2Zi0IRw" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoData: (2): Fetch video data with an invalid video link");
    YouTubeDLX.Search.Video.Single({ videoLink: "https://www.youtube.com/watch?v=INVALID_ID" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
