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
    MetaData: z.boolean().optional(),
    ShowProgress: z.boolean().optional(),
    AudioLanguage: z.string().optional(),
    Filter: z.enum(["invert", "rotate90", "rotate270", "grayscale", "rotate180", "flipVertical", "flipHorizontal"]).optional(),
});
type AudioVideoLowestOptions = z.infer<typeof ZodSchema>;
/**
 * @shortdesc Downloads or streams a YouTube video with the lowest available audio and video quality, with optional filtering and metadata retrieval.
 *
 * @description This function retrieves the lowest available quality video stream and the highest available quality audio stream (by default or specified language) from a given YouTube query (URL or video ID).
 * It then combines these streams into a single output.
 * The function supports various output options including saving to a file, streaming the content directly, or just returning metadata about the video and audio streams.
 * Video processing, such as applying filters (invert, grayscale, rotations, flips), is handled via FFmpeg.
 * The function automatically locates `ffmpeg` and `ffprobe` executables.
 * Progress can be displayed in the console, and verbose logging provides detailed information.
 *
 * @param options - An object containing the options for combined audio and video retrieval and processing.
 * @param options.Query - A string representing the YouTube video URL or ID. This is a mandatory parameter and must be at least 2 characters long.
 * @param options.Output - An optional string specifying the directory where the combined video and audio should be saved. If not provided, the file will be saved in the current working directory. This parameter cannot be used with `Stream` or `MetaData`.
 * @param options.UseTor - An optional boolean. If `true`, the function attempts to route network requests through the Tor network, enhancing privacy. Defaults to `false`.
 * @param options.Stream - An optional boolean. If `true`, the combined video and audio will be returned as a `Readable` stream. This parameter cannot be used with `Output` or `MetaData`.
 * @param options.Verbose - An optional boolean. If `true`, enables verbose logging, displaying detailed information and FFmpeg commands during execution. Defaults to `false`.
 * @param options.MetaData - An optional boolean. If `true`, only the metadata (title, file name, and lowest quality video/highest quality audio links) of the content will be returned, without downloading or streaming. This parameter cannot be used with `Stream`, `Output`, `Filter`, or `ShowProgress`.
 * @param options.ShowProgress - An optional boolean. If `true`, a progress bar will be displayed in the console during the download or streaming process. Defaults to `false`. This parameter cannot be used with `MetaData`.
 * @param options.AudioLanguage - An optional string specifying the desired audio language. If not provided, the default audio stream (usually the primary language) will be selected.
 * @param options.Filter - An optional enum specifying a video filter to apply:
 * - `"invert"`: Inverts the video colors.
 * - `"rotate90"`: Rotates the video 90 degrees clockwise.
 * - `"rotate270"`: Rotates the video 270 degrees clockwise (or 90 degrees counter-clockwise).
 * - `"grayscale"`: Converts the video to grayscale.
 * - `"rotate180"`: Rotates the video 180 degrees.
 * - `"flipVertical"`: Flips the video vertically.
 * - `"flipHorizontal"`: Flips the video horizontally.
 * This parameter cannot be used with `MetaData`.
 *
 * @returns A Promise that resolves to one of the following based on the provided options:
 * - If `MetaData` is `true`: An object containing `MetaData` (detailed video metadata), `FileName` (suggested file name), and `Links` (lowest quality standard/HDR video formats and highest quality standard/DRC audio formats available by language).
 * - If `Stream` is `true`: An object containing `Stream` (a `Readable` stream of the combined audio and video content) and `FileName` (suggested file name).
 * - If neither `Stream` nor `MetaData` is `true` (default to file download): An object containing `OutputPath` (the full path to the downloaded video file).
 *
 * @throws {Error}
 * - If `MetaData` is used with `Stream`, `Output`, `Filter`, or `ShowProgress`: `Error: @error: The 'MetaData' parameter cannot be used with 'Stream', 'output', 'Filter', or 'ShowProgress'.`
 * - If both `Stream` and `Output` are set to `true`: `Error: @error: The 'Stream' parameter cannot be used with 'output'.`
 * - If unable to retrieve a response from the engine: `Error: @error: Unable to retrieve a response from the engine.`
 * - If metadata is not found in the engine response: `Error: @error: Metadata not found in the engine response.`
 * - If the lowest quality video URL is not found: `Error: @error: Lowest quality video URL not found.`
 * - If the lowest quality audio URL is not found for the specified (or default) language: `Error: @error: Lowest quality audio URL not found for language: [language_or_default].`
 * - If `ffmpeg` executable is not found: `Error: @error: ffmpeg executable not found.`
 * - If `ffprobe` executable is not found: `Error: @error: ffprobe executable not found.`
 * - If the output directory cannot be created: `Error: @error: Failed to create output directory: [error_message]`
 * - If argument validation fails due to invalid `options` (e.g., incorrect type or missing required fields): `Error: @error: Argument validation failed: [path]: [message]`
 * - For any FFmpeg-related errors during streaming or download: `Error: @error: FFmpeg Stream error: [error_message]` or `Error: @error: FFmpeg download error: [error_message]`
 * - For any other unexpected errors: `Error: @error: An unexpected error occurred: [error_message]`
 */
export default async function AudioVideoLowest({ Query, Output, UseTor, Stream, Filter, MetaData, Verbose, ShowProgress, AudioLanguage }: AudioVideoLowestOptions): Promise<
    | {
          MetaData: EngineOutput["MetaData"];
          FileName: string;
          Links: {
              Audio: { Standard_Highest: CleanedAudioFormat | null; DRC_Highest: CleanedAudioFormat | null };
              Video: { Standard_Lowest: CleanedVideoFormat | null; HDR_Lowest: CleanedVideoFormat | null };
          };
      }
    | { Stream: Readable; FileName: string }
    | { OutputPath: string }
> {
    try {
        ZodSchema.parse({ Query, Output, UseTor, Stream, Filter, MetaData, Verbose, ShowProgress, AudioLanguage });
        if (MetaData && (Stream || Output || Filter || ShowProgress)) {
            throw new Error(`${colors.red("@error:")} The 'MetaData' parameter cannot be used with 'Stream', 'output', 'Filter', or 'ShowProgress'.`);
        }
        if (Stream && Output) throw new Error(`${colors.red("@error:")} The 'Stream' parameter cannot be used with 'output'.`);
        const EngineMeta: EngineOutput | null = await Agent({ Query: Query, Verbose: Verbose, UseTor: UseTor });
        if (!EngineMeta) throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        if (!EngineMeta.MetaData) throw new Error(`${colors.red("@error:")} Metadata not found in the engine response.`);
        if (MetaData) {
            return {
                MetaData: EngineMeta.MetaData,
                FileName: `yt-dlx_AudioVideoLowest_${Filter ? Filter + "_" : ""}${EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "video"}.mkv`,
                Links: {
                    Audio: {
                        Standard_Highest: Object.fromEntries(Object.entries(EngineMeta.AudioOnly.Standard).map(([lang, data]) => [lang, data?.Lowest as CleanedAudioFormat | null])),
                        DRC_Highest: Object.fromEntries(Object.entries(EngineMeta.AudioOnly.Dynamic_Range_Compression).map(([lang, data]) => [lang, data?.Lowest as CleanedAudioFormat | null])),
                    },
                    Video: {
                        Standard_Lowest: EngineMeta.VideoOnly.Standard_Dynamic_Range.Lowest as CleanedVideoFormat | null,
                        HDR_Lowest: EngineMeta.VideoOnly.High_Dynamic_Range.Lowest as CleanedVideoFormat | null,
                    },
                },
            };
        }
        const title = EngineMeta.MetaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "video";
        const folder = Output ? Output : process.cwd();
        if (!Stream && !fs.existsSync(folder)) {
            try {
                fs.mkdirSync(folder, { recursive: true });
            } catch (mkdirError: any) {
                throw new Error(`${colors.red("@error:")} Failed to create output directory: ${mkdirError.message}`);
            }
        }
        const lowestVideo = EngineMeta.VideoOnly.Standard_Dynamic_Range.Lowest;
        if (!lowestVideo?.url) throw new Error(`${colors.red("@error:")} Lowest quality video URL not found.`);
        const lowestAudio = EngineMeta.AudioOnly.Standard[AudioLanguage || "Default"]?.Lowest;
        if (!lowestAudio?.url) throw new Error(`${colors.red("@error:")} Lowest quality audio URL not found for language: ${AudioLanguage || "Default"}.`);
        const paths = await locator();
        if (!paths.ffmpeg) throw new Error(`${colors.red("@error:")} ffmpeg executable not found.`);
        if (!paths.ffprobe) throw new Error(`${colors.red("@error:")} ffprobe executable not found.`);
        const main = new M3u8({
            Verbose: Verbose,
            ShowProgress: ShowProgress,
            FFmpegPath: paths.ffmpeg,
            FFprobePath: paths.ffprobe,
            Video_M3u8_URL: lowestVideo.url,
            Audio_M3u8_URL: lowestAudio.url,
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
                    const FileNameBase = `yt-dlx_AudioVideoLowest_`;
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
                    const FileNameBase = `yt-dlx_AudioVideoLowest_`;
                    let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.mkv`;
                    const OutputPath = path.join(folder, FileName);
                    instance.output(OutputPath);
                    instance.on("start", command => {
                        if (Verbose) console.log(colors.green("@info:"), "FFmpeg download started:", command);
                        if (ShowProgress) processStartTime = new Date();
                    });
                    instance.on("progress", progress => {
                        if (ShowProgress && processStartTime) progbar({ ...progress, percent: progress.percent !== undefined ? progress.percent : 0, startTime: processStartTime });
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
            const FileNameBase = `yt-dlx_AudioVideoLowest_`;
            let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.mkv`;
            (passthroughStream as any).FileName = FileName;
            await main.pipe(passthroughStream, { end: true });
            return { Stream: passthroughStream, FileName: FileName };
        } else {
            const FileNameBase = `yt-dlx_AudioVideoLowest_`;
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
