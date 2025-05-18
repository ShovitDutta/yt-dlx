import colors from "colors"; // Assuming 'colors' is installed for colored output
import * as path from "path";
import * as fsx from "fs-extra"; // Assuming 'fs-extra' is installed

async function getBinaryPath(execName: string): Promise<string | null> {
    const isWindows = process.platform === "win32";
    const ext = isWindows ? ".exe" : process.platform === "linux" ? ".bin" : ""; // Keep original extension logic
    // 1. Check specific relative paths (original logic)

    try {
        const nodeModulesPath = path.join(process.cwd(), "node_modules", "yt-dlx", "package");
        const binaryPath1 = path.join(nodeModulesPath, execName + ext);
        try {
            await fsx.access(binaryPath1, fsx.constants.X_OK);
            return binaryPath1; // Found in node_modules relative path
        } catch {
            const devPath = path.join(process.cwd(), "package", execName + ext);
            await fsx.access(devPath, fsx.constants.X_OK);
            return devPath; // Found in development relative path
        }
    } catch (e) {
        // These relative paths didn't work, continue to check PATH
        // console.warn(`Failed to find ${execName} in relative paths: ${e.message}`); // Optional: log why relative paths failed
    } // 2. Check system PATH

    const pathEnv = process.env.PATH;
    if (pathEnv) {
        const pathDirs = pathEnv.split(path.delimiter); // Use path.delimiter for platform-specific splitting
        // List of potential extensions to check on Windows (empty for others)

        const extensions = isWindows ? ["", ".exe", ".cmd", ".bat", ".com"] : [""];

        for (const dir of pathDirs) {
            for (const currentExt of extensions) {
                const fullPath = path.join(dir, execName + currentExt);
                try {
                    await fsx.access(fullPath, fsx.constants.X_OK);
                    return fullPath; // Found in PATH
                } catch {
                    // Not found or not executable in this path directory
                }
            }
        }
    } // Not found in relative paths or PATH

    return null;
}

export async function locator(): Promise<{ "yt-dlx": string; ffmpeg: string; ffprobe: string; [key: string]: string }> {
    const results: { "yt-dlx": string; ffmpeg: string; ffprobe: string; [key: string]: string } = {
        "yt-dlx": "",
        ffmpeg: "",
        ffprobe: "",
    };
    const execNames = ["yt-dlx", "ffmpeg", "ffprobe"];

    console.log(colors.cyan(" Locating external tools...")); // Updated log message
    console.log(colors.cyan(` Searching in relative paths and system PATH relative to ${process.cwd()}`)); // More descriptive log

    for (const execName of execNames) {
        const execPath = await getBinaryPath(execName);
        if (execPath) {
            results[execName] = execPath;
            console.log(colors.green(` ✓ Found ${execName}:`), execPath);
        } else {
            results[execName] = "";
            console.log(colors.red(` ✗ ${execName} not found.`)); // Changed warning to error for clarity
            if (execName === "yt-dlx") {
                console.error(colors.red("@error:"), "yt-dlx executable not found. Make sure it's installed correctly or available in your system's PATH.");
            } else if (execName === "ffmpeg" || execName === "ffprobe") {
                console.error(colors.red("@error:"), `${execName} executable not found. Make sure FFmpeg (which includes ffprobe) is installed and accessible in your system's PATH.`);
            }
        }
    }

    // Final summary based on results
    if (results.ffmpeg === "" || results.ffprobe === "") {
        console.error(colors.red("@error:"), "One or more essential external tools (ffmpeg, ffprobe) were not found."); // Changed warning to error
        console.error(colors.red("@error:"), "Please ensure FFmpeg is installed correctly and its executables are available in your system's PATH environment variable.");
    } else {
        console.log(colors.green("All essential external tools located successfully."));
    }

    return results;
}

// Example Usage (from your original test file)
/*
import YouTubeDLX from ".."; // Adjust path as needed
import dotenv from "dotenv";
// import colors from "colors"; // Already imported in the locator function
// import { locator } from "../utils/locator"; // Already defined above
dotenv.config();
console.clear();
(async () => {
    const paths = await locator();
    console.log("\nFinal Paths Object:", paths); // Added label for clarity
})();
*/
