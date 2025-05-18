import colors from "colors";
/**
 * @shortdesc Provides help information for yt-dlx, including a link to the documentation website.
 *
 * @description This asynchronous function outputs a thank you message to the console,
 * encourages starring the GitHub repository, and returns a formatted string containing
 * a help message and a URL pointing to the official documentation or website for yt-dlx.
 * It's designed to provide users with a quick way to find help and contribute to the project.
 *
 * The function does not require any parameters.
 *
 * @returns {Promise<string>} A Promise that resolves with a formatted string containing the help message and documentation URL. The string includes console color formatting.
 *
 * @throws {Error} Throws a generic `Error` if any unexpected issue occurs during the function's execution, although the core logic is very simple and unlikely to fail.
 *
 * @example
 * // 1. Running Help Example
 * try {
 * const result = await help();
 * console.log("Help URL:", result);
 * } catch (error) {
 * console.error("Help Error:", error instanceof Error ? error.message : error);
 * }
 */
export default async function help(): Promise<string> {
    try {
        console.log(colors.green("@info:"), "❣️ Thank you for using", colors.green("yt-dlx."), "Consider", colors.green("🌟starring"), "the GitHub repo", colors.green("https://github.com/yt-dlx\n"));
        return colors.bold.white(`@help: visit https://yt-dlx-shovit.koyeb.app`);
    } catch (error: any) {
        const errorMessage = `${colors.red("@error:")} An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
}
(async () => {
    try {
        console.log("--- Running Help Example ---");
        const result = await help();
        console.log("Help URL:", result);
    } catch (error) {
        console.error("Help Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
