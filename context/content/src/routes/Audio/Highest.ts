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
export default async function AudioHighest({
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
