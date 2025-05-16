import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import Tuber from "../../utils/Agent";
import * as fsPromises from "fs/promises";
import { locator } from "../../utils/locator";
const ZodSchema = z.object({
    query: z.string().min(2),
    output: z.string().optional(),
    useTor: z.boolean().optional(),
    stream: z.boolean().optional(),
    verbose: z.boolean().optional(),
    metadata: z.boolean().optional(),
    resolution: z.enum(["high", "medium", "low", "ultralow"]),
    filter: z
        .enum(["echo", "slow", "speed", "phaser", "flanger", "panning", "reverse", "vibrato", "subboost", "surround", "bassboost", "nightcore", "superslow", "vaporwave", "superspeed"])
        .optional(),
});
type MetadataResult = {
    metaData: any;
    BestAudioLow: any;
    BestAudioHigh: any;
    AudioLowDRC: any;
    AudioHighDRC: any;
    filename: string;
};
type StreamResult = {
    filename: string;
    ffmpeg: ffmpeg.FfmpegCommand;
};
type DownloadResult = string;
type AudioCustomResult = MetadataResult | StreamResult | DownloadResult;
/**
 * @shortdesc Downloads, streams, or fetches metadata for audio from YouTube with custom options using async/await instead of events.
 * @description This function allows you to download, stream, or fetch metadata for audio from YouTube based on a search query or video URL using async/await.
 * It provides extensive customization options, including specifying the audio resolution, applying various audio filters, saving the output to a specified directory, using Tor for anonymity, enabling verbose logging, streaming the output, or simply fetching the metadata.
 * The function returns a Promise that resolves with the result of the operation (metadata object, stream info object, or output file path) or rejects with an error, replacing the EventEmitter pattern.
 *
 * @param options - An object containing the configuration options validated by ZodSchema.
 * @param options.query - The search query or video URL. **Required**.
 * @param {string} [options.output] - The directory where the output audio file should be saved. Not allowed when `metadata` is true.
 * @param {boolean} [options.useTor] - Whether to attempt to use Tor for the network requests.
 * @param {boolean} [options.stream] - If true, the audio will be processed for streaming instead of saved to a file. Not allowed when `metadata` is true. When streaming, the Promise resolves when FFmpeg starts with an object containing the filename (output path) and the FFmpeg instance.
 * @param {boolean} [options.verbose] - If true, enables detailed logging to the console, including FFmpeg command and progress.
 * @param {boolean} [options.metadata] - If true, the function will only fetch metadata. Not allowed with `output`, `stream`, or `filter`. The Promise resolves with a metadata object.
 * @param {("high" | "medium" | "low" | "ultralow")} options.resolution - The desired audio resolution or quality. Mandatory parameter.
 * @param {("echo" | "slow" | "speed" | "phaser" | "flanger" | "panning" | "reverse" | "vibrato" | "subboost | "surround" | "bassboost" | "nightcore" | "superslow" | "vaporwave" | "superspeed")} [options.filter] - An audio filter to apply. Ignored when `metadata` is true.
 *
 * @returns {Promise<AudioCustomResult>} A Promise that resolves based on the operation mode:
 * - If `metadata` is true: Resolves with a `MetadataResult` object.
 * - If `stream` is true (and `metadata` is false): Resolves with a `StreamResult` object when FFmpeg starts.
 * - If downloading (neither `metadata` nor `stream` is true): Resolves with the `DownloadResult` string (the output file path) when FFmpeg finishes successfully.
 * @throws {Error} Throws a formatted error if argument validation fails (ZodError), if the engine fails to retrieve data, if required metadata or formats are missing, if directory creation fails, if FFmpeg/FFprobe executables are not found, or if FFmpeg encounters an error during processing.
 */
export default async function AudioCustom({ query, output, useTor, stream, filter, verbose, metadata, resolution }: z.infer<typeof ZodSchema>): Promise<AudioCustomResult> {
    try {
        if (!query) throw new Error(`${colors.red("@error:")} The 'query' parameter is required.`);
        if (metadata) {
            if (stream) throw new Error(`${colors.red("@error:")} The 'stream' parameter cannot be used when 'metadata' is true.`);
            if (output) throw new Error(`${colors.red("@error:")} The 'output' parameter cannot be used when 'metadata' is true.`);
            if (filter) throw new Error(`${colors.red("@error:")} The 'filter' parameter cannot be used when 'metadata' is true.`);
        }
        if (!resolution) throw new Error(`${colors.red("@error:")} The 'resolution' parameter is required.`);
        ZodSchema.parse({ query, output, useTor, stream, filter, verbose, metadata, resolution });
        const engineData = await Tuber({ query, verbose, useTor });
        if (!engineData) throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        if (!engineData.metaData) throw new Error(`${colors.red("@error:")} Metadata was not found in the engine's response.`);
        if (metadata) {
            return {
                metaData: engineData.metaData,
                BestAudioLow: engineData.BestAudioLow,
                BestAudioHigh: engineData.BestAudioHigh,
                AudioLowDRC: engineData.AudioLowDRC,
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
        const resolutionFilter = resolution.replace("p", "");
        const adata = engineData.AudioHigh?.find((i: { format?: string | string[] }) => typeof i.format === "string" && i.format.includes(resolutionFilter));
        if (!adata) throw new Error(`${colors.red("@error:")} No audio data found for the specified resolution: ${resolution}. Please use the 'list_formats()' command to see available formats.`);
        if (!engineData.metaData.thumbnail) throw new Error(`${colors.red("@error:")} The thumbnail URL was not found.`);
        instance.addInput(engineData.metaData.thumbnail);
        instance.withOutputFormat("avi");
        if (!adata.url) throw new Error(`${colors.red("@error:")} The audio URL was not found.`);
        instance.addInput(adata.url);
        const filenameBase = `yt-dlx_AudioCustom_${resolution}_`;
        const cleanTitleForFilename = engineData.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "untitled";
        let filename = `${filenameBase}${filter ? filter + "_" : ""}${cleanTitleForFilename}.avi`;
        const outputPath = path.join(folder, filename);
        const filterMap: { [key: string]: string[] } = {
            speed: ["atempo=2"],
            flanger: ["flanger"],
            slow: ["atempo=0.8"],
            reverse: ["areverse"],
            surround: ["surround"],
            subboost: ["asubboost"],
            superspeed: ["atempo=3"],
            superslow: ["atempo=0.5"],
            vibrato: ["vibrato=f=6.5"],
            panning: ["apulsator=hz=0.08"],
            phaser: ["aphaser=in_gain=0.4"],
            echo: ["aecho=0.8:0.9:1000:0.3"],
            bassboost: ["bass=g=10,dynaudnorm=f=150"],
            vaporwave: ["aresample=48000,asetrate=48000*0.8"],
            nightcore: ["aresample=48000,asetrate=48000*1.25"],
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
