import YouTubeDLX from "../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "AudioVideoHighest: (1): Download and process highest quality audio and video with only the query and filter");
    YouTubeDLX.Audio_Video.Highest({ query: "test song", filter: "grayscale" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioVideoHighest: (2): Download and process highest quality audio and video with query, filter, and verbose output enabled");
    YouTubeDLX.Audio_Video.Highest({ query: "test song", filter: "grayscale", verbose: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioVideoHighest: (3): Download and process highest quality audio and video with query, filter, and custom output folder");
    YouTubeDLX.Audio_Video.Highest({ query: "test song", filter: "grayscale", output: "output" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioVideoHighest: (4): Stream highest quality audio and video with query, filter, and stream enabled");
    YouTubeDLX.Audio_Video.Highest({ query: "test song", filter: "grayscale", stream: true })
        .on("stream", streamData => console.log(colors.italic.green("@stream:"), streamData))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioVideoHighest: (5): Download and process highest quality audio and video with query, filter, and metadata output enabled");
    YouTubeDLX.Audio_Video.Highest({ query: "test song", filter: "grayscale", metadata: true })
        .on("metadata", metadata => console.log(colors.italic.green("@metadata:"), metadata))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioVideoHighest: (6): Download and process highest quality audio and video with query, filter, stream, and metadata");
    YouTubeDLX.Audio_Video.Highest({ query: "test song", filter: "grayscale", stream: true, metadata: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioVideoHighest: (7): Download and process highest quality audio and video with all parameters");
    YouTubeDLX.Audio_Video.Highest({ query: "test song", output: "output", filter: "grayscale", stream: true, verbose: true, metadata: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
