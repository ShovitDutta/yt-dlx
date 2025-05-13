import { rm } from "fs/promises";
import { join, resolve } from "path";

async function rmdir(folderPath, folders) {
  for (const folder of folders) {
    const folderToDelete = join(folderPath, folder);
    try {
      await rm(folderToDelete, {
        recursive: true,
        force: true,
      });
    } catch (err) {
      console.error("@error:", `${folder}: ${err.message}`);
    }
  }
}

rmdir(resolve(), [
  "./base/util/ffprobe.exe",
  "./base/util/ffprobe_mac",
  "./base/util/ffprobe_linux",
  "./base/util/ffmpeg.exe",
  "./base/util/ffmpeg_mac",
  "./base/util/ffmpeg_linux",
  "./base/util/ffplay.exe",
  "./base/util/ffplay_mac",
  "./base/util/ffplay_linux",
]);
