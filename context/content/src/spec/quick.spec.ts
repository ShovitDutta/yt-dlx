import { locator } from "../utils/Locator";
import progbar from "../utils/ProgBar";
import dotenv from "dotenv";
import YouTubeDLX from "..";
import fs from "fs";
dotenv.config();
console.clear();
(async () => {
    const respEngine = await YouTubeDLX.Misc.Video.Extract({ Query: "1 hour lofi" });
    fs.writeFileSync("Engine.json", JSON.stringify(respEngine, null, 2));
    const paths = await locator();
    const FileName = "Audio_Video.mkv";
    new YouTubeDLX.Misc.System.FFmpeg_M3U8({
        ffmpegPath: paths.ffmpeg,
        ffprobePath: paths.ffprobe,
        Audio_M3u8_URL: respEngine.AudioOnly.Standard["Default,"].Highest?.url!,
        Video_M3u8_URL: respEngine.VideoOnly.Standard_Dynamic_Range.Highest?.url!,
        parafig: instance => {
            instance.save(FileName);
            instance.outputOptions("-c copy");
            instance.setFfmpegPath(paths.ffmpeg);
            instance.setFfprobePath(paths.ffprobe);
            instance.on("progress", progress => progbar({ ...progress, percent: progress.percent !== undefined && !isNaN(progress.percent) ? progress.percent : 0, startTime: new Date() }));
        },
    }).run();
})().catch(console.error);
