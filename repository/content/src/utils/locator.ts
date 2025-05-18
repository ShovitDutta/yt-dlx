import colors from "colors";
import * as path from "path";
import * as fsx from "fs-extra";
async function getBinaryPath(execName: string): Promise<string | null> {
    try {
        const ext = process.platform === "win32" ? ".exe" : process.platform === "linux" ? ".bin" : "";
        const nodeModulesPath = path.join(process.cwd(), "node_modules", "yt-dlx", "package");
        const binaryPath1 = path.join(nodeModulesPath, execName + ext);
        try {
            await fsx.access(binaryPath1, fsx.constants.X_OK);
            return binaryPath1;
        } catch {
            const devPath = path.join(process.cwd(), "package", execName + ext);
            await fsx.access(devPath, fsx.constants.X_OK);
            return devPath;
        }
    } catch {
        return null;
    }
}
export async function locator(): Promise<{ "yt-dlx": string; ffmpeg: string; ffprobe: string; [key: string]: string }> {
    const results: { "yt-dlx": string; ffmpeg: string; ffprobe: string; [key: string]: string } = {
        "yt-dlx": "",
        ffmpeg: "",
        ffprobe: "",
    };
    const execNames = ["yt-dlx", "ffmpeg", "ffprobe"];
    console.log(colors.cyan(" Locating external tools using original path logic..."));
    for (const execName of execNames) {
        const execPath = await getBinaryPath(execName);
        if (execPath) {
            results[execName] = execPath;
            console.log(colors.green(` ✓ Found ${execName}:`), execPath);
        } else {
            results[execName] = "";
            console.log(colors.yellow("@warning:"), `${execName} not found in expected package binary directory.`);
            if (execName === "yt-dlx") console.error(colors.red("@error:"), "please run 'yarn/npm/bun/pnpm install/add yt-dlx'");
        }
    }
    if (results.ffmpeg === "" || results.ffprobe === "") {
        console.warn(colors.yellow("@warning:"), "One or more essential external tools (ffmpeg, ffprobe) were not found using the original path logic.");
        console.warn(colors.yellow("@warning:"), `Looked relative to ${process.cwd()} in locations like 'node_modules/yt-dlx/package/' and 'package/'.`);
    } else console.log(colors.green("All essential external tools located using original path logic."));
    return results;
}
