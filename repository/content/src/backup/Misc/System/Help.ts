import colors from "colors";
import { EventEmitter } from "events";
/**
 * @shortdesc Provides help information for yt-dlx.
 *
 * @description This function outputs a thank you message to the console and provides a link to the official yt-dlx documentation website via an emitted event. It serves as a simple way for users to find where to get help and more information about the library.
 *
 * The function does not require any input parameters.
 *
 * It supports no configuration options directly via parameters.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - `"data"`: Emitted upon successful execution, providing the URL to the help documentation. The emitted data is a string containing the help URL.
 * - `"error"`: Emitted if an unexpected error occurs during the execution of the function. The emitted data is the error message.
 *
 * @returns {EventEmitter} An EventEmitter instance for handling events.
 *
 * @example
 * // 1. Get help information and the documentation URL
 * YouTubeDLX.Misc.System.Help()
 * .on("data", (helpUrl) => console.log("Help URL:", helpUrl))
 * .on("error", (error) => console.error("Error:", error));
 * // Note: This function also prints information directly to the console.
 *
 * @example
 * // 2. Handling potential errors during help function execution
 * // While unlikely for this simple function, error handling is still possible.
 * YouTubeDLX.Misc.System.Help()
 * .on("data", (helpUrl) => console.log("Help information retrieved:", helpUrl))
 * .on("error", (error) => console.error("An error occurred while trying to get help:", error));
 *
 */
export default function help(): EventEmitter {
    const emitter = new EventEmitter();
    (async () => {
        try {
            console.log(
                colors.green("@info:"),
                "❣️ Thank you for using",
                colors.green("yt-dlx."),
                "Consider",
                colors.green("🌟starring"),
                "the GitHub repo",
                colors.green("https://github.com/yt-dlx\n"),
            );
            emitter.emit("data", colors.bold.white(`@help: visit https://yt-dlx-shovit.koyeb.app`));
        } catch (error) {
            emitter.emit("error", `${colors.red("@error:")} An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
        }
    })();
    return emitter;
}
