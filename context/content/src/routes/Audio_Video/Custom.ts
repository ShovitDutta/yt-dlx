import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import M3u8 from "../../utils/M3u8";
import Agent from "../../utils/Agent";
import progbar from "../../utils/ProgBar";
import { locator } from "../../utils/Locator";
import { Readable, PassThrough } from "stream";
import { EngineOutput, CleanedAudioFormat, CleanedVideoFormat } from "../../interfaces/EngineOutput";
const ZodSchema = z.object({
    Query: z.string().min(2),
    Output: z.string().optional(),
    UseTor: z.boolean().optional(),
    Stream: z.boolean().optional(),
    Verbose: z.boolean().optional(),
    VideoFPS: z.number().optional(),
    MetaData: z.boolean().optional(),
    ShowProgress: z.boolean().optional(),
    AudioLanguage: z.string().optional(),
    AudioFormatId: z.string().optional(),
    AudioBitrate: z.number().optional(),
    VideoFormatId: z.string().optional(),
    VideoResolution: z.string().optional(),
    Filter: z.enum(["invert", "rotate90", "rotate270", "grayscale", "rotate180", "flipVertical", "flipHorizontal"]).optional(),
});
type AudioVideoCustomOptions = z.infer<typeof ZodSchema>;
/**
 * @summary Downloads or streams a YouTube video with custom audio and video quality settings, optional filtering, and metadata retrieval.
 *
 * This function offers granular control over the quality of both audio and video streams when downloading or streaming a YouTube video.
 * You can specify desired audio quality by `AudioFormatId` or `AudioBitrate`, and video quality by `VideoFormatId`, `VideoResolution`, or `VideoFPS`.
 * If no specific audio/video parameters are provided, it defaults to the highest available standard dynamic range for both.
 * The function supports saving the combined audio-video output to a specified directory, streaming it as a Node.js `Readable` stream, or simply retrieving detailed metadata.
 * Video processing, such as applying various filters (invert, grayscale, rotations, flips), is handled by FFmpeg.
 * The function automatically locates `ffmpeg` and `ffprobe` executables on the system.
 * You can also enable a progress bar for downloads/streams and verbose logging for detailed execution information.
 *
 * @param options - An object containing the options for combined audio and video retrieval and processing.
 * @param options.Query - A string representing the YouTube video URL or ID. This is a mandatory parameter and must be at least 2 characters long.
 * @param options.Output - An optional string specifying the directory where the combined audio and video should be saved. If omitted, the video will be saved in the current working directory. This parameter cannot be used with `Stream` or `MetaData`.
 * @param options.UseTor - An optional boolean. If `true`, network requests will be routed through the Tor network, enhancing privacy. Defaults to `false`.
 * @param options.Stream - An optional boolean. If `true`, the combined audio and video content will be returned as a Node.js `Readable` stream, allowing for in-memory processing or piping. This parameter cannot be used with `Output` or `MetaData`.
 * @param options.Verbose - An optional boolean. If `true`, the function will print detailed logs and FFmpeg command executions to the console. Defaults to `false`.
 * @param options.VideoFPS - An optional number specifying the desired video frames per second. Only one of `VideoFormatId`, `VideoResolution`, or `VideoFPS` can be provided. This parameter cannot be used with `MetaData`.
 * @param options.MetaData - An optional boolean. If `true`, the function will only return the video's metadata (title, file name, and all available audio/video links) without downloading or streaming the content. This parameter cannot be combined with `Stream`, `Output`, `Filter`, `ShowProgress`, `AudioLanguage`, `AudioFormatId`, `AudioBitrate`, `VideoFormatId`, `VideoResolution`, or `VideoFPS`.
 * @param options.ShowProgress - An optional boolean. If `true`, a real-time progress bar will be displayed in the console during the video download or streaming process. Defaults to `false`. This parameter cannot be used with `MetaData`.
 * @param options.AudioLanguage - An optional string specifying the desired audio language (e.g., "English", "Spanish"). If not provided, the default audio stream for the video will be selected. This parameter cannot be used with `MetaData`.
 * @param options.AudioFormatId - An optional string specifying the exact format ID of the audio to download. This ID can typically be found in the `Links` object when `MetaData` is set to `true`. Only one of `AudioFormatId` or `AudioBitrate` can be provided. This parameter cannot be used with `MetaData`.
 * @param options.AudioBitrate - An optional number specifying the desired audio bitrate (e.g., 128 for 128kbps). The function will attempt to find the closest matching bitrate. Only one of `AudioFormatId` or `AudioBitrate` can be provided. This parameter cannot be used with `MetaData`.
 * @param options.VideoFormatId - An optional string specifying the exact format ID of the video to download. This ID can typically be found in the `Links` object when `MetaData` is set to `true`. Only one of `VideoFormatId`, `VideoResolution`, or `VideoFPS` can be provided. This parameter cannot be used with `MetaData`.
 * @param options.VideoResolution - An optional string specifying the desired video resolution (e.g., "1080p", "720p"). Only one of `VideoFormatId`, `VideoResolution`, or `VideoFPS` can be provided. This parameter cannot be used with `MetaData`.
 * @param options.Filter - An optional enum specifying a video filter to apply to the output:
 * - `"invert"`: Inverts the colors of the video.
 * - `"rotate90"`: Rotates the video 90 degrees clockwise.
 * - `"rotate270"`: Rotates the video 270 degrees clockwise.
 * - `"grayscale"`: Converts the video to grayscale.
 * - `"rotate180"`: Rotates the video 180 degrees.
 * - `"flipVertical"`: Flips the video content along its horizontal axis.
 * - `"flipHorizontal"`: Flips the video content along its vertical axis.
 * This parameter cannot be used with `MetaData`.
 *
 * @returns A Promise that resolves to one of three possible object structures:
 * - If `MetaData` is `true`: Returns an object containing the video's `MetaData` (full details), a suggested `FileName`, and `Links` to all available audio (standard and dynamic range compression by language) and video (SDR and HDR combined) formats.
 * - If `Stream` is `true`: Returns an object containing a `Readable` `Stream` of the video content and a suggested `FileName`.
 * - Otherwise (defaulting to file download): Returns an object containing the `OutputPath` (the full path to the saved video file).
 *
 * @throws {Error}
 * - If `MetaData` is used in conjunction with any other processing-related parameters (`Stream`, `Output`, `Filter`, `ShowProgress`, `AudioLanguage`, `AudioFormatId`, `AudioBitrate`, `VideoFormatId`, `VideoResolution`, `VideoFPS`): `Error: @error: The 'MetaData' parameter cannot be used with other processing parameters.`
 * - If both `Stream` and `Output` parameters are set to `true`: `Error: @error: The 'Stream' parameter cannot be used with 'Output'.`
 * - If both `AudioFormatId` and `AudioBitrate` are provided: `Error: @error: The 'AudioFormatId' and 'AudioBitrate' parameters cannot be used together. Please specify only one audio custom parameter.`
 * - If more than one of `VideoFormatId`, `VideoResolution`, or `VideoFPS` are provided simultaneously: `Error: @error: Please specify only one of 'VideoFormatId', 'VideoResolution', or 'VideoFPS'.`
 * - If the video metadata cannot be retrieved from the engine: `Error: @error: Unable to retrieve a response from the engine.`
 * - If metadata is found to be missing from the engine's response: `Error: @error: Metadata was not found in the engine response.`
 * - If a specified `AudioFormatId` or `AudioBitrate` does not match any available audio formats for the given language: `Error: @error: Audio format with [ID/bitrate] '[value]' not found for language '[language_or_unknown]'.`
 * - If no suitable audio formats are found for the specified (or default) language: `Error: @error: No suitable audio formats found for language '[language_or_unknown]'.`
 * - If a specified `VideoFormatId`, `VideoResolution`, or `VideoFPS` does not match any available video formats: `Error: @error: Video format with [ID/resolution/FPS] '[value]' not found.`
 * - If no suitable video formats are found at all: `Error: @error: No suitable video formats found.`
 * - If the `ffmpeg` executable is not found on the system: `Error: @error: ffmpeg executable not found.`
 * - If the `ffprobe` executable is not found on the system: `Error: @error: ffprobe executable not found.`
 * - If there's a problem creating the specified output directory: `Error: @error: Failed to create the output directory: [error_message]`
 * - If the provided `options` fail Zod schema validation (e.g., incorrect type or missing required fields): `Error: @error: Argument validation failed: [path]: [message]`
 * - For any FFmpeg-related errors during the streaming or download process: `Error: @error: FFmpeg Stream error: [error_message]` or `Error: @error: FFmpeg download error: [error_message]`
 * - For any other unexpected errors that occur during execution: `Error: @error: An unexpected error occurred: [error_message]`
 */
export default async function Audio_Video_Custom({
    Query,
    Output,
    UseTor,
    Stream,
    Filter,
    MetaData,
    Verbose,
    ShowProgress,
    AudioLanguage,
    AudioFormatId,
    AudioBitrate,
    VideoFormatId,
    VideoResolution,
    VideoFPS,
}: AudioVideoCustomOptions): Promise<{ MetaData: EngineOutput["MetaData"]; FileName: string; Links: object } | { OutputPath: string } | { Stream: Readable; FileName: string }> {
    try {
        ZodSchema.parse({ Query, Output, UseTor, Stream, Filter, MetaData, Verbose, ShowProgress, AudioLanguage, AudioFormatId, AudioBitrate, VideoFormatId, VideoResolution, VideoFPS });
        if (MetaData && (Stream || Output || Filter || ShowProgress || AudioLanguage || AudioFormatId || AudioBitrate || VideoFormatId || VideoResolution || VideoFPS)) {
            throw new Error(`${colors.red("@error:")} The 'MetaData' parameter cannot be used with other processing parameters.`);
        }
        if (Stream && Output) throw new Error(`${colors.red("@error:")} The 'Stream' parameter cannot be used with 'Output'.`);
        if (AudioFormatId && AudioBitrate) {
            throw new Error(`${colors.red("@error:")} The 'AudioFormatId' and 'AudioBitrate' parameters cannot be used together. Please specify only one audio custom parameter.`);
        }
        if ((VideoFormatId && VideoResolution) || (VideoFormatId && VideoFPS) || (VideoResolution && VideoFPS)) {
            throw new Error(`${colors.red("@error:")} Please specify only one of 'VideoFormatId', 'VideoResolution', or 'VideoFPS'.`);
        }
        if (MetaData) {
            const EngineMeta: EngineOutput | null = await Agent({ Query: Query, Verbose: Verbose, UseTor: UseTor });
            if (!EngineMeta) throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
            if (!EngineMeta.MetaData) throw new Error(`${colors.red("@error:")} Metadata was not found in the engine response.`);
            return {
                MetaData: EngineMeta.MetaData,
                FileName: `yt-dlx_AudioVideoCustom_${Filter ? Filter + "_" : ""}${EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "video"}.mkv`,
                Links: {
                    Audio: {
                        ...EngineMeta.AudioOnly.Standard,
                        ...EngineMeta.AudioOnly.Dynamic_Range_Compression,
                    },
                    VideoSDR: EngineMeta.VideoOnly.Standard_Dynamic_Range.Combined,
                    VideoHDR: EngineMeta.VideoOnly.High_Dynamic_Range.Combined,
                },
            };
        }
        const EngineMeta: EngineOutput | null = await Agent({ Query: Query, Verbose: Verbose, UseTor: UseTor });
        if (!EngineMeta) throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        if (!EngineMeta.MetaData) throw new Error(`${colors.red("@error:")} Metadata was not found in the engine response.`);
        const title = EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "video";
        const folder = Output ? Output : process.cwd();
        if (!Stream && !fs.existsSync(folder)) {
            try {
                fs.mkdirSync(folder, { recursive: true });
            } catch (mkdirError: any) {
                throw new Error(`${colors.red("@error:")} Failed to create the output directory: ${mkdirError.message}`);
            }
        }
        let selectedAudioFormat: CleanedAudioFormat | undefined;
        let selectedVideoFormat: CleanedVideoFormat | undefined;
        const availableAudioFormats = [
            ...(EngineMeta.AudioOnly.Standard[AudioLanguage || "Unknown"]?.Combined || []),
            ...(EngineMeta.AudioOnly.Dynamic_Range_Compression[AudioLanguage || "Unknown"]?.Combined || []),
        ];
        if (AudioFormatId) {
            selectedAudioFormat = availableAudioFormats.find(format => format.format_id === AudioFormatId);
            if (!selectedAudioFormat) throw new Error(`${colors.red("@error:")} Audio format with ID '${AudioFormatId}' not found for language '${AudioLanguage || "Unknown"}'.`);
        } else if (AudioBitrate) {
            selectedAudioFormat = availableAudioFormats.reduce((prev: CleanedAudioFormat | undefined, curr: CleanedAudioFormat) => {
                if (curr.tbr === undefined || curr.tbr === null) return prev;
                if (prev === undefined || prev.tbr === undefined || prev.tbr === null) return curr;
                return Math.abs(curr.tbr - AudioBitrate) < Math.abs(prev.tbr - AudioBitrate) ? curr : prev;
            }, undefined);
            if (!selectedAudioFormat || selectedAudioFormat.tbr === undefined || selectedAudioFormat.tbr === null) {
                throw new Error(`${colors.red("@error:")} No audio format found with a valid bitrate close to ${AudioBitrate} for language '${AudioLanguage || "Unknown"}'.`);
            }
        } else {
            selectedAudioFormat = EngineMeta.AudioOnly.Standard[AudioLanguage || "Unknown"]?.Highest || availableAudioFormats.find(format => format.url !== undefined);
            if (!selectedAudioFormat || !selectedAudioFormat.url) throw new Error(`${colors.red("@error:")} No suitable audio formats found for language '${AudioLanguage || "Unknown"}'.`);
        }
        const availableVideoFormats = [...(EngineMeta.VideoOnly.Standard_Dynamic_Range.Combined || []), ...(EngineMeta.VideoOnly.High_Dynamic_Range.Combined || [])];
        if (VideoFormatId) {
            selectedVideoFormat = availableVideoFormats.find(format => format.format_id === VideoFormatId);
            if (!selectedVideoFormat) throw new Error(`${colors.red("@error:")} Video format with ID '${VideoFormatId}' not found.`);
        } else if (VideoResolution) {
            selectedVideoFormat = availableVideoFormats.find(format => format.resolution === VideoResolution);
            if (!selectedVideoFormat) throw new Error(`${colors.red("@error:")} Video format with resolution '${VideoResolution}' not found.`);
        } else if (VideoFPS) {
            selectedVideoFormat = availableVideoFormats.find(format => format.fps === VideoFPS);
            if (!selectedVideoFormat) throw new Error(`${colors.red("@error:")} Video format with FPS '${VideoFPS}' not found.`);
        } else {
            selectedVideoFormat = EngineMeta.VideoOnly.Standard_Dynamic_Range.Highest || availableVideoFormats.find(format => format.url !== undefined);
            if (!selectedVideoFormat || !selectedVideoFormat.url) throw new Error(`${colors.red("@error:")} No suitable video formats found.`);
        }
        if (!selectedAudioFormat?.url) throw new Error(`${colors.red("@error:")} Selected audio format URL was not found.`);
        if (!selectedVideoFormat?.url) throw new Error(`${colors.red("@error:")} Selected video format URL was not found.`);
        const paths = await locator();
        if (!paths.ffmpeg) throw new Error(`${colors.red("@error:")} ffmpeg executable not found.`);
        if (!paths.ffprobe) throw new Error(`${colors.red("@error:")} ffprobe executable not found.`);
        const main = new M3u8({
            Verbose: Verbose,
            ShowProgress: ShowProgress,
            FFmpegPath: paths.ffmpeg,
            FFprobePath: paths.ffprobe,
            Video_M3u8_URL: selectedVideoFormat.url,
            Audio_M3u8_URL: selectedAudioFormat.url,
            configure: instance => {
                if (EngineMeta.Thumbnails.Highest?.url) instance.addInput(EngineMeta.Thumbnails.Highest.url);
                instance.withOutputFormat("matroska");
                instance.inputOptions(["-protocol_whitelist file,http,https,tcp,tls,crypto", "-reconnect 1", "-reconnect_streamed 1", "-reconnect_delay_max 5"]);
                const filterMap: Record<string, string[]> = {
                    invert: ["negate"],
                    flipVertical: ["vflip"],
                    rotate180: ["rotate=PI"],
                    rotate90: ["rotate=PI/2"],
                    flipHorizontal: ["hflip"],
                    rotate270: ["rotate=3*PI/2"],
                    grayscale: ["colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3"],
                };
                if (Filter && filterMap[Filter]) instance.withVideoFilter(filterMap[Filter]);
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
                    const FileNameBase = `yt-dlx_AudioVideoCustom_`;
                    let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.mkv`;
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
                    const FileNameBase = `yt-dlx_AudioVideoCustom_`;
                    let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.mkv`;
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
            const FileNameBase = `yt-dlx_AudioVideoCustom_`;
            let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.mkv`;
            (passthroughStream as any).FileName = FileName;
            await main.pipe(passthroughStream, { end: true });
            return { Stream: passthroughStream, FileName: FileName };
        } else {
            const FileNameBase = `yt-dlx_AudioVideoCustom_`;
            let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.mkv`;
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
