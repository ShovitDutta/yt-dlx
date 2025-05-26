import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import M3u8 from "../../utils/M3u8";
import Agent from "../../utils/Agent";
import progbar from "../../utils/ProgBar";
import { locator } from "../../utils/Locator";
import { Readable, PassThrough } from "stream";
import { EngineOutput, CleanedAudioFormat } from "../../interfaces/EngineOutput";
const ZodSchema = z.object({
    Query: z.string().min(2),
    Output: z.string().optional(),
    UseTor: z.boolean().optional(),
    Stream: z.boolean().optional(),
    Verbose: z.boolean().optional(),
    MetaData: z.boolean().optional(),
    ShowProgress: z.boolean().optional(),
    Language: z.string().optional(),
    Filter: z
        .enum(["echo", "slow", "speed", "phaser", "flanger", "panning", "reverse", "vibrato", "subboost", "surround", "bassboost", "nightcore", "superslow", "vaporwave", "superspeed"])
        .optional(),
});
type AudioLowestOptions = z.infer<typeof ZodSchema>;
/**
 * @shortdesc Downloads or streams the lowest quality audio of a YouTube video, with optional audio filters and metadata retrieval.
 *
 * @description This function allows you to retrieve the lowest available quality audio stream from a given YouTube query (URL or video ID).
 * It supports saving the audio to a file, streaming it directly as a Node.js `Readable` stream, or simply fetching its metadata.
 * Various audio processing filters (e.g., echo, bassboost, speed changes, nightcore, vaporwave) can be applied using FFmpeg.
 * The function automatically detects and uses `ffmpeg` and `ffprobe` executables.
 * You can also display a progress bar during the download/streaming process and enable verbose logging for detailed output.
 *
 * @param options - An object containing the options for audio retrieval and processing.
 * @param options.Query - A string representing the YouTube video URL or ID. This is a mandatory parameter and must be at least 2 characters long.
 * @param options.Output - An optional string specifying the directory where the audio file should be saved. If not provided, the file will be saved in the current working directory. This parameter cannot be used with `Stream` or `MetaData`.
 * @param options.UseTor - An optional boolean. If `true`, the function attempts to route network requests through the Tor network, enhancing privacy. Defaults to `false`.
 * @param options.Stream - An optional boolean. If `true`, the audio will be returned as a `Readable` stream, allowing for in-memory processing or piping. This parameter cannot be used with `Output` or `MetaData`.
 * @param options.Verbose - An optional boolean. If `true`, enables verbose logging, displaying detailed information and FFmpeg commands during execution. Defaults to `false`.
 * @param options.MetaData - An optional boolean. If `true`, only the metadata (title, file name, and lowest quality audio links) of the content will be returned, without downloading or streaming. This parameter cannot be used with `Stream`, `Output`, `Filter`, or `ShowProgress`.
 * @param options.ShowProgress - An optional boolean. If `true`, a progress bar will be displayed in the console during the download or streaming process. Defaults to `false`. This parameter cannot be used with `MetaData`.
 * @param options.Language - An optional string specifying the desired audio language (e.g., "English", "Spanish"). If not provided, the default audio stream (usually the primary language) will be selected.
 * @param options.Filter - An optional enum specifying an audio filter to apply:
 * - `"echo"`: Adds an echo effect.
 * - `"slow"`: Slows down the audio.
 * - `"speed"`: Speeds up the audio.
 * - `"phaser"`: Applies a phaser effect.
 * - `"flanger"`: Applies a flanger effect.
 * - `"panning"`: Applies a panning effect.
 * - `"reverse"`: Reverses the audio.
 * - `"vibrato"`: Applies a vibrato effect.
 * - `"subboost"`: Boosts sub-bass frequencies.
 * - `"surround"`: Creates a surround sound effect.
 * - `"bassboost"`: Boosts bass frequencies.
 * - `"nightcore"`: Applies a nightcore effect (sped-up audio, often with increased pitch).
 * - `"superslow"`: Significantly slows down the audio.
 * - `"vaporwave"`: Applies a vaporwave effect (slowed-down audio, often with reduced pitch).
 * - `"superspeed"`: Significantly speeds up the audio.
 * This parameter cannot be used with `MetaData`.
 *
 * @returns A Promise that resolves to one of the following based on the provided options:
 * - If `MetaData` is `true`: An object containing `MetaData` (detailed video metadata), `FileName` (suggested file name), and `Links` (lowest quality standard audio format available by language, HDR lowest is always null for audio only).
 * - If `Stream` is `true`: An object containing `Stream` (a `Readable` stream of the audio content) and `FileName` (suggested file name).
 * - If neither `Stream` nor `MetaData` is `true` (default to file download): An object containing `OutputPath` (the full path to the downloaded audio file).
 *
 * @throws {Error}
 * - If `MetaData` is used with `Stream`, `Output`, `Filter`, or `ShowProgress`: `Error: @error: The 'MetaData' parameter cannot be used with 'Stream', 'output', 'Filter', or 'ShowProgress'.`
 * - If both `Stream` and `Output` are set to `true`: `Error: @error: The 'Stream' parameter cannot be used with 'output'.`
 * - If unable to retrieve a response from the engine: `Error: @error: Unable to retrieve a response from the engine.`
 * - If metadata is not found in the engine response: `Error: @error: Metadata was not found in the engine response.`
 * - If the lowest quality audio URL is not found for the specified (or default) language: `Error: @error: Lowest quality audio URL was not found for language: [language_or_Default].`
 * - If `ffmpeg` executable is not found: `Error: @error: ffmpeg executable not found.`
 * - If `ffprobe` executable is not found: `Error: @error: ffprobe executable not found.`
 * - If the output directory cannot be created: `Error: @error: Failed to create the output directory: [error_message]`
 * - If argument validation fails due to invalid `options` (e.g., incorrect type or missing required fields): `Error: @error: Argument validation failed: [path]: [message]`
 * - For any FFmpeg-related errors during streaming or download: `Error: @error: FFmpeg Stream error: [error_message]` or `Error: @error: FFmpeg download error: [error_message]`
 * - For any other unexpected errors: `Error: @error: An unexpected error occurred: [error_message]`
 */
export default async function AudioLowest({
    Query,
    Output,
    UseTor,
    Stream,
    Filter,
    Verbose,
    Language,
    MetaData,
    ShowProgress,
}: AudioLowestOptions): Promise<
    | { MetaData: EngineOutput["MetaData"]; FileName: string; Links: { Standard_Lowest: CleanedAudioFormat | null; HDR_Lowest: CleanedAudioFormat | null } }
    | { Stream: Readable; FileName: string }
    | { OutputPath: string }
> {
    try {
        ZodSchema.parse({ Query, Output, UseTor, Stream, Filter, MetaData, Verbose, ShowProgress, Language });
        if (MetaData && (Stream || Output || Filter || ShowProgress)) {
            throw new Error(`${colors.red("@error:")} The 'MetaData' parameter cannot be used with 'Stream', 'output', 'Filter', or 'ShowProgress'.`);
        }
        if (Stream && Output) throw new Error(`${colors.red("@error:")} The 'Stream' parameter cannot be used with 'output'.`);
        const EngineMeta: EngineOutput | null = await Agent({ Query: Query, Verbose: Verbose, UseTor: UseTor });
        if (!EngineMeta) throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        if (!EngineMeta.MetaData) throw new Error(`${colors.red("@error:")} Metadata was not found in the engine response.`);
        if (MetaData) {
            return {
                MetaData: EngineMeta.MetaData,
                FileName: `yt-dlx_AudioLowest_${Filter ? Filter + "_" : ""}${EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "audio"}.m4a`,
                Links: {
                    Standard_Lowest: Object.fromEntries(Object.entries(EngineMeta.AudioOnly.Standard).map(([lang, data]) => [lang, data?.Lowest as CleanedAudioFormat | null])),
                    HDR_Lowest: null,
                },
            };
        }
        const title = EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "audio";
        const folder = Output ? Output : process.cwd();
        if (!Stream && !fs.existsSync(folder)) {
            try {
                fs.mkdirSync(folder, { recursive: true });
            } catch (mkdirError: any) {
                throw new Error(`${colors.red("@error:")} Failed to create the output directory: ${mkdirError.message}`);
            }
        }
        const lowestQualityAudio = EngineMeta.AudioOnly.Standard[Language || "Default"]?.Lowest;
        if (!lowestQualityAudio?.url) throw new Error(`${colors.red("@error:")} Lowest quality audio URL was not found for language: ${Language || "Default"}.`);
        const paths = await locator();
        if (!paths.ffmpeg) throw new Error(`${colors.red("@error:")} ffmpeg executable not found.`);
        if (!paths.ffprobe) throw new Error(`${colors.red("@error:")} ffprobe executable not found.`);
        const main = new M3u8({
            Verbose: Verbose,
            ShowProgress: ShowProgress,
            FFmpegPath: paths.ffmpeg,
            FFprobePath: paths.ffprobe,
            Audio_M3u8_URL: lowestQualityAudio.url,
            configure: instance => {
                if (EngineMeta.Thumbnails.Highest?.url) instance.addInput(EngineMeta.Thumbnails.Highest.url);
                instance.withOutputFormat("m4a");
                instance.inputOptions(["-protocol_whitelist file,http,https,tcp,tls,crypto", "-reconnect 1", "-reconnect_streamed 1", "-reconnect_delay_max 5"]);
                const filterMap: Record<string, string[]> = {
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
                if (Filter && filterMap[Filter]) instance.withAudioFilter(filterMap[Filter]);
                else instance.outputOptions("-c copy");
                let processStartTime: Date;
                if (ShowProgress) {
                    instance.on("start", () => {
                        processStartTime = new Date();
                    });
                    instance.on("progress", progress => {
                        if (processStartTime) progbar({ ...progress, percent: progress.percent !== undefined ? progress.percent : 0, startTime: processStartTime });
                    });
                }
                if (Stream) {
                    const passthroughStream = new PassThrough();
                    const FileNameBase = `yt-dlx_AudioLowest_`;
                    let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.m4a`;
                    (passthroughStream as any).FileName = FileName;
                    instance.on("start", command => {
                        if (Verbose) console.log(colors.green("@info:"), "FFmpeg Stream started:", command);
                    });
                    instance.pipe(passthroughStream, { end: true });
                    instance.on("end", () => {
                        if (Verbose) console.log(colors.green("@info:"), "FFmpeg streaming finished.");
                        if (ShowProgress) process.stdout.write("\n");
                    });
                    instance.on("error", (error, stdout, stderr) => {
                        const errorMessage = `${colors.red("@error:")} FFmpeg Stream error: ${error?.message}`;
                        console.error(errorMessage, "\nstdout:", stdout, "\nstderr:", stderr);
                        passthroughStream.emit("error", new Error(errorMessage));
                        passthroughStream.destroy(new Error(errorMessage));
                        if (ShowProgress) process.stdout.write("\n");
                    });
                } else {
                    const FileNameBase = `yt-dlx_AudioLowest_`;
                    let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.m4a`;
                    const OutputPath = path.join(folder, FileName);
                    instance.output(OutputPath);
                    instance.on("start", command => {
                        if (Verbose) console.log(colors.green("@info:"), "FFmpeg download started:", command);
                        if (ShowProgress) processStartTime = new Date();
                    });
                    instance.on("progress", progress => {
                        if (ShowProgress && processStartTime) {
                            progbar({ ...progress, percent: progress.percent !== undefined ? progress.percent : 0, startTime: processStartTime });
                        }
                    });
                    instance.on("end", () => {
                        if (Verbose) console.log(colors.green("@info:"), "FFmpeg download finished.");
                        if (ShowProgress) process.stdout.write("\n");
                    });
                    instance.on("error", (error, stdout, stderr) => {
                        const errorMessage = `${colors.red("@error:")} FFmpeg download error: ${error?.message}`;
                        console.error(errorMessage, "\nstdout:", stdout, "\nstderr:", stderr);
                        if (ShowProgress) process.stdout.write("\n");
                    });
                }
            },
        });
        if (Stream) {
            const passthroughStream = new PassThrough();
            const FileNameBase = `yt-dlx_AudioLowest_`;
            let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.m4a`;
            (passthroughStream as any).FileName = FileName;
            await main.pipe(passthroughStream, { end: true });
            return { Stream: passthroughStream, FileName: FileName };
        } else {
            const FileNameBase = `yt-dlx_AudioLowest_`;
            let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.m4a`;
            const OutputPath = path.join(folder, FileName);
            await main.run();
            return { OutputPath };
        }
    } catch (error) {
        if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw error;
        else throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
