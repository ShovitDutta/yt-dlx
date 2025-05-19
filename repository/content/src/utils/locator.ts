// Suggestion: Add JSDoc comments to the functions, explaining their purpose, parameters, and return values. Also, consider adding more robust error handling and logging to help diagnose issues with locating the executables. The `getBinaryPath` function could also benefit from JSDoc comments.
import colors from "colors";
import * as path from "path";
import * as fsx from "fs-extra";
async function getBinaryPath(execName: string): Promise<string | null> {
    try {
        const nodeModulesPath = path.join(process.cwd(), "node_modules", "yt-dlx", "package");
        const binaryPath = path.join(nodeModulesPath, execName + (process.platform === "win32" ? ".exe" : process.platform === "linux" ? ".bin" : ""));
        try {
            await fsx.access(binaryPath, fsx.constants.X_OK);
            return binaryPath;
        } catch {
            const devPath = path.join(process.cwd(), "package", execName + (process.platform === "win32" ? ".exe" : process.platform === "linux" ? ".bin" : ""));
            await fsx.access(devPath, fsx.constants.X_OK);
            return devPath;
        }
    } catch {
        return null;
    }
}
export async function locator() {
    try {
        const results: { [key: string]: string } = {};
        const execNames = ["yt-dlx", "ffmpeg", "ffprobe"];
        for (const execName of execNames) {
            const execPath = await getBinaryPath(execName);
            if (execPath) results[execName] = execPath;
            else {
                console.log(colors.yellow("@warning:"), `${execName} not found in package binary directory.`);
                if (execName === "yt-dlx") console.error(colors.red("@error:"), "please run 'yarn/npm/bun/pnpm install/add yt-dlx'");
                results[execName] = "";
            }
        }
        return results;
    } catch (error) {
        console.error(colors.red("@error:"), "Error in locator function:", error);
        return {};
    }
}
