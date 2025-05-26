import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import M3u8 from "../../utils/M3u8";
import Agent from "../../utils/Agent";
import progbar from "../../utils/ProgBar";
import { locator } from "../../utils/Locator";
import { Readable, PassThrough } from "stream";
import { EngineOutput } from "../../interfaces/EngineOutput";
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
export default async function AudioVideoLowest({
    Query,
    Output,
    UseTor,
    Stream,
    Filter,
    MetaData,
    Verbose,
    ShowProgress,
    AudioLanguage,
}: AudioVideoLowestOptions): Promise<{ MetaData: EngineOutput["MetaData"]; FileName: string; Links: object } | { OutputPath: string } | { Stream: Readable; FileName: string }> {
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
                        Standard_Lowest: EngineMeta.AudioOnly.Standard[AudioLanguage || "Default"]?.Lowest,
                        DRC_Lowest: EngineMeta.AudioOnly.Dynamic_Range_Compression[AudioLanguage || "Default"]?.Lowest,
                    },
                    Video: { Standard_Lowest: EngineMeta.VideoOnly.Standard_Dynamic_Range.Lowest, HDR_Lowest: EngineMeta.VideoOnly.High_Dynamic_Range.Lowest },
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
        const ffmpegCommand = await main.getFfmpegCommand();
        if (Stream) {
            const passthroughStream = new PassThrough();
            const FileNameBase = `yt-dlx_AudioVideoLowest_`;
            let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.mkv`;
            (passthroughStream as any).FileName = FileName;
            ffmpegCommand.pipe(passthroughStream, { end: true });
            return { Stream: passthroughStream, FileName: FileName };
        } else {
            const FileNameBase = `yt-dlx_AudioVideoLowest_`;
            let FileName = `${FileNameBase}${Filter ? Filter + "_" : ""}${title}.mkv`;
            const OutputPath = path.join(folder, FileName);
            await new Promise<void>((resolve, reject) => {
                ffmpegCommand.on("end", () => resolve());
                ffmpegCommand.on("error", (error, stdout, stderr) => {
                    const errorMessage = `${colors.red("@error:")} FFmpeg download error: ${error?.message}`;
                    console.error(errorMessage, "\nstdout:", stdout, "\nstderr:", stderr);
                    if (ShowProgress) process.stdout.write("\n");
                    reject(new Error(errorMessage));
                });
                ffmpegCommand.run();
            });
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
