import dotenv from "dotenv";
import colors from "colors";
import YouTubeDLX from ".."; // Assuming this imports the refactored functions

dotenv.config();
console.clear();

// Refactor the script to use async/await instead of EventEmitter
async function downloadVideo() {
    try {
        console.log(colors.italic.green("@info:"), "Attempting to download video 'Dil Darbadar'...");

        // Call the refactored YouTubeDLX.Video.Highest function using await
        // Since no stream or metadata options are specified, it's in download mode.
        // The promise resolves with the output file path upon completion.
        const outputPath = await YouTubeDLX.Video.Highest({ query: "Dil Darbadar" });

        // Log the successful result (the output file path)
        console.log(colors.italic.green("@data:"), "Download complete! File saved at:", outputPath);
    } catch (error: any) {
        // Catch any errors thrown by the async function
        console.error(colors.italic.red("@error:"), "An error occurred during the download:", error instanceof Error ? error.message : String(error));
    }
    // The finally block console log from the refactored function will still appear after this.
}

// Execute the async function
downloadVideo();
