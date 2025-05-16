import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "RelatedVideos: (1): Fetch related videos with only the video ID");
    YouTubeDLX.Misc.Video.Related({ videoId: "dQw4w9WgXcQ" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "RelatedVideos: (2): Fetch related videos with an invalid video ID");
    YouTubeDLX.Misc.Video.Related({ videoId: "INVALID_yOiO2Zi0IRw" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
