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
    AudioLanguage: z.string().optional(),
    Filter: z
        .enum(["echo", "slow", "speed", "phaser", "flanger", "panning", "reverse", "vibrato", "subboost", "surround", "bassboost", "nightcore", "superslow", "vaporwave", "superspeed"])
        .optional(),
    AudioFormatId: z.string().optional(),
    AudioBitrate: z.number().optional(),
});
type AudioCustomOptions = z.infer<typeof ZodSchema>;
/**
 * @summary Downloads or streams YouTube audio with custom quality settings, optional audio filters, and metadata retrieval.
 *
 * This function provides fine-grained control over the audio quality when downloading or streaming audio from a YouTube video.
 * You can specify the desired audio quality using either an `AudioFormatId` or an `AudioBitrate`. If neither is provided, the function will default to the highest available standard audio quality for the specified language.
 * The function supports saving the audio to a specified output directory, streaming it as a Node.js `Readable` stream, or simply retrieving detailed metadata about the audio.
 * Various audio processing filters (e.g., echo, bassboost, speed changes, nightcore, vaporwave) can be applied to the audio using the integrated FFmpeg.
 * It automatically locates the `ffmpeg` and `ffprobe` executables on your system.
 * You can also enable a real-time progress bar for downloads/streams and verbose logging for detailed execution information.
 *
 * @param options - An object containing the options for custom audio retrieval and processing.
 * @param options.Query - A string representing the YouTube video URL or ID. This is a mandatory parameter and must be at least 2 characters long.
 * @param options.Output - An optional string specifying the directory where the audio file should be saved. If omitted, the audio will be saved in the current working directory. This parameter cannot be used with `Stream` or `MetaData`.
 * @param options.UseTor - An optional boolean. If `true`, network requests will be routed through the Tor network, enhancing privacy. Defaults to `false`.
 * @param options.Stream - An optional boolean. If `true`, the audio content will be returned as a Node.js `Readable` stream, allowing for in-memory processing or piping. This parameter cannot be used with `Output` or `MetaData`.
 * @param options.Verbose - An optional boolean. If `true`, the function will print detailed logs and FFmpeg command executions to the console. Defaults to `false`.
 * @param options.MetaData - An optional boolean. If `true`, the function will only return the video's metadata (title, file name, and all available audio links) without downloading or streaming the content. This parameter cannot be combined with `Stream`, `Output`, `Filter`, `ShowProgress`, `AudioLanguage`, `AudioFormatId`, or `AudioBitrate`.
 * @param options.ShowProgress - An optional boolean. If `true`, a real-time progress bar will be displayed in the console during the audio download or streaming process. Defaults to `false`. This parameter cannot be used with `MetaData`.
 * @param options.AudioLanguage - An optional string specifying the desired audio language (e.g., "English", "Spanish"). If not provided, the default audio stream for the video will be selected.
 * @param options.Filter - An optional enum specifying an audio filter to apply to the output:
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
 * @param options.AudioFormatId - An optional string specifying the exact format ID of the audio to download. This ID can typically be found in the `Links` object when `MetaData` is set to `true`. Only one of `AudioFormatId` or `AudioBitrate` can be provided.
 * @param options.AudioBitrate - An optional number specifying the desired audio bitrate (e.g., 128 for 128kbps). The function will attempt to find the closest matching bitrate. Only one of `AudioFormatId` or `AudioBitrate` can be provided.
 *
 * @returns A Promise that resolves to one of three possible object structures:
 * - If `MetaData` is `true`: Returns an object containing the video's `MetaData` (full details), a suggested `FileName`, and `Links` to all available audio (standard and dynamic range compression) formats by language.
 * - If `Stream` is `true`: Returns an object containing a `Readable` `Stream` of the audio content and a suggested `FileName`.
 * - Otherwise (defaulting to file download): Returns an object containing the `OutputPath` (the full path to the saved audio file).
 *
 * @throws {Error}
 * - If `MetaData` is used in conjunction with any other processing-related parameters (`Stream`, `Output`, `Filter`, `ShowProgress`, `AudioFormatId`, `AudioBitrate`): `Error: @error: The 'MetaData' parameter cannot be used with other processing parameters.`
 * - If both `Stream` and `Output` parameters are set to `true`: `Error: @error: The 'Stream' parameter cannot be used with 'Output'.`
 * - If both `AudioFormatId` and `AudioBitrate` are provided: `Error: @error: The 'AudioFormatId' and 'AudioBitrate' parameters cannot be used together. Please specify only one.`
 * - If the video metadata cannot be retrieved from the engine: `Error: @error: Unable to retrieve a response from the engine.`
 * - If metadata is found to be missing from the engine's response: `Error: @error: Metadata was not found in the engine response.`
 * - If a specified `AudioFormatId` or `AudioBitrate` does not match any available audio formats for the given language: `Error: @error: Audio format with ID '[AudioFormatId]' not found for language '[AudioLanguage_or_Default]'` or `Error: @error: No audio format found with a valid bitrate close to [AudioBitrate] for language '[AudioLanguage_or_Default]'`.
 * - If no suitable audio formats are found for the specified (or default) language: `Error: @error: No suitable audio formats found for language '[AudioLanguage_or_Default]'`.
 * - If the selected audio format's URL is not found: `Error: @error: Selected audio format URL was not found.`
 * - If the `ffmpeg` executable is not found on the system: `Error: @error: ffmpeg executable not found.`
 * - If the `ffprobe` executable is not found on the system: `Error: @error: ffprobe executable not found.`
 * - If there's a problem creating the specified output directory: `Error: @error: Failed to create the output directory: [error_message]`
 * - If the provided `options` fail Zod schema validation (e.g., incorrect type or missing required fields): `Error: @error: Argument validation failed: [path]: [message]`
 * - For any FFmpeg-related errors during the streaming process: `Error: @error: FFmpeg Stream error: [error_message]`
 * - For any FFmpeg-related errors during the download process: `Error: @error: FFmpeg download error: [error_message]`
 * - For any other unexpected errors that occur during execution: `Error: @error: An unexpected error occurred: [generic_error_message]`
 */
export default async function Audio_Custom({
    Query,
    Output,
    UseTor,
    Stream,
    Filter,
    Verbose,
    MetaData,
    ShowProgress,
    AudioBitrate,
    AudioLanguage,
    AudioFormatId,
}: AudioCustomOptions): Promise<{ MetaData: EngineOutput["MetaData"]; FileName: string; Links: object } | { OutputPath: string } | { Stream: Readable; FileName: string }> {
    try {
        ZodSchema.parse({ Query, Output, UseTor, Stream, Filter, MetaData, Verbose, ShowProgress, AudioLanguage, AudioFormatId, AudioBitrate });
        if (MetaData && (Stream || Output || Filter || ShowProgress || AudioFormatId || AudioBitrate)) {
            throw new Error(`${colors.red("@error:")} The 'MetaData' parameter cannot be used with other processing parameters.`);
        }
        if (Stream && Output) throw new Error(`${colors.red("@error:")} The 'Stream' parameter cannot be used with 'Output'.`);
        if (AudioFormatId && AudioBitrate) throw new Error(`${colors.red("@error:")} The 'AudioFormatId' and 'AudioBitrate' parameters cannot be used together. Please specify only one.`);
        const EngineMeta: EngineOutput | null = await Agent({ Query: Query, Verbose: Verbose, UseTor: UseTor });
        if (!EngineMeta) throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        if (!EngineMeta.MetaData) throw new Error(`${colors.red("@error:")} Metadata was not found in the engine response.`);
        if (MetaData) {
            return {
                MetaData: EngineMeta.MetaData,
                FileName: `yt-dlx_AudioCustom_${Filter ? Filter + "_" : ""}${EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "audio"}.m4a`,
                Links: {
                    Audio: EngineMeta.AudioOnly.Standard[AudioLanguage || "Default"]?.Combined,
                    AudioDRC: EngineMeta.AudioOnly.Dynamic_Range_Compression[AudioLanguage || "Default"]?.Combined,
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
        let selectedAudioFormat: CleanedAudioFormat | undefined;
        const availableAudioFormats = [
            ...(EngineMeta.AudioOnly.Standard[AudioLanguage || "Default"]?.Combined || []),
            ...(EngineMeta.AudioOnly.Dynamic_Range_Compression[AudioLanguage || "Default"]?.Combined || []),
        ];
        if (AudioFormatId) {
            selectedAudioFormat = availableAudioFormats.find(format => format.format_id === AudioFormatId);
            if (!selectedAudioFormat) throw new Error(`${colors.red("@error:")} Audio format with ID '${AudioFormatId}' not found for language '${AudioLanguage || "Default"}'.`);
        } else if (AudioBitrate) {
            selectedAudioFormat = availableAudioFormats.reduce((prev: CleanedAudioFormat | undefined, curr: CleanedAudioFormat) => {
                if (curr.tbr === undefined || curr.tbr === null) return prev;
                if (prev === undefined || prev.tbr === undefined || prev.tbr === null) return curr;
                return Math.abs(curr.tbr - AudioBitrate) < Math.abs(prev.tbr - AudioBitrate) ? curr : prev;
            }, undefined);
            if (!selectedAudioFormat || selectedAudioFormat.tbr === undefined || selectedAudioFormat.tbr === null) {
                throw new Error(`${colors.red("@error:")} No audio format found with a valid bitrate close to ${AudioBitrate} for language '${AudioLanguage || "Default"}'.`);
            }
        } else {
            selectedAudioFormat = EngineMeta.AudioOnly.Standard[AudioLanguage || "Default"]?.Highest || availableAudioFormats.find(format => format.url !== undefined);
            if (!selectedAudioFormat || !selectedAudioFormat.url) throw new Error(`${colors.red("@error:")} No suitable audio formats found for language '${AudioLanguage || "Default"}'.`);
        }
        if (!selectedAudioFormat.url) throw new Error(`${colors.red("@error:")} Selected audio format URL was not found.`);
        const paths = await locator();
        if (!paths.ffmpeg) throw new Error(`${colors.red("@error:")} ffmpeg executable not found.`);
        if (!paths.ffprobe) throw new Error(`${colors.red("@error:")} ffprobe executable not found.`);
        const main = new M3u8({
            Audio_M3u8_URL: selectedAudioFormat.url,
            Verbose: Verbose,
            ShowProgress: ShowProgress,
            FFmpegPath: paths.ffmpeg,
            FFprobePath: paths.ffprobe,
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
                    const FileNameBase = `yt-dlx_AudioCustom_`;
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
                    const FileNameBase = `yt-dlx_AudioCustom_`;
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
            const FileNameBase = `yt-dlx_AudioCustom_`;
            let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.m4a`;
            (passthroughStream as any).FileName = FileName;
            await main.pipe(passthroughStream, { end: true });
            return { Stream: passthroughStream, FileName: FileName };
        } else {
            const FileNameBase = `yt-dlx_AudioCustom_`;
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
