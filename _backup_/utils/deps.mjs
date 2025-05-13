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
  "./base/util/cprobe_linux",
  "./base/util/cprobe_mac",
  "./base/util/cprobe.exe",
]);
