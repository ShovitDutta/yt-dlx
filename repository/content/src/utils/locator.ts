import colors from "colors";
import * as path from "path";
import * as fsx from "fs-extra";
import { exec } from "child_process"; // Import child_process for running external commands
import { promisify } from "util"; // To use exec with await

const execPromise = promisify(exec); // Promisify exec for async usage

// Keep the getBinaryPath function as it is, it's needed to find yt-dlx itself
async function getBinaryPath(execName: string): Promise<string | null> {
    const isWindows = process.platform === "win32";
    // Check for common executable extensions on Windows
    const extensions = isWindows ? ["", ".exe", ".cmd", ".bat", ".com"] : [""];
    // The specific extensions from original logic (.exe, .bin) are included via the `ext` variable logic below,
    // but checking common windows extensions in PATH search is still valuable.

    // 1. Check specific relative paths (original logic)
    try {
        const ext = isWindows ? ".exe" : process.platform === "linux" ? ".bin" : "";
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
        // These relative paths didn't work, continue to check PATH if necessary
        // console.warn(`Failed to find ${execName} in relative paths: ${e.message}`); // Optional: log why relative paths failed
    }

    // 2. Check system PATH (Simplified check for finding yt-dlx itself if needed,
    //    the primary method now is running yt-dlx to get other paths)
    //    We still need this to find yt-dlx if it's globally installed.
    const pathEnv = process.env.PATH;
    if (pathEnv) {
        const pathDirs = pathEnv.split(path.delimiter);
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
    }

    // Not found in relative paths or PATH
    return null;
}

// Modify the main locator function to run the found yt-dlx executable
export async function locator(): Promise<{ "yt-dlx": string; ffmpeg: string; ffprobe: string; [key: string]: string }> {
    const results: { "yt-dlx": string; ffmpeg: string; ffprobe: string; [key: string]: string } = {
        "yt-dlx": "",
        ffmpeg: "",
        ffprobe: "",
        ytprobe: "", // Add ytprobe to results as the python code returns it
        tor_executable: "", // Add tor_executable
        tor_data_directory: "", // Add tor_data_directory
    };

    console.log(colors.cyan(" Locating external tools by running yt-dlx..."));

    // First, locate the yt-dlx executable itself
    const ytdlxPath = await getBinaryPath("yt-dlx");

    if (!ytdlxPath) {
        results["yt-dlx"] = "";
        console.error(colors.red(` ✗ yt-dlx executable not found.`));
        console.error(colors.red("@error:"), "yt-dlx executable not found using relative paths or system PATH. Make sure it's installed correctly.");
        // We can't find other tools if we can't run yt-dlx
        console.error(colors.red("@error:"), "Cannot locate ffmpeg, ffprobe, etc. because yt-dlx was not found.");
        return results;
    }

    results["yt-dlx"] = ytdlxPath;
    console.log(colors.green(` ✓ Found yt-dlx:`), ytdlxPath);

    // Now, run yt-dlx without arguments to get the paths of other tools
    console.log(colors.cyan(` Running "${ytdlxPath}" to get paths...`));
    try {
        // Use execPromise to run the command and capture output
        const { stdout, stderr } = await execPromise(`"${ytdlxPath}"`); // Quote path in case it has spaces

        if (stderr) {
            console.warn(colors.yellow(" Warning from yt-dlx when getting paths:"), stderr);
        }

        // Attempt to parse the stdout as JSON
        let toolPaths: any = {};
        try {
            toolPaths = JSON.parse(stdout);
            // console.log("Parsed paths from yt-dlx:", toolPaths); // Debugging line
        } catch (jsonError) {
            console.error(colors.red("@error:"), "Failed to parse JSON output from yt-dlx:", jsonError);
            console.error(colors.red(" Raw stdout:"), stdout.substring(0, 500) + (stdout.length > 500 ? "..." : "")); // Print start of stdout
            console.error(colors.red(" Raw stderr:"), stderr.substring(0, 500) + (stderr.length > 500 ? "..." : "")); // Print start of stderr if any

            // Since we failed to parse, we cannot find other tools reliably
            console.error(colors.red("@error:"), "Could not reliably determine paths for ffmpeg, ffprobe, etc. from yt-dlx output.");
            // Return results with only yt-dlx path found so far
            return results;
        }

        // Transfer found paths from the parsed JSON to our results object
        // Check if the key exists and the value is not the "Not found in bundle" string
        if (toolPaths.ffmpeg && typeof toolPaths.ffmpeg === "string" && toolPaths.ffmpeg !== "Not found in bundle") {
            results.ffmpeg = toolPaths.ffmpeg;
            console.log(colors.green(` ✓ Found ffmpeg via yt-dlx:`), results.ffmpeg);
        } else {
            console.error(colors.red(` ✗ ffmpeg not found via yt-dlx output.`));
            console.error(colors.red("@error:"), "Please ensure FFmpeg is included in the yt-dlx bundle or accessible to the bundled executable.");
        }

        if (toolPaths.ffprobe && typeof toolPaths.ffprobe === "string" && toolPaths.ffprobe !== "Not found in bundle") {
            results.ffprobe = toolPaths.ffprobe;
            console.log(colors.green(` ✓ Found ffprobe via yt-dlx:`), results.ffprobe);
        } else {
            console.error(colors.red(` ✗ ffprobe not found via yt-dlx output.`));
            console.error(colors.red("@error:"), "Please ensure FFmpeg (which includes ffprobe) is included in the yt-dlx bundle or accessible to the bundled executable.");
        }

        if (toolPaths.ytprobe && typeof toolPaths.ytprobe === "string" && toolPaths.ytprobe !== "Not found in bundle") {
            results.ytprobe = toolPaths.ytprobe;
            console.log(colors.green(` ✓ Found ytprobe via yt-dlx:`), results.ytprobe);
        } else {
            console.warn(colors.yellow(` @warning: ytprobe not found via yt-dlx output. This might affect some features.`));
        }

        if (toolPaths.tor_executable && typeof toolPaths.tor_executable === "string" && toolPaths.tor_executable !== "Not found in bundle") {
            results.tor_executable = toolPaths.tor_executable;
            console.log(colors.green(` ✓ Found tor executable via yt-dlx:`), results.tor_executable);
        } else {
            console.warn(colors.yellow(` @warning: Tor executable not found via yt-dlx output. Tor proxy features will not work.`));
        }

        if (toolPaths.tor_data_directory && typeof toolPaths.tor_data_directory === "string" && toolPaths.tor_data_directory !== "Not found in bundle") {
            results.tor_data_directory = toolPaths.tor_data_directory;
            console.log(colors.green(` ✓ Found tor data directory via yt-dlx:`), results.tor_data_directory);
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
    } else {
        console.log(colors.green("All essential external tools located successfully via yt-dlx."));
    }
    return results;
}
