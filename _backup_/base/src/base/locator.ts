import * as path from "path";
import * as fsx from "fs-extra";

async function findRootDirectory(currentPath: string): Promise<string | null> {
  const markerFile = "package.json";
  try {
    const files = await fsx.readdir(currentPath);
    if (files.includes(markerFile)) return currentPath;
    const parentDir = path.resolve(currentPath, "..");
    if (parentDir === currentPath) return null;
    else return findRootDirectory(parentDir);
  } catch {
    return null;
  }
}

async function scanner(directory: string, execName: string): Promise<string | null> {
  try {
    const files = await fsx.readdir(directory);
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = await fsx.stat(filePath);
      if (stat.isDirectory()) {
        const result = await scanner(filePath, execName);
        if (result) return result;
      } else {
        if (file.toLowerCase() === execName.toLowerCase() || file.toLowerCase() === execName.toLowerCase() + ".exe") {
          return filePath;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function locator() {
  try {
    const rootDirectory = await findRootDirectory(__dirname);
    if (!rootDirectory) return {};
    const results: { [key: string]: string } = {};
    for (const execName of ["ffmpeg", "ffprobe", "cprobe"]) {
      const execPath = await scanner(rootDirectory, execName);
      results[execName] = execPath || "";
    }
    return results;
  } catch (error) {
    return {};
  }
}
