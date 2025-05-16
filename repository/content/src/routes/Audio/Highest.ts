import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import Tuber from "../../utils/Agent";
import * as fsPromises from "fs/promises";
import { locator } from "../../utils/locator";
var ZodSchema = z.object({
    query: z.string().min(2),
    output: z.string().optional(),
    useTor: z.boolean().optional(),
    stream: z.boolean().optional(),
    verbose: z.boolean().optional(),
    metadata: z.boolean().optional(),
    filter: z
        .enum(["echo", "slow", "speed", "phaser", "flanger", "panning", "reverse", "vibrato", "subboost", "surround", "bassboost", "nightcore", "superslow", "vaporwave", "superspeed"])
        .optional(),
});
type MetadataResult = {
    metaData: any;
    AudioHighF: any;
    filename: string;
    AudioHighDRC: any;
};
type StreamResult = {
    filename: string;
    ffmpeg: ffmpeg.FfmpegCommand;
};
type DownloadResult = string;
type AudioHighestResult = MetadataResult | StreamResult | DownloadResult;
/**
 * @shortdesc Downloads, streams, or fetches metadata for the highest quality audio from YouTube using async/await instead of events.
 *
 * @description This function allows you to download, stream, or fetch metadata for the highest available audio quality from YouTube based on a search query or video URL using async/await.
 * It provides customization options such as saving the output to a specified directory, using Tor for anonymity, enabling verbose logging, streaming the output, or simply fetching the metadata. Audio filters can also be applied.
 * The function automatically selects the highest quality audio format available based on the engine's results.
 * It returns a Promise that resolves with the result of the operation (metadata object, stream info object, or output file path) or rejects with an error, replacing the EventEmitter pattern.
 *
 * @param options - An object containing the configuration options validated by ZodSchema.
 * @param options.query - The search query or video URL. **Required**.
 * @param {string} [options.output] - The directory where the output audio file should be saved. Not allowed when `metadata` is true.
 * @param {boolean} [options.useTor] - Whether to attempt to use Tor for the network requests.
 * @param {boolean} [options.stream] - If true, the audio will be processed for streaming instead of saved to a file. Not allowed when `metadata` is true. When streaming, the Promise resolves when FFmpeg starts with an object containing the filename (output path reference) and the FFmpeg instance.
 * @param {boolean} [options.verbose] - If true, enables detailed logging to the console, including FFmpeg command and progress.
 * @param {boolean} [options.metadata] - If true, the function will only fetch metadata without processing audio. Not allowed with `output`, `stream`, or `filter`. The Promise resolves with a `MetadataResult` object.
 * @param {("echo" | "slow" | "speed" | "phaser" | "flanger" | "panning" | "reverse" | "vibrato" | "subboost" | "surround" | "bassboost" | "nightcore" | "superslow" | "vaporwave" | "superspeed")} [options.filter] - An audio filter to apply. Ignored when `metadata` is true.
 *
 * @returns {Promise<AudioHighestResult>} A Promise that resolves based on the operation mode:
 * - If `metadata` is true: Resolves with a `MetadataResult` object.
 * - If `stream` is true (and `metadata` is false): Resolves with a `StreamResult` object when FFmpeg starts.
 * - If downloading (neither `metadata` nor `stream` is true): Resolves with the `DownloadResult` string (the output file path) when FFmpeg finishes successfully.
 * @throws {Error} Throws a formatted error if argument validation fails (ZodError), if the engine fails to retrieve data, if required metadata or formats are missing, if directory creation fails, if FFmpeg/FFprobe executables are not found, or if FFmpeg encounters an error during processing.
 */
export default async function AudioHighest({ query, output, useTor, stream, filter, metadata, verbose }: z.infer<typeof ZodSchema>): Promise<AudioHighestResult> {
    try {
        if (!query) throw new Error(`${colors.red("@error:")} The 'query' parameter is always required.`);
        if (metadata) {
            if (stream) throw new Error(`${colors.red("@error:")} The 'stream' parameter cannot be used when 'metadata' is true.`);
            if (output) throw new Error(`${colors.red("@error:")} The 'output' parameter cannot be used when 'metadata' is true.`);
            if (filter) throw new Error(`${colors.red("@error:")} The 'filter' parameter cannot be used when 'metadata' is true.`);
        }
        if (stream && metadata) throw new Error(`${colors.red("@error:")} The 'stream' parameter cannot be true when 'metadata' is true.`);
        ZodSchema.parse({ query, output, useTor, stream, filter, metadata, verbose });
        const engineData = await Tuber({ query, verbose, useTor });
        if (!engineData) throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        if (!engineData.metaData) throw new Error(`${colors.red("@error:")} Metadata was not found in the engine response.`);
        if (metadata) {
            return {
                metaData: engineData.metaData,
                AudioHighF: engineData.AudioHighF,
                AudioHighDRC: engineData.AudioHighDRC,
                filename: engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "metadata",
            };
        }
        const title = engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "untitled";
        const folder = output ? output : process.cwd();
        try {
            await fsPromises.access(folder, fs.constants.F_OK);
            if (verbose) console.log(colors.green("@info:"), `Output directory already exists: ${folder}`);
        } catch (e: any) {
            if (e.code === "ENOENT") {
                if (verbose) console.log(colors.green("@info:"), `Output directory does not exist, attempting to create: ${folder}`);
                try {
                    await fsPromises.mkdir(folder, { recursive: true });
                    if (verbose) console.log(colors.green("@info:"), `Output directory created: ${folder}`);
                } catch (mkdirError: any) {
                    throw new Error(`${colors.red("@error:")} Failed to create the output directory: ${mkdirError.message}`);
                }
            } else throw new Error(`${colors.red("@error:")} Error checking output directory: ${e.message}`);
        }
        const instance: ffmpeg.FfmpegCommand = ffmpeg();
        try {
            const paths = await locator();
            if (!paths.ffmpeg) throw new Error(`${colors.red("@error:")} ffmpeg executable not found.`);
            if (!paths.ffprobe) throw new Error(`${colors.red("@error:")} ffprobe executable not found.`);
            instance.setFfmpegPath(paths.ffmpeg);
            instance.setFfprobePath(paths.ffprobe);
        } catch (locatorError: any) {
            throw new Error(`${colors.red("@error:")} Failed to locate ffmpeg or ffprobe: ${locatorError.message}`);
        }
        const hqAudio = engineData.AudioHighF;
        if (!hqAudio?.url) throw new Error(`${colors.red("@error:")} Highest quality audio URL was not found.`);
        instance.addInput(hqAudio.url);
        if (!engineData.metaData.thumbnail) throw new Error(`${colors.red("@error:")} Thumbnail URL was not found.`);
        instance.addInput(engineData.metaData.thumbnail);
        instance.withOutputFormat("avi");
        const filenameBase = `yt-dlx_AudioHighest_`;
        const cleanTitleForFilename = engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "untitled";
        let filename = `${filenameBase}${filter ? filter + "_" : ""}${cleanTitleForFilename}.avi`;
        const outputPath = path.join(folder, filename);
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
        if (filter && filterMap[filter]) instance.withAudioFilter(filterMap[filter]);
        else instance.outputOptions("-c copy");
        if (!stream) instance.output(outputPath);
        if (stream) {
            const streamReadyPromise = new Promise<StreamResult>((resolve, reject) => {
                instance.on("start", commandLine => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg command:", commandLine);
                    resolve({ filename: outputPath, ffmpeg: instance });
                });
                instance.on("progress", progress => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg progress:", progress);
                });
                instance.on("error", (error, stdout, stderr) => {
                    reject(new Error(`${colors.red("@error:")} FFmpeg error during stream setup: ${error.message}\nStdout: ${stdout}\nStderr: ${stderr}`));
                });
            });
            instance.run();
            return await streamReadyPromise;
        } else {
            const downloadCompletePromise = new Promise<DownloadResult>((resolve, reject) => {
                instance.on("start", commandLine => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg command:", commandLine);
                });
                instance.on("progress", progress => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg progress:", progress);
                });
                instance.on("error", (error, stdout, stderr) => {
                    reject(new Error(`${colors.red("@error:")} FFmpeg error during download: ${error.message}\nStdout: ${stdout}\nStderr: ${stderr}`));
                });
                instance.on("end", () => {
                    resolve(outputPath);
                });
            });
            instance.run();
            return await downloadCompletePromise;
        }
    } catch (error: any) {
        if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw new Error(`${colors.red("@error:")} ${error.message}`);
        else throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
