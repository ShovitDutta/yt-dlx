import { locator } from "../utils/Locator";
import progbar from "../utils/ProgBar";
import M3u8 from "../utils/M3u8";
import dotenv from "dotenv";
import YouTubeDLX from "..";
import fs from "fs";
dotenv.config();
console.clear();
(async () => {
    const respEngine = await YouTubeDLX.Misc.Video.Extract({ Query: "1 hour lofi" });
    fs.writeFileSync("Engine.json", JSON.stringify(respEngine, null, 2));
    const paths = await locator();
    const main = new M3u8({
        Verbose: true,
        FFmpegPath: paths.ffmpeg,
        FFprobePath: paths.ffprobe,
        Audio_M3u8_URL: respEngine.AudioOnly.Standard["Default,"].Highest?.url!,
        Video_M3u8_URL: respEngine.VideoOnly.Standard_Dynamic_Range.Highest?.url!,
        configure: instance => {
            instance.outputFormat("matroska");
            instance.outputOptions("-c copy");
            const sanitizedFileName = respEngine.MetaData.title?.toString().replace(/[^\w-]/g, "_") + ".mkv";
            instance.save(sanitizedFileName);
            instance.on("progress", progress => progbar({ ...progress, percent: progress.percent !== undefined && !isNaN(progress.percent) ? progress.percent : 0, startTime: new Date() }));
        },
    });
    main.run();
})().catch(console.error);
