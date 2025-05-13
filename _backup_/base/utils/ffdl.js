const axios = require("axios");
const { join } = require("path");
const { createWriteStream, existsSync } = require("fs");

const binDL = async (url, filepath, binaryName) => {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });
    if (response.status !== 200) {
      throw new Error(`@error: ${response.statusText}`);
    }
    const tSize = parseInt(response.headers["content-length"], 10);
    const writer = createWriteStream(filepath);
    let dSize = 0;
    response.data.on("data", chunk => {
      dSize += chunk.length;
      const progress = Math.round((dSize / tSize) * 100);
      process.stdout.write(`@${binaryName}: ${progress}%\r`);
    });
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    console.error(`@error: ${binaryName}: ${error.message}`);
  }
};

(async () => {
  const binaries = [
    {
      name: "ffmpeg.exe",
      url: "https://github.com/yt-dlx/yt-dlx/releases/latest/download/ffmpeg.exe",
    },
    {
      name: "ffprobe.exe",
      url: "https://github.com/yt-dlx/yt-dlx/releases/latest/download/ffprobe.exe",
    },
  ];

  for (const binary of binaries) {
    const filepath = join(__dirname, binary.name);
    if (!existsSync(filepath)) await binDL(binary.url, filepath, binary.name);
  }
})();
