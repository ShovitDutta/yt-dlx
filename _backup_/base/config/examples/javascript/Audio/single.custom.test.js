// =============================[ USING YT-DLX'S DOWNLOAD MACHANISM ]=============================
//
const YouTube = require("yt-dlx");
const colors = require("colors");
(async () => {
  try {
    const resolutions = ["high", "medium", "low", "ultralow"];
    for (const resolution of resolutions) {
      await YouTube.default.AudioOnly.Single.Custom({
        resolution,
        stream: false,
        verbose: true,
        useTor: false,
        output: "public/audio",
        query: "video-NAME/ID/URL",
      });
    }
  } catch (error) {
    console.error(colors.red(error.message));
  }
})();
//
// =============================[ USING STREAMING TO SAVE THE FILE ]=============================
//
const fs = require("fs");
(async () => {
  try {
    const resolutions = ["high", "medium", "low", "ultralow"];
    for (const resolution of resolutions) {
      const result = await YouTube.default.AudioOnly.Single.Custom({
        resolution,
        stream: false,
        verbose: true,
        useTor: false,
        output: "public/audio",
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
  } catch (error) {
    console.error(colors.red(error.message));
  }
})();
//
// =============================[ USING STREAMING TO PIPE THE FILE ]=============================
//
const express = require("express");
(async () => {
  try {
    const server = express();
    server.get("/audio/:resolution/:query", async (req, res) => {
      try {
        const queryParam = req.params.query;
        const resparam = req.params.resolution;
        const resolutions = ["high", "medium", "low", "ultralow"];
        if (!resolutions.includes(resparam)) {
          res.status(404).send("Invalid resolution parameter");
          return;
        }
        const result = await YouTube.default.AudioOnly.Single.Custom({
          stream: true,
          verbose: true,
          useTor: false,
          query: queryParam,
          resolution: resparam,
        });
        if (result && "ffmpeg" in result && "filename" in result) {
          result.ffmpeg.pipe(res, { end: true });
        } else res.status(404).send("ffmpeg or filename not found!");
      } catch (error) {
        res.status(500).send(error.message);
      }
    });
    server.listen(3000, () => {
      console.log(colors.blue("@server:"), "running on port 3000");
    });
  } catch (error) {
    console.error(colors.red(error.message));
  }
})();
//
// ========================================================================================
