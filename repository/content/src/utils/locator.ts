import colors from "colors";
import * as path from "path";
import * as fsx from "fs-extra";
import { promisify } from "util";
import { exec } from "child_process";
const execPromise = promisify(exec);
async function getBinaryPath(execName: string): Promise<string | null> {
    const isWindows = process.platform === "win32";
    const extensions = isWindows ? ["", ".exe", ".cmd", ".bat", ".com"] : [""];
    try {
        const ext = isWindows ? ".exe" : process.platform === "linux" ? ".bin" : "";
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
    } catch (e) {}
    const pathEnv = process.env.PATH;
    if (pathEnv) {
        const pathDirs = pathEnv.split(path.delimiter);
        for (const dir of pathDirs) {
            for (const currentExt of extensions) {
                const fullPath = path.join(dir, execName + currentExt);
                try {
                    await fsx.access(fullPath, fsx.constants.X_OK);
                    return fullPath;
                } catch {}
            }
        }
    }
    return null;
}
export async function locator(): Promise<{ "yt-dlx": string; ffmpeg: string; ffprobe: string; [key: string]: string }> {
    const results: { "yt-dlx": string; ffmpeg: string; ffprobe: string; [key: string]: string } = { "yt-dlx": "", ffmpeg: "", ffprobe: "", ytprobe: "", tor_executable: "", tor_data_directory: "" };
    console.log(colors.cyan(" Locating external tools by running yt-dlx..."));
    const ytdlxPath = await getBinaryPath("yt-dlx");
    if (!ytdlxPath) {
        results["yt-dlx"] = "";
        console.error(colors.red(` ✗ yt-dlx executable not found.`));
        console.error(colors.red("@error:"), "yt-dlx executable not found using relative paths or system PATH. Make sure it's installed correctly.");
        console.error(colors.red("@error:"), "Cannot locate ffmpeg, ffprobe, etc. because yt-dlx was not found.");
        return results;
    }
    results["yt-dlx"] = ytdlxPath;
    console.log(colors.green(` ✓ Found yt-dlx:`), ytdlxPath);
    console.log(colors.cyan(` Running "${ytdlxPath}" to get paths...`));
    try {
        const { stdout, stderr } = await execPromise(`"${ytdlxPath}"`);
        if (stderr) {
            console.warn(colors.yellow(" Warning from yt-dlx when getting paths:"), stderr);
        }
        let toolPaths: any = {};
        try {
            toolPaths = JSON.parse(stdout);
        } catch (jsonError) {
            console.error(colors.red("@error:"), "Failed to parse JSON output from yt-dlx:", jsonError);
            console.error(colors.red(" Raw stdout:"), stdout.substring(0, 500) + (stdout.length > 500 ? "..." : ""));
            console.error(colors.red(" Raw stderr:"), stderr.substring(0, 500) + (stderr.length > 500 ? "..." : ""));
            console.error(colors.red("@error:"), "Could not reliably determine paths for ffmpeg, ffprobe, etc. from yt-dlx output.");
            return results;
        }
        if (toolPaths.ffmpeg && typeof toolPaths.ffmpeg === "string" && toolPaths.ffmpeg !== "Not found in bundle") {
            results.ffmpeg = toolPaths.ffmpeg;
        } else {
            console.error(colors.red(` ✗ ffmpeg not found via yt-dlx output.`));
            console.error(colors.red("@error:"), "Please ensure FFmpeg is included in the yt-dlx bundle or accessible to the bundled executable.");
        }
        if (toolPaths.ffprobe && typeof toolPaths.ffprobe === "string" && toolPaths.ffprobe !== "Not found in bundle") {
            results.ffprobe = toolPaths.ffprobe;
        } else {
            console.error(colors.red(` ✗ ffprobe not found via yt-dlx output.`));
            console.error(colors.red("@error:"), "Please ensure FFmpeg (which includes ffprobe) is included in the yt-dlx bundle or accessible to the bundled executable.");
        }
        if (toolPaths.ytprobe && typeof toolPaths.ytprobe === "string" && toolPaths.ytprobe !== "Not found in bundle") {
            results.ytprobe = toolPaths.ytprobe;
        } else {
            console.warn(colors.yellow(` @warning: ytprobe not found via yt-dlx output. This might affect some features.`));
        }
        if (toolPaths.tor_executable && typeof toolPaths.tor_executable === "string" && toolPaths.tor_executable !== "Not found in bundle") {
            results.tor_executable = toolPaths.tor_executable;
        } else {
            console.warn(colors.yellow(` @warning: Tor executable not found via yt-dlx output. Tor proxy features will not work.`));
        }
        if (toolPaths.tor_data_directory && typeof toolPaths.tor_data_directory === "string" && toolPaths.tor_data_directory !== "Not found in bundle") {
            results.tor_data_directory = toolPaths.tor_data_directory;
        } else {
            console.warn(colors.yellow(` @warning: Tor data directory not found via yt-dlx output. Tor proxy features will not work.`));
        }
    } catch (execError: any) {
        console.error(colors.red("@error:"), `Failed to run yt-dlx executable at "${ytdlxPath}" to get paths:`, execError.message);
        console.error(colors.red("@error:"), "Cannot locate ffmpeg, ffprobe, etc. due to execution failure.");
        results.ffmpeg = "";
        results.ffprobe = "";
        results.ytprobe = "";
        results.tor_executable = "";
        results.tor_data_directory = "";
    }
    if (results.ffmpeg === "" || results.ffprobe === "") {
        console.error(colors.red("@error:"), "One or more essential external tools (ffmpeg, ffprobe) were not found via yt-dlx output.");
        console.error(colors.red("@error:"), "Ensure your yt-dlx bundle includes FFmpeg or can access it from its runtime environment.");
    } else console.log(colors.green("All essential external tools located successfully via yt-dlx."));
    return results;
}
