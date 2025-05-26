import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import M3u8 from "../../utils/M3u8";
import Agent from "../../utils/Agent";
import progbar from "../../utils/ProgBar";
import { locator } from "../../utils/Locator";
import { Readable, PassThrough } from "stream";
import { CleanedAudioFormat, EngineOutput } from "../../interfaces/EngineOutput";
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
type AudioHighestOptions = z.infer<typeof ZodSchema>;
/**
 * @summary Downloads or streams the highest quality audio of a YouTube video, with optional audio filters and metadata retrieval.
 *
 * This function retrieves the highest available quality audio stream from a given YouTube query (URL or video ID).
 * It provides options to either save the audio to a file, stream it directly as a Node.js `Readable` stream, or simply fetch its detailed metadata.
 * You can apply a variety of audio processing filters (e.g., echo, bassboost, speed changes, nightcore, vaporwave) using FFmpeg, which is seamlessly integrated.
 * The function automatically locates `ffmpeg` and `ffprobe` executables on your system.
 * Additionally, you have the flexibility to display a progress bar during the download or streaming process and enable verbose logging for comprehensive output.
 *
 * @param options - An object containing the options for audio retrieval and processing.
 * @param options.Query - A string representing the YouTube video URL or ID. This is a mandatory parameter and must be at least 2 characters long.
 * @param options.Output - An optional string specifying the directory where the audio file should be saved. If not provided, the file will be saved in the current working directory. This parameter cannot be used simultaneously with `Stream` or `MetaData`.
 * @param options.UseTor - An optional boolean. If `true`, the function will attempt to route network requests through the Tor network, enhancing privacy. Defaults to `false`.
 * @param options.Stream - An optional boolean. If `true`, the audio will be returned as a `Readable` stream, which is useful for in-memory processing or piping the audio to another destination. This parameter cannot be used with `Output` or `MetaData`.
 * @param options.Verbose - An optional boolean. If `true`, the function will print detailed logs and the FFmpeg command being executed to the console. Defaults to `false`.
 * @param options.MetaData - An optional boolean. If `true`, the function will only return the video's metadata (including title, suggested file name, and links to the highest quality audio streams) without performing any download or streaming. This parameter cannot be used with `Stream`, `Output`, `Filter`, or `ShowProgress`.
 * @param options.ShowProgress - An optional boolean. If `true`, a real-time progress bar will be displayed in your console during the audio download or streaming process. Defaults to `false`. This parameter cannot be used with `MetaData`.
 * @param options.Language - An optional string specifying the desired audio language (e.g., "English", "Spanish"). If not provided, the default audio stream for the video will be selected.
 * @param options.Filter - An optional enum specifying an audio filter to apply to the output:
 * - `"echo"`: Adds an echo effect to the audio.
 * - `"slow"`: Slows down the audio playback speed.
 * - `"speed"`: Speeds up the audio playback speed.
 * - `"phaser"`: Applies a phaser audio effect.
 * - `"flanger"`: Applies a flanger audio effect.
 * - `"panning"`: Creates an audio panning effect.
 * - `"reverse"`: Reverses the audio playback.
 * - `"vibrato"`: Applies a vibrato effect to the audio.
 * - `"subboost"`: Enhances sub-bass frequencies in the audio.
 * - `"surround"`: Creates a simulated surround sound effect.
 * - `"bassboost"`: Boosts the bass frequencies of the audio.
 * - `"nightcore"`: Applies a nightcore effect (typically sped-up audio with increased pitch).
 * - `"superslow"`: Significantly slows down the audio playback speed.
 * - `"vaporwave"`: Applies a vaporwave effect (typically slowed-down audio with reduced pitch).
 * - `"superspeed"`: Significantly speeds up the audio playback speed.
 * This parameter cannot be used with `MetaData`.
 *
 * @returns A Promise that resolves to one of three distinct object types depending on the `options` provided:
 * - If `MetaData` is `true`: An object containing the video's `MetaData` (comprehensive details about the video), a suggested `FileName` for the audio, and `Links` to the highest quality standard audio format available by language. Note that `HDR_Highest` will always be `null` as this function focuses on audio.
 * - If `Stream` is `true`: An object containing a Node.js `Readable` `Stream` of the audio content and a suggested `FileName`.
 * - If neither `Stream` nor `MetaData` is `true` (which implies downloading to a file): An object containing the `OutputPath` (the full file system path to the downloaded audio file).
 *
 * @throws {Error}
 * - If the `MetaData` parameter is used along with `Stream`, `Output`, `Filter`, or `ShowProgress`: `Error: @error: The 'MetaData' parameter cannot be used with 'Stream', 'output', 'Filter', or 'ShowProgress'.`
 * - If both the `Stream` and `Output` parameters are set to `true`: `Error: @error: The 'Stream' parameter cannot be used with 'output'.`
 * - If the function fails to retrieve a response from the underlying engine: `Error: @error: Unable to retrieve a response from the engine.`
 * - If the engine's response does not contain the expected metadata: `Error: @error: Metadata was not found in the engine response.`
 * - If the URL for the highest quality audio for the specified `Language` (or default) cannot be found: `Error: @error: Highest quality audio URL was not found for language: [Language or Default].`
 * - If the `ffmpeg` executable is not found in the system's accessible paths: `Error: @error: ffmpeg executable not found.`
 * - If the `ffprobe` executable is not found in the system's accessible paths: `Error: @error: ffprobe executable not found.`
 * - If the specified output directory cannot be created: `Error: @error: Failed to create the output directory: [error_message]`
 * - If the provided `options` object fails validation against the Zod schema (e.g., incorrect data types or missing required fields): `Error: @error: Argument validation failed: [path.to.field]: [validation_message]`.
 * - For any errors that occur during the FFmpeg streaming process: `Error: @error: FFmpeg Stream error: [error_message]`.
 * - For any errors that occur during the FFmpeg download process: `Error: @error: FFmpeg download error: [error_message]`.
 * - For any other unforeseen errors during execution: `Error: @error: An unexpected error occurred: [generic_error_message]`.
 */
export default async function Audio_Highest({
    Query,
    Output,
    UseTor,
    Stream,
    Filter,
    Verbose,
    Language,
    MetaData,
    ShowProgress,
}: AudioHighestOptions): Promise<
    | { MetaData: EngineOutput["MetaData"]; FileName: string; Links: { Standard_Highest: CleanedAudioFormat | null; HDR_Highest: CleanedAudioFormat | null } }
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
                FileName: `yt-dlx_AudioHighest_${Filter ? Filter + "_" : ""}${EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "audio"}.m4a`,
                Links: {
                    Standard_Highest: Object.fromEntries(Object.entries(EngineMeta.AudioOnly.Standard).map(([lang, data]) => [lang, data?.Highest as CleanedAudioFormat | null])),
                    HDR_Highest: null,
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
        const highestQualityAudio = EngineMeta.AudioOnly.Standard[Language || "Default"]?.Highest;
        if (!highestQualityAudio?.url) throw new Error(`${colors.red("@error:")} Highest quality audio URL was not found for language: ${Language || "Default"}.`);
        const paths = await locator();
        if (!paths.ffmpeg) throw new Error(`${colors.red("@error:")} ffmpeg executable not found.`);
        if (!paths.ffprobe) throw new Error(`${colors.red("@error:")} ffprobe executable not found.`);
        const main = new M3u8({
            Verbose: Verbose,
            ShowProgress: ShowProgress,
            FFmpegPath: paths.ffmpeg,
            FFprobePath: paths.ffprobe,
            Audio_M3u8_URL: highestQualityAudio.url,
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
                    const FileNameBase = `yt-dlx_AudioHighest_`;
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
                    const FileNameBase = `yt-dlx_AudioHighest_`;
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
            const FileNameBase = `yt-dlx_AudioHighest_`;
            let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.m4a`;
            (passthroughStream as any).FileName = FileName;
            await main.pipe(passthroughStream, { end: true });
            return { Stream: passthroughStream, FileName: FileName };
        } else {
            const FileNameBase = `yt-dlx_AudioHighest_`;
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
