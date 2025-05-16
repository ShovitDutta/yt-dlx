import YouTubeDLX from "../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "AudioVideoCustom: (1): Download and process audio and video with only the query, resolution, and filter");
    YouTubeDLX.Audio_Video.Custom({ query: "test song", resolution: "720p", filter: "grayscale" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioVideoCustom: (2): Download and process audio and video with query, resolution, filter, and verbose output enabled");
    YouTubeDLX.Audio_Video.Custom({ query: "test song", resolution: "720p", filter: "grayscale", verbose: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioVideoCustom: (3): Download and process audio and video with query, resolution, and custom output folder");
    YouTubeDLX.Audio_Video.Custom({ query: "test song", resolution: "720p", filter: "grayscale", output: "output" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioVideoCustom: (4): Stream audio and video with query, resolution, and stream enabled");
    YouTubeDLX.Audio_Video.Custom({ query: "test song", resolution: "720p", stream: true })
        .on("stream", streamData => console.log(colors.italic.green("@stream:"), streamData))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioVideoCustom: (5): Download and process audio and video with query, resolution, filter, and metadata output enabled");
    YouTubeDLX.Audio_Video.Custom({ query: "test song", resolution: "720p", filter: "grayscale", metadata: true })
        .on("metadata", metadata => console.log(colors.italic.green("@metadata:"), metadata))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioVideoCustom: (6): Download and process audio and video with query, resolution, filter, stream, and metadata");
    YouTubeDLX.Audio_Video.Custom({ query: "test song", resolution: "720p", filter: "grayscale", stream: true, metadata: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioVideoCustom: (7): Download and process audio and video with all parameters");
    YouTubeDLX.Audio_Video.Custom({ query: "test song", output: "output", resolution: "720p", filter: "grayscale", stream: true, verbose: true, metadata: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
