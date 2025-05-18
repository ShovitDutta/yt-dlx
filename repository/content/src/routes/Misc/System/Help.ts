import colors from "colors";
/**
 * @shortdesc Displays help information and provides a link to online documentation.
 *
 * @description This function outputs a thank you message to the console,
 * encouraging users to star the project on GitHub, and then returns a string
 * containing a help message with a URL pointing to the project's documentation website.
 * It is designed to provide users with quick access to help resources.
 *
 * The function does not take any parameters.
 *
 * @returns {Promise<string>} A Promise that resolves with a string containing the help message and documentation URL.
 *
 * @throws {Error} Throws a generic `Error` if any unexpected issue occurs during the execution of the function.
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
