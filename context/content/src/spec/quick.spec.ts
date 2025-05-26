import { Start_Tor, New_IP, Stop_Tor } from "../routes/Misc/System/Tor";
import { locator } from "../utils/Locator";
import progbar from "../utils/ProgBar";
import Engine from "../utils/Engine";
import M3u8 from "../utils/M3u8";
import dotenv from "dotenv";
import YouTubeDLX from "..";
import fs from "fs";
dotenv.config();
console.clear();
if (false) {
    (async () => {
        const respEngine = await YouTubeDLX.Misc.Video.Extract({ Query: "https://www.youtube.com/watch?v=30LWjhZzg50", Verbose: true, UseTor: false });
        fs.writeFileSync("Engine.json", JSON.stringify(respEngine, null, 2));
        const paths = await locator();
        new M3u8({
            Verbose: true,
            ShowProgress: true,
            FFmpegPath: paths.ffmpeg,
            FFprobePath: paths.ffprobe,
            Audio_M3u8_URL: respEngine.AudioOnly.Standard["Default,"].Highest?.url!,
            Video_M3u8_URL: respEngine.VideoOnly.Standard_Dynamic_Range.Highest?.url!,
            configure: instance => {
                instance.outputFormat("matroska");
                instance.outputOptions("-c copy");
                instance.save(respEngine.MetaData.title?.toString().replace(/[^\w-]/g, "_") + ".mkv");
                instance.on("progress", progress => progbar({ ...progress, percent: progress.percent !== undefined && !isNaN(progress.percent) ? progress.percent : 0, startTime: new Date() }));
                instance.on("error", (err, stdout, stderr) => {
                    console.error("FFmpeg error:", err.message);
                    console.error("FFmpeg stdout:", stdout);
                    console.error("FFmpeg stderr:", stderr);
                });
            },
        }).run();
    })().catch(console.error);
} else {
    (async () => {
        console.log("Starting Tor...");
        await Start_Tor({ Verbose: false });
        console.log("Tor started.");

        console.log("Using Engine with Tor (first time)...");
        await Engine({ Query: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", UseTor: true, Verbose: true });
        console.log("Engine with Tor (first time) completed.");

        console.log("Requesting new Tor identity...");
        await New_IP({ Verbose: false });
        console.log("New Tor identity requested.");

        console.log("Using Engine with Tor (second time)...");
        await Engine({ Query: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", UseTor: true, Verbose: true });
        console.log("Engine with Tor (second time) completed.");

        console.log("Stopping Tor...");
        Stop_Tor({ Verbose: false });
        console.log("Tor stopped.");
        process.exit(0);
    })().catch(console.error);
}
