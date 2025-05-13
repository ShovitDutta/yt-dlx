// =============================[ USING YT-DLX'S DOWNLOAD MACHANISM ]=============================
//
import colors from "colors";
import YouTube from "yt-dlx";
(async () => {
  try {
    const resolutions = ["144p", "240p", "360p", "480p", "720p", "1080p", "1440p", "2160p", "3072p", "4320p", "6480p", "8640p", "12000p"] as const;
    for (const resolution of resolutions) {
      await YouTube.AudioVideo.Single.Custom({
        resolution,
        stream: false,
        verbose: true,
        useTor: false,
        output: "public/mix",
        query: "video-NAME/ID/URL",
      });
    }
  } catch (error: any) {
    console.error(colors.red(error.message));
  }
})();
//
// =============================[ USING STREAMING TO SAVE THE FILE ]=============================
//
import * as fs from "fs";
(async () => {
  try {
    const resolutions = ["144p", "240p", "360p", "480p", "720p", "1080p", "1440p", "2160p", "3072p", "4320p", "6480p", "8640p", "12000p"] as const;
    for (const resolution of resolutions) {
      const result = await YouTube.AudioVideo.Single.Custom({
        resolution,
        stream: true,
        verbose: true,
        useTor: false,
        output: "public/mix",
        query: "video-NAME/ID/URL",
      });
      if (result && "ffmpeg" in result && "filename" in result) {
        result.ffmpeg.pipe(fs.createWriteStream(result.filename), {
          end: true,
        });
      } else {
        console.error(colors.red("@error:"), "ffmpeg or filename not found!");
      }
    }
  } catch (error: any) {
    console.error(colors.red(error.message));
  }
})();
//
// =============================[ USING STREAMING TO PIPE THE FILE ]=============================
//
import express from "express";
(async () => {
  try {
    const server = express();
    server.get("/mix/:resolution/:query", async (req, res) => {
      try {
        const queryParam = req.params.query;
        const resparam = req.params.resolution;
        const resolutions = ["high", "medium", "low", "ultralow"];
        if (!resolutions.includes(resparam)) {
          res.status(404).send("Invalid resolution parameter");
          return;
        }
        const result = await YouTube.AudioVideo.Single.Custom({
          stream: true,
          verbose: true,
          useTor: false,
          query: queryParam,
          resolution: resparam as any,
        });
        if (result && "ffmpeg" in result && "filename" in result) {
          result.ffmpeg.pipe(res, { end: true });
        } else res.status(404).send("ffmpeg or filename not found!");
      } catch (error: any) {
        res.status(500).send(error.message);
      }
    });
    server.listen(3000, () => {
      console.log(colors.blue("@server:"), "running on port 3000");
    });
  } catch (error: any) {
    console.error(colors.red(error.message));
  }
})();
//
// ========================================================================================
