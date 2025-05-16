import colors from "colors";
import * as path from "path";
import * as fsx from "fs-extra"; // Assuming fs-extra provides promise-based or async file system functions

/**
 * Attempts to find the path to a specified executable within known local binary directories
 * (e.g., within node_modules/yt-dlx/package or a local package directory) and checks if it's executable.
 * Uses asynchronous file system access checks (`fs-extra.access`).
 *
 * @param execName The name of the executable to find (e.g., "yt-dlx", "ffmpeg", "ffprobe").
 * @returns A Promise that resolves with the absolute path to the executable if found and executable, otherwise resolves with null.
 */
async function getBinaryPath(execName: string): Promise<string | null> {
    const nodeModulesPath = path.join(process.cwd(), "node_modules", "yt-dlx", "package");
    const devPath = path.join(process.cwd(), "package");

    const binaryExt = process.platform === "win32" ? ".exe" : process.platform === "linux" ? ".bin" : "";
    const binaryName = execName + binaryExt;

    const path1 = path.join(nodeModulesPath, binaryName);
    const path2 = path.join(devPath, binaryName);

    try {
        // Attempt to access the first path and check for executability using await
        await fsx.access(path1, fsx.constants.X_OK);
        return path1; // Return the first path if successful
    } catch {
        try {
            // If the first path fails, attempt the second path using await
            await fsx.access(path2, fsx.constants.X_OK);
            return path2; // Return the second path if successful
        } catch {
            // If second path also fails access check
            return null; // Return null indicating not found/executable in expected locations
        }
    }
}

/**
 * Locates the necessary executable binaries ("yt-dlx", "ffmpeg", "ffprobe") by searching predefined paths using async operations.
 * Calls `getBinaryPath` for each executable name and compiles the results.
 * Logs warnings/errors for executables that are not found or not executable in the expected locations.
 *
 * @returns A Promise that resolves with an object mapping executable names to their found absolute paths.
 * If a binary is not found or not executable, its value in the object will be an empty string ("").
 * Returns an empty object `{}` in case of an unexpected error during the location process.
 */
export async function locator(): Promise<{ [key: string]: string }> {
    try {
        const results: { [key: string]: string } = {};
        const execNames = ["yt-dlx", "ffmpeg", "ffprobe"];

        for (const execName of execNames) {
            // Await the result of the async function call to get the executable path
            const execPath = await getBinaryPath(execName);

            if (execPath) {
                results[execName] = execPath;
            } else {
                console.log(colors.yellow("@warning:"), `${execName} not found in package binary directory.`);
                if (execName === "yt-dlx") {
                    console.error(colors.red("@error:"), "please run 'yarn/npm/bun/pnpm install/add yt-dlx'");
                }
                results[execName] = ""; // Assign empty string if not found
            }
        }
        return results;
    } catch (error) {
        // Catch any unexpected errors during the loop or setup phase
        console.error(colors.red("@error:"), "Error in locator function:", error);
        return {}; // Return an empty object to signify failure in the locator process
    }
}
