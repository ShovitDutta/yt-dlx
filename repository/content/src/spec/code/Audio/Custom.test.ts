import YouTubeDLX from "../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "AudioCustom: (1): Download and process audio with only the query and resolution");
    YouTubeDLX.Audio.Custom({ query: "test song", resolution: "high" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioCustom: (2): Download and process audio with query, resolution, and verbose output enabled");
    YouTubeDLX.Audio.Custom({ query: "test song", resolution: "high", verbose: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioCustom: (3): Download and process audio with query, resolution, and custom output folder");
    YouTubeDLX.Audio.Custom({ query: "test song", resolution: "high", output: "output" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioCustom: (4): Download and stream audio with query, resolution, and stream enabled");
    YouTubeDLX.Audio.Custom({ query: "test song", resolution: "high", stream: true })
        .on("stream", streamData => console.log(colors.italic.green("@stream:"), streamData))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioCustom: (5): Download and process audio with query, resolution, and audio filter applied");
    YouTubeDLX.Audio.Custom({ query: "test song", resolution: "high", filter: "bassboost" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioCustom: (6): Download and process audio with metadata instead of downloading the audio");
    YouTubeDLX.Audio.Custom({ query: "test song", resolution: "high", metadata: true })
        .on("metadata", metadata => console.log(colors.italic.green("@metadata:"), metadata))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "AudioCustom: (7): Download and process audio with all parameters");
    YouTubeDLX.Audio.Custom({ query: "test song", resolution: "high", output: "output", stream: true, filter: "echo", verbose: true, metadata: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
