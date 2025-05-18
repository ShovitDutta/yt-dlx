import YouTubeDLX from "../../../";
import dotenv from "dotenv";
import colors from "colors";
import { createWriteStream } from "fs";

dotenv.config();
console.clear();

(async () => {
    try {
        console.log("--- Running Basic Download Example ---");
        const result = await YouTubeDLX.Audio.Custom({ query: "your search query or url", resolution: "high" });
        if ("outputPath" in result) console.log("Basic Download finished:", result.outputPath);
    } catch (error) {
        console.error("Basic Download Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Download with Output and Filter Example ---");
        const result = await YouTubeDLX.Audio.Custom({ query: "your search query or url", output: "./custom_downloads", filter: "bassboost", resolution: "medium" });
        if ("outputPath" in result) console.log("Download with Output and Filter finished:", result.outputPath);
    } catch (error) {
        console.error("Download with Output and Filter Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Download with All Options Example ---");
        const result = await YouTubeDLX.Audio.Custom({ query: "your search query or url", resolution: "low", output: "./full_downloads", useTor: true, verbose: true, filter: "echo", showProgress: true });
        if ("outputPath" in result) console.log("\nDownload with All Options finished:", result.outputPath);
    } catch (error) {
        console.error("\nDownload with All Options Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Fetch Metadata Only Example ---");
        const result = await YouTubeDLX.Audio.Custom({ query: "your search query or url", resolution: "high", metadata: true });
        if ("metadata" in result) console.log("Metadata Only:", result.metadata);
    } catch (error) {
        console.error("Metadata Only Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Basic Stream Example ---");
        const result = await YouTubeDLX.Audio.Custom({ query: "your search query or url", resolution: "low", stream: true });
        if ("stream" in result && result.stream) {
            console.log("Basic Streaming started. Piping to basic_stream.avi...");
            const outputStream = createWriteStream("basic_stream.avi");
            result.stream.pipe(outputStream);
            await new Promise<void>((resolve, reject) => {
                result.stream.on("end", () => {
                    console.log("Basic Streaming finished.");
                    resolve();
                });
                result.stream.on("error", error => {
                    console.error("Basic Stream error:", error.message);
                    result.stream.destroy(error);
                    reject(error);
                });
            });
        }
    } catch (error) {
        console.error("Basic Stream Setup Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Stream with Filter Example ---");
        const result = await YouTubeDLX.Audio.Custom({ query: "your search query or url", resolution: "medium", stream: true, filter: "vaporwave" });
        if ("stream" in result && result.stream) {
            console.log("Stream with Filter started. Piping to filtered_stream.avi...");
            const outputStream = createWriteStream("filtered_stream.avi");
            result.stream.pipe(outputStream);
            await new Promise<void>((resolve, reject) => {
                result.stream.on("end", () => {
                    console.log("Stream with Filter finished.");
                    resolve();
                });
                result.stream.on("error", error => {
                    console.error("Stream with Filter error:", error.message);
                    result.stream.destroy(error);
                    reject(error);
                });
            });
        }
    } catch (error) {
        console.error("Stream with Filter Setup Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Invalid Options Example (Metadata and Output) ---");
        await YouTubeDLX.Audio.Custom({ query: "your search query or url", resolution: "high", metadata: true, output: "./should_fail_dir" });
        console.log("This should not be reached - Invalid Options Example.");
    } catch (error) {
        console.error("Expected Error (Metadata and Output):", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Zod Validation Error Example (Invalid Resolution) ---");
        await YouTubeDLX.Audio.Custom({ query: "your search query or url", resolution: "superhigh" as any });
        console.log("This should not be reached - Zod Validation Error Example.");
    } catch (error) {
        console.error("Expected Zod Error (Invalid Resolution):", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    console.log("\nAll Audio Custom tests finished successfully.");
})();
