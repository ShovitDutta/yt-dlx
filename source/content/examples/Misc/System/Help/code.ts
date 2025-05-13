/**
 * @shortdesc Provides help information for yt-dlx.
 * @description This function outputs a thank you message to the console and provides a link to the official yt-dlx documentation website via an emitted event. It serves as a simple way for users to find where to get help and more information about the library.
 *
 * The function does not require any input parameters.
 *
 * It supports no configuration options directly via parameters.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - "data": Emitted upon successful execution, providing the URL to the help documentation. The emitted data is a string containing the help URL.
 * - "error": Emitted if an unexpected error occurs during the execution of the function. The emitted data is the error message.
 *
 * @returns {EventEmitter} An EventEmitter instance for handling events.
 *
 */

import YouTubeDLX from "yt-dlx";

// 1. Get help information and the documentation URL
YouTubeDLX.Misc.System.Help()
  .on("data", helpUrl => console.log("Help URL:", helpUrl))
  .on("error", error => console.error("Error:", error));
// Note: This function also prints information directly to the console.

// 2. Handling potential errors during help function execution
// While unlikely for this simple function, error handling is still possible.
YouTubeDLX.Misc.System.Help()
  .on("data", helpUrl => console.log("Help information retrieved:", helpUrl))
  .on("error", error => console.error("An error occurred while trying to get help:", error));
