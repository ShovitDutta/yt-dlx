import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import Tuber from "../../utils/Agent";
import { locator } from "../../utils/locator";
import { Readable, PassThrough } from "stream";
function formatTime(seconds: number): string {
    if (!isFinite(seconds) || isNaN(seconds)) return "00h 00m 00s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
}
function calculateETA(startTime: Date, percent: number): number {
    const currentTime = new Date();
    const elapsedTime = (currentTime.getTime() - startTime.getTime()) / 1000;
    if (percent <= 0) return NaN;
    const totalTimeEstimate = (elapsedTime / percent) * 100;
    const remainingTime = totalTimeEstimate - elapsedTime;
    return remainingTime;
}
function progbar({ percent, timemark, startTime }: { percent: number | undefined; timemark: string; startTime: Date }) {
    let displayPercent = isNaN(percent || 0) ? 0 : percent || 0;
    displayPercent = Math.min(Math.max(displayPercent, 0), 100);
    const colorFn = displayPercent < 25 ? colors.red : displayPercent < 50 ? colors.yellow : colors.green;
    const width = Math.floor((process.stdout.columns || 80) / 4);
    const scomp = Math.round((width * displayPercent) / 100);
    const progb = colorFn("━").repeat(scomp) + colorFn(" ").repeat(width - scomp);
    const etaSeconds = calculateETA(startTime, displayPercent);
    const etaFormatted = formatTime(etaSeconds);
    process.stdout.write(`\r${colorFn("@prog:")} ${progb} ${colorFn("| @percent:")} ${displayPercent.toFixed(2)}% ${colorFn("| @timemark:")} ${timemark} ${colorFn("| @eta:")} ${etaFormatted}`);
}
const ZodSchema = z.object({
    query: z.string().min(2),
    output: z.string().optional(),
    useTor: z.boolean().optional(),
    stream: z.boolean().optional(),
    verbose: z.boolean().optional(),
    metadata: z.boolean().optional(),
    showProgress: z.boolean().optional(),
    filter: z.enum(["invert", "rotate90", "rotate270", "grayscale", "rotate180", "flipVertical", "flipHorizontal"]).optional(),
    resolution: z.enum(["144p", "240p", "360p", "480p", "720p", "1080p", "1440p", "2160p", "3072p", "4320p", "6480p", "8640p", "12000p"]),
});
type VideoCustomOptions = z.infer<typeof ZodSchema>;
export default async function VideoCustom({
    query,
    output,
    useTor,
    stream,
    filter,
    metadata,
    verbose,
    resolution,
    showProgress,
}: VideoCustomOptions): Promise<{ metadata: object } | { outputPath: string } | { stream: Readable }> {
    try {
        ZodSchema.parse({ query, output, useTor, stream, filter, metadata, verbose, resolution, showProgress });
        if (metadata && (stream || output || filter || showProgress)) {
            throw new Error(`${colors.red("@error:")} The 'metadata' parameter cannot be used with 'stream', 'output', 'filter', or 'showProgress'.`);
        }
        if (stream && output) {
            throw new Error(`${colors.red("@error:")} The 'stream' parameter cannot be used with 'output'.`);
        }
        const engineData = await Tuber({ query, verbose, useTor });
        if (!engineData) {
            throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        }
        if (!engineData.metaData) {
            throw new Error(`${colors.red("@error:")} Metadata not found in the engine response.`);
        }
        if (metadata) {
            return {
                metadata: {
                    metaData: engineData.metaData,
                    VideoLowF: engineData.VideoLowF,
                    VideoHighF: engineData.VideoHighF,
                    VideoLowHDR: engineData.VideoLowHDR,
                    VideoHighHDR: engineData.VideoHighHDR,
                    ManifestLow: engineData.ManifestLow,
                    ManifestHigh: engineData.ManifestHigh,
                    filename: engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_"),
                },
            };
        }
        const title = engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "video";
        const folder = output ? output : process.cwd();
        if (!stream && !fs.existsSync(folder)) {
            try {
                fs.mkdirSync(folder, { recursive: true });
            } catch (mkdirError: any) {
                throw new Error(`${colors.red("@error:")} Failed to create output directory: ${mkdirError.message}`);
            }
        }
        const instance: ffmpeg.FfmpegCommand = ffmpeg();
        try {
            const paths = await locator();
            if (!paths.ffmpeg) {
                throw new Error(`${colors.red("@error:")} ffmpeg executable not found.`);
            }
            if (!paths.ffprobe) {
                throw new Error(`${colors.red("@error:")} ffprobe executable not found.`);
            }
            instance.setFfmpegPath(paths.ffmpeg);
            instance.setFfprobePath(paths.ffprobe);
        } catch (locatorError: any) {
            throw new Error(`${colors.red("@error:")} Failed to locate ffmpeg or ffprobe: ${locatorError.message}`);
        }
        const resolutionWithoutP = resolution.replace("p", "");
        const vdata = engineData.ManifestHigh?.find((i: { format: string | string[] }) => i.format?.includes(resolutionWithoutP));
        if (!vdata) {
            throw new Error(`${colors.red("@error:")} No video data found for resolution: ${resolution}. Use list_formats() maybe?`);
        }
        if (!vdata.url) {
            throw new Error(`${colors.red("@error:")} Video URL not found for resolution: ${resolution}.`);
        }
        instance.addInput(vdata.url.toString());
        instance.withOutputFormat("mp4");
        const filterMap: Record<string, string[]> = {
            grayscale: ["colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3"],
            invert: ["negate"],
            rotate90: ["rotate=PI/2"],
            rotate180: ["rotate=PI"],
            rotate270: ["rotate=3*PI/2"],
            flipHorizontal: ["hflip"],
            flipVertical: ["vflip"],
        };
        if (filter && filterMap[filter]) {
            instance.withVideoFilter(filterMap[filter]);
        } else {
            instance.outputOptions("-c copy");
        }
        let processStartTime: Date;
        if (showProgress) {
            instance.on("start", () => {
                processStartTime = new Date();
            });
            instance.on("progress", progress => {
                if (processStartTime) {
                    progbar({ ...progress, percent: progress.percent !== undefined ? progress.percent : 0, startTime: processStartTime });
                }
            });
        }
        if (stream) {
            const passthroughStream = new PassThrough();
            instance.on("start", command => {
                if (verbose) console.log(colors.green("@info:"), "FFmpeg stream started:", command);
            });
            instance.pipe(passthroughStream, { end: true });
            instance.on("end", () => {
                if (verbose) console.log(colors.green("@info:"), "FFmpeg streaming finished.");
                if (showProgress) process.stdout.write("\n");
            });
            instance.on("error", (error, stdout, stderr) => {
                const errorMessage = `${colors.red("@error:")} FFmpeg stream error: ${error?.message}`;
                console.error(errorMessage, "\nstdout:", stdout, "\nstderr:", stderr);
                passthroughStream.emit("error", new Error(errorMessage));
                passthroughStream.destroy(new Error(errorMessage));
                if (showProgress) process.stdout.write("\n");
            });
            instance.run();
            return { stream: passthroughStream };
        } else {
            const filenameBase = `yt-dlx_VideoCustom_${resolution}_`;
            let filename = `${filenameBase}${filter ? filter + "_" : ""}${title}.mp4`;
            const outputPath = path.join(folder, filename);
            instance.output(outputPath);
            await new Promise<void>((resolve, reject) => {
                instance.on("start", command => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg download started:", command);
                    if (showProgress) processStartTime = new Date();
                });
                instance.on("progress", progress => {
                    if (showProgress && processStartTime) {
                        progbar({ ...progress, percent: progress.percent !== undefined ? progress.percent : 0, startTime: processStartTime });
                    }
                });
                instance.on("end", () => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg download finished.");
                    if (showProgress) process.stdout.write("\n");
                    resolve();
                });
                instance.on("error", (error, stdout, stderr) => {
                    const errorMessage = `${colors.red("@error:")} FFmpeg download error: ${error?.message}`;
                    console.error(errorMessage, "\nstdout:", stdout, "\nstderr:", stderr);
                    if (showProgress) process.stdout.write("\n");
                    reject(new Error(errorMessage));
                });
                instance.run();
            });
            return { outputPath };
        }
    } catch (error: any) {
        if (error instanceof ZodError) {
            const errorMessage = `${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        } else if (error instanceof Error) {
            console.error(error.message);
            throw error;
        } else {
            const unexpectedError = `${colors.red("@error:")} An unexpected error occurred: ${String(error)}`;
            console.error(unexpectedError);
            throw new Error(unexpectedError);
        }
    } finally {
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
import { createWriteStream } from "fs";
(async () => {
    try {
        console.log("--- Running Basic Download Example ---");
        const result = await VideoCustom({ query: "your search query or url", resolution: "720p" });
        if ("outputPath" in result) console.log("Basic Download finished:", result.outputPath);
    } catch (error) {
        console.error("Basic Download Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Download with Output and Filter Example ---");
        const result = await VideoCustom({ query: "your search query or url", resolution: "1080p", output: "./custom_downloads", filter: "grayscale" });
        if ("outputPath" in result) console.log("Download with Output and Filter finished:", result.outputPath);
    } catch (error) {
        console.error("Download with Output and Filter Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Download with All Options Example ---");
        const result = await VideoCustom({
            query: "your search query or url",
            resolution: "720p",
            output: "./full_downloads",
            useTor: true,
            verbose: true,
            filter: "flipHorizontal",
            showProgress: true,
        });
        if ("outputPath" in result) console.log("\nDownload with All Options finished:", result.outputPath);
    } catch (error) {
        console.error("\nDownload with All Options Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Fetch Metadata Only Example ---");
        const result = await VideoCustom({ query: "your search query or url", resolution: "720p", metadata: true });
        if ("metadata" in result) console.log("Metadata Only:", result.metadata);
    } catch (error) {
        console.error("Metadata Only Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Fetch Metadata with Tor and Verbose Example ---");
        const result = await VideoCustom({ query: "your search query or url", resolution: "720p", metadata: true, useTor: true, verbose: true });
        if ("metadata" in result) console.log("Metadata with Tor and Verbose:", result.metadata);
    } catch (error) {
        console.error("Metadata with Tor and Verbose Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Basic Stream Example ---");
        const result = await VideoCustom({ query: "your search query or url", resolution: "480p", stream: true });
        if ("stream" in result && result.stream) {
            console.log("Basic Streaming started. Piping to basic_stream.mp4...");
            const outputStream = createWriteStream("basic_stream.mp4");
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
        const result = await VideoCustom({ query: "your search query or url", resolution: "480p", stream: true, filter: "invert" });
        if ("stream" in result && result.stream) {
            console.log("Stream with Filter started. Piping to filtered_stream.mp4...");
            const outputStream = createWriteStream("filtered_stream.mp4");
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
        console.log("--- Running Stream with All Options Example ---");
        const result = await VideoCustom({ query: "your search query or url", resolution: "720p", stream: true, useTor: true, verbose: true, filter: "rotate180", showProgress: true });
        if ("stream" in result && result.stream) {
            console.log("\nStream with All Options started. Piping to full_stream.mp4...");
            const outputStream = createWriteStream("full_stream.mp4");
            result.stream.pipe(outputStream);
            await new Promise<void>((resolve, reject) => {
                result.stream.on("end", () => {
                    console.log("Stream with All Options finished.");
                    resolve();
                });
                result.stream.on("error", error => {
                    console.error("Stream with All Options error:", error.message);
                    result.stream.destroy(error);
                    reject(error);
                });
            });
        }
    } catch (error) {
        console.error("\nStream with All Options Setup Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Invalid Options Example (Metadata and Output) ---");
        await VideoCustom({ query: "your search query or url", resolution: "720p", metadata: true, output: "./should_fail_dir" });
        console.log("This should not be reached - Invalid Options Example.");
    } catch (error) {
        console.error("Expected Error (Metadata and Output):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Invalid Options Example (Stream and Output) ---");
        await VideoCustom({ query: "your search query or url", resolution: "720p", stream: true, output: "./should_fail_dir" });
        console.log("This should not be reached - Invalid Options Example.");
    } catch (error) {
        console.error("Expected Error (Stream and Output):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Zod Validation Error Example (Missing Query) ---");
        await VideoCustom({ resolution: "720p" } as any);
        console.log("This should not be reached - Zod Validation Error Example.");
    } catch (error) {
        console.error("Expected Zod Error (Missing Query):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Zod Validation Error Example (Missing Resolution) ---");
        await VideoCustom({ query: "your search query or url" } as any);
        console.log("This should not be reached - Zod Validation Error Example.");
    } catch (error) {
        console.error("Expected Zod Error (Missing Resolution):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Zod Validation Error Example (Invalid Resolution) ---");
        await VideoCustom({ query: "your search query or url", resolution: "500p" as any });
        console.log("This should not be reached - Zod Validation Error Example.");
    } catch (error) {
        console.error("Expected Zod Error (Invalid Resolution):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Zod Validation Error Example (Invalid Filter) ---");
        await VideoCustom({ query: "your search query or url", resolution: "720p", filter: "nonexistentfilter" as any });
        console.log("This should not be reached - Zod Validation Error Example.");
    } catch (error) {
        console.error("Expected Zod Error (Invalid Filter):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
