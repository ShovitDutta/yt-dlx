import dotenv from "dotenv";
import colors from "colors";
import YouTubeDLX from "..";
dotenv.config();
console.clear();
async function downloadVideo() {
    try {
        console.log(colors.italic.green("@info:"), "Attempting to download video 'Dil Darbadar'...");
        const outputPath = await YouTubeDLX.Video.Highest({ query: "Dil Darbadar", useTor: true, verbose: true });
        console.log(colors.italic.green("@data:"), "Download complete! File saved at:", outputPath);
    } catch (error: any) {
        console.error(colors.italic.red("@error:"), "An error occurred during the download:", error instanceof Error ? error.message : String(error));
    }
}
downloadVideo();
