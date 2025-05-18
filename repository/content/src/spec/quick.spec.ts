import YouTubeDLX from "..";
import dotenv from "dotenv";
import colors from "colors";
dotenv.config();
console.clear();
(async () => {
    const query = "test query or url";
    try {
        const result = await YouTubeDLX.Audio.Lowest({ query, output: "./output", useTor: true, verbose: true, filter: "vaporwave", showProgress: true });
        if ("outputPath" in result) console.log("\nDownload with All Options finished:", result.outputPath);
    } catch (error) {
        console.error("\nDownload with All Options Error:", error instanceof Error ? error.message : error);
    }
})();
