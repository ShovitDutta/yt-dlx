import YouTubeDLX from "..";
import dotenv from "dotenv";
import ffmpeg from "fluent-ffmpeg";
import { locator } from "../utils/locator";
dotenv.config();
console.clear();
(async () => {
    try {
        const paths = await locator();
        const response = await YouTubeDLX.Misc.Video.Extract({ query: "weeknd drive" });
        if (!response.data || !response.data.ManifestHigh || response.data.ManifestHigh.length === 0) {
            console.error("No ManifestHigh data found in the response.");
            return;
        }
        ffmpeg()
            .setFfprobePath(paths.ffprobe)
            .setFfmpegPath(paths.ffmpeg)
            .addInput(response.data.BestAudioHigh.url)
            .addInput(response.data.ManifestHigh[response.data.ManifestHigh.length - 1].url)
            .output("manifest_url_video_only.mkv")
            .withOutputFormat("matroska")
            .outputOptions(["-c:v", "copy", "-c:a", "copy", "-bsf:a", "aac_adtstoasc"])
            .on("progress", progress => {
                process.stdout.write(`\x1b[2K\rDownloading: ${progress.timemark} - ${progress.percent ? progress.percent.toFixed(2) + "%" : "N/A"}`);
            })
            .on("end", () => {
                process.stdout.write("\n");
                console.log("Video-only download complete!");
            })
            .on("error", (err, stdout, stderr) => {
                process.stdout.write("\n");
                console.error(`FFmpeg Error: ${err.message}`);
                console.error(`FFmpeg stdout: ${stdout}`);
                console.error(`FFmpeg stderr: ${stderr}`);
            })
            .run();
    } catch (error) {
        console.error("An error occurred:", error);
    }
})();
