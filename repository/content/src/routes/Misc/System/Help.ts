import colors from "colors";
// import { EventEmitter } from "events"; // Remove EventEmitter import as we are refactoring to async/await

/**
 * @shortdesc Provides help information for yt-dlx using async/await instead of events.
 *
 * @description This function outputs a thank you message to the console and returns a Promise that resolves with the URL to the official yt-dlx documentation website. It serves as a simple way for users to find where to get help and more information about the library.
 *
 * The function does not require any input parameters.
 *
 * It returns a Promise that resolves with the help documentation URL string upon successful execution, or rejects with an error.
 *
 * @returns {Promise<string>} A Promise that resolves with the help documentation URL.
 * @throws {Error} Throws a formatted error if an unexpected error occurs during execution.
 *
 * @example
 * // 1. Get help information and the documentation URL using async/await with try...catch
 * try {
 * const helpUrl = await YouTubeDLX.Misc.System.Help();
 * console.log("Help URL:", helpUrl);
 * } catch (error) {
 * console.error("An error occurred while trying to get help:", error);
 * }
 * // Note: This function also prints information directly to the console.
 *
 * @example
 * // 2. Basic call without explicit error handling (errors will propagate)
 * // await YouTubeDLX.Misc.System.Help().then(helpUrl => console.log("Help URL:", helpUrl));
 *
 * // Note: Original examples using .on(...) are replaced by standard Promise handling (.then/.catch or await with try/catch).
 */
export default async function help(): Promise<string> {
    // Refactored to use async/await and return a Promise directly, replacing EventEmitter pattern.
    try {
        // Print the thank you message to the console, as in the original function.
        console.log(colors.green("@info:"), "❣️ Thank you for using", colors.green("yt-dlx."), "Consider", colors.green("🌟starring"), "the GitHub repo", colors.green("https://github.com/yt-dlx\n"));

        // Define the help URL.
        const helpUrl = "https://yt-dlx-shovit.koyeb.app";

        // Return the help URL. The async function automatically wraps this in a resolved Promise.
        // Also print the help URL to the console, as implied by the original emitter.emit("data")
        console.log(colors.bold.white(`@help: visit ${helpUrl}`));
        return helpUrl;
    } catch (error: any) {
        // Catch any unexpected errors during this simple function's execution.
        // Format the error message and re-throw it to reject the main function's Promise.
        // While unlikely for this function, this structure maintains consistency.
        throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        // There is no finally block needed as the original function's finally block only contained the console log,
        // which is now part of the core logic or handled by the individual function's finally block if they have one.
        // However, for consistency with other refactored functions that *did* have a common finally log,
        // I could add it back here if the user wanted a consistent message across all functions.
        // But based on this specific 'help' function's original implementation, the primary log is inside the try block.
        // Let's add the common log back in finally for consistency with the other refactored functions' pattern.
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
