import YouTubeDLX from "../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "VideoHighest: (1): Process the highest quality video with only the query");
    YouTubeDLX.Video.Highest({ query: "test video" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoHighest: (2): Process the highest quality video with the query and a filter");
    YouTubeDLX.Video.Highest({ query: "testvideo", filter: "grayscale" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoHighest: (3): Stream the highest quality video with the query and stream option enabled");
    YouTubeDLX.Video.Highest({ query: "test video", stream: true })
        .on("stream", streamData => console.log(colors.italic.green("@stream:"), streamData))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoHighest: (4): Process the highest quality video with verbose output enabled");
    YouTubeDLX.Video.Highest({ query: "test video", verbose: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoHighest: (5): Fetch metadata instead of processing the video");
    YouTubeDLX.Video.Highest({ query: "test video", metadata: true })
        .on("metadata", metadata => console.log(colors.italic.green("@metadata:"), metadata))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoHighest: (6): Process the highest quality video with query, filter, stream, and metadata");
    YouTubeDLX.Video.Highest({ query: "test video", filter: "grayscale", stream: true, metadata: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "VideoHighest: (7): Process the highest quality video with all parameters");
    YouTubeDLX.Video.Highest({ query: "test video", output: "output", filter: "grayscale", stream: true, verbose: true, metadata: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
