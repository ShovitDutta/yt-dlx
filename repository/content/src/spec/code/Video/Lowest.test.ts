import YouTubeDLX from "../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "VideoLowest: (1): Process the lowest quality video with only the query");
    YouTubeDLX.Video.Lowest({ query: "test video" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoLowest: (2): Process the lowest quality video with the query and a filter");
    YouTubeDLX.Video.Lowest({ query: "test video", filter: "grayscale" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoLowest: (3): Stream the lowest quality video with the query and stream option enabled");
    YouTubeDLX.Video.Lowest({ query: "test video", stream: true })
        .on("stream", streamData => console.log(colors.italic.green("@stream:"), streamData))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoLowest: (4): Process the lowest quality video with verbose output enabled");
    YouTubeDLX.Video.Lowest({ query: "test video", verbose: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoLowest: (5): Fetch metadata instead of processing the video");
    YouTubeDLX.Video.Lowest({ query: "test video", metadata: true })
        .on("metadata", metadata => console.log(colors.italic.green("@metadata:"), metadata))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoLowest: (6): Process the lowest quality video with query, filter, stream, and metadata");
    YouTubeDLX.Video.Lowest({ query: "test video", filter: "grayscale", stream: true, metadata: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoLowest: (7): Process the lowest quality video with all parameters");
    YouTubeDLX.Video.Lowest({ query: "test video", output: "output", filter: "grayscale", stream: true, verbose: true, metadata: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
