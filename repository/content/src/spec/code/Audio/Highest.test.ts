import YouTubeDLX from "../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "AudioHighest: (1): Download and process highest quality audio with only the query and filter");
    YouTubeDLX.Audio.Highest({ query: "test song", filter: "bassboost" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioHighest: (2): Download and process highest quality audio with query, filter, and verbose output enabled");
    YouTubeDLX.Audio.Highest({ query: "test song", filter: "bassboost", verbose: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioHighest: (3): Download and process highest quality audio with query, filter, and custom output folder");
    YouTubeDLX.Audio.Highest({ query: "test song", filter: "bassboost", output: "output" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioHighest: (4): Stream highest quality audio with query and stream enabled");
    YouTubeDLX.Audio.Highest({ query: "test song", stream: true })
        .on("stream", streamData => console.log(colors.italic.green("@stream:"), streamData))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioHighest: (5): Download and process highest quality audio with query, filter, and metadata output enabled");
    YouTubeDLX.Audio.Highest({ query: "test song", filter: "bassboost", metadata: true })
        .on("metadata", metadata => console.log(colors.italic.green("@metadata:"), metadata))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioHighest: (6): Download and process highest quality audio with query, filter, stream, and metadata");
    YouTubeDLX.Audio.Highest({ query: "test song", filter: "bassboost", stream: true, metadata: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioHighest: (7): Download and process highest quality audio with all parameters");
    YouTubeDLX.Audio.Highest({ query: "test song", output: "output", filter: "bassboost", stream: true, verbose: true, metadata: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
