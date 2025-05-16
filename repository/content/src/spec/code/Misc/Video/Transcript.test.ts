import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "VideoTranscript: (1): Fetch transcript data with only the video link");
    YouTubeDLX.Misc.Video.Transcript({ videoLink: "https://www.youtube.com/watch?v=yOiO2Zi0IRw" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoTranscript: (2): Fetch transcript data with an invalid video link");
    YouTubeDLX.Misc.Video.Transcript({ videoLink: "https://www.youtube.com/watch?v=INVALID_ID" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
