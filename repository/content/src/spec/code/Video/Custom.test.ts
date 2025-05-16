import YouTubeDLX from "../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "VideoCustom: (1): Process a video with only the query and resolution");
    YouTubeDLX.Video.Custom({ query: "test video", resolution: "720p" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoCustom: (2): Process a video with the query, resolution, and a filter");
    YouTubeDLX.Video.Custom({ query: "test video", resolution: "1080p", filter: "grayscale" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoCustom: (3): Stream a video with the query, resolution, and stream option enabled");
    YouTubeDLX.Video.Custom({ query: "test video", resolution: "480p", stream: true })
        .on("stream", streamData => console.log(colors.italic.green("@stream:"), streamData))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoCustom: (4): Process a video with verbose output enabled");
    YouTubeDLX.Video.Custom({ query: "test video", resolution: "720p", verbose: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoCustom: (5): Fetch metadata instead of processing the video");
    YouTubeDLX.Video.Custom({ query: "test video", resolution: "1080p", metadata: true })
        .on("metadata", metadata => console.log(colors.italic.green("@metadata:"), metadata))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoCustom: (6): Process a video with query, resolution, filter, stream, and metadata");
    YouTubeDLX.Video.Custom({ query: "test video", resolution: "720p", filter: "grayscale", stream: true, metadata: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoCustom: (7): Process a video with all parameters");
    YouTubeDLX.Video.Custom({
        query: "test video",
        output: "output",
        resolution: "720p",
        filter: "grayscale",
        stream: true,
        verbose: true,
        metadata: true,
    })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
