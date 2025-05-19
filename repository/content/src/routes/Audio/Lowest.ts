import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import Agent from "../../utils/Agent";
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
    filter: z
        .enum(["echo", "slow", "speed", "phaser", "flanger", "panning", "reverse", "vibrato", "subboost", "surround", "bassboost", "nightcore", "superslow", "vaporwave", "superspeed"])
        .optional(),
});
type AudioLowestOptions = z.infer<typeof ZodSchema>;
export default async function AudioLowest({
    query,
    output,
    useTor,
    stream,
    filter,
    metadata,
    verbose,
    showProgress,
}: AudioLowestOptions): Promise<{ metadata: object } | { outputPath: string } | { stream: Readable }> {
    try {
        ZodSchema.parse({ query, output, useTor, stream, filter, metadata, verbose, showProgress });
        if (metadata && (stream || output || filter || showProgress)) {
            throw new Error(`${colors.red("@error:")} The 'metadata' parameter cannot be used with 'stream', 'output', 'filter', or 'showProgress'.`);
        }
        if (stream && output) {
            throw new Error(`${colors.red("@error:")} The 'stream' parameter cannot be used with 'output'.`);
        }
        const engineData = await Agent({ query, verbose, useTor });
        if (!engineData) {
            throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        }
        if (!engineData.metaData) {
            throw new Error(`${colors.red("@error:")} Metadata was not found in the engine response.`);
        }
        if (metadata) {
            return {
                metadata: {
                    metaData: engineData.metaData,
                    BestAudioLow: engineData.BestAudioLow,
                    AudioLowDRC: engineData.AudioLowDRC,
                    filename: engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_"),
                },
            };
        }
        const title = engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "audio";
        const folder = output ? output : process.cwd();
        if (!stream && !fs.existsSync(folder)) {
            try {
                fs.mkdirSync(folder, { recursive: true });
            } catch (mkdirError: any) {
                throw new Error(`${colors.red("@error:")} Failed to create the output directory: ${mkdirError.message}`);
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
        if (!engineData.BestAudioLow?.url) {
            throw new Error(`${colors.red("@error:")} Lowest quality audio URL was not found.`);
        }
        instance.addInput(engineData.BestAudioLow.url);
        if (!engineData.metaData.thumbnail) {
            throw new Error(`${colors.red("@error:")} Thumbnail URL was not found.`);
        }
        instance.addInput(engineData.metaData.thumbnail);
        instance.withOutputFormat("avi");
        const filterMap: Record<string, string[]> = {
            bassboost: ["bass=g=10,dynaudnorm=f=150"],
            echo: ["aecho=0.8:0.9:1000:0.3"],
            flanger: ["flanger"],
            nightcore: ["aresample=48000,asetrate=48000*1.25"],
            panning: ["apulsator=hz=0.08"],
            phaser: ["aphaser=in_gain=0.4"],
            reverse: ["areverse"],
            slow: ["atempo=0.8"],
            speed: ["atempo=2"],
            subboost: ["asubboost"],
            superslow: ["atempo=0.5"],
            superspeed: ["atempo=3"],
            surround: ["surround"],
            vaporwave: ["aresample=48000,asetrate=48000*0.8"],
            vibrato: ["vibrato=f=6.5"],
        };
        if (filter && filterMap[filter]) {
            instance.withAudioFilter(filterMap[filter]);
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
            console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
            return { stream: passthroughStream };
        } else {
            const filenameBase = `yt-dlx_AudioLowest_`;
            let filename = `${filenameBase}${filter ? filter + "_" : ""}${title}.avi`;
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
            console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
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
    }
}
