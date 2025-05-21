import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import Agent from "../../utils/Agent";
import progbar from "../../utils/progbar";
import { locator } from "../../utils/locator";
import { Readable, PassThrough } from "stream";
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
}: AudioLowestOptions): Promise<{ metadata: object } | { outputPath: string } | { stream: Readable; filename: string }> {
    try {
        ZodSchema.parse({ query, output, useTor, stream, filter, metadata, verbose, showProgress });
        if (metadata && (stream || output || filter || showProgress)) {
            throw new Error(`${colors.red("@error:")} The 'metadata' parameter cannot be used with 'stream', 'output', 'filter', or 'showProgress'.`);
        }
        if (stream && output) throw new Error(`${colors.red("@error:")} The 'stream' parameter cannot be used with 'output'.`);
        const EngineMeta = await Agent({ query, verbose, useTor });
        if (!EngineMeta) throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        if (!EngineMeta.metaData) throw new Error(`${colors.red("@error:")} Metadata was not found in the engine response.`);
        if (metadata) {
            return {
                metadata: {
                    metaData: EngineMeta.metaData,
                    AudioLow: EngineMeta.AudioLow,
                    AudioLowDRC: EngineMeta.AudioLowDRC,
                    BestAudioLow: EngineMeta.BestAudioLow,
                    filename: `yt-dlx_AudioLowest_${filter ? filter + "_" : ""}${EngineMeta.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "audio"}.avi`,
                },
            };
        }
        const title = EngineMeta.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "audio";
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
            if (!paths.ffmpeg) throw new Error(`${colors.red("@error:")} ffmpeg executable not found.`);
            if (!paths.ffprobe) throw new Error(`${colors.red("@error:")} ffprobe executable not found.`);
            instance.setFfmpegPath(paths.ffmpeg);
            instance.setFfprobePath(paths.ffprobe);
            if (EngineMeta.metaData.thumbnails?.[0]?.url) instance.addInput(EngineMeta.metaData.thumbnails[0].url);
        } catch (locatorError: any) {
            throw new Error(`${colors.red("@error:")} Failed to locate ffmpeg or ffprobe: ${locatorError.message}`);
        }
        if (!EngineMeta.BestAudioLow?.url) throw new Error(`${colors.red("@error:")} Lowest quality audio URL was not found.`);
        instance.addInput(EngineMeta.BestAudioLow.url);
        instance.withOutputFormat("avi");
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
        if (filter && filterMap[filter]) instance.withAudioFilter(filterMap[filter]);
        else instance.outputOptions("-c copy");
        let processStartTime: Date;
        if (showProgress) {
            instance.on("start", () => {
                processStartTime = new Date();
            });
            instance.on("progress", progress => {
                if (processStartTime) progbar({ ...progress, percent: progress.percent !== undefined ? progress.percent : 0, startTime: processStartTime });
            });
        }
        if (stream) {
            const passthroughStream = new PassThrough();
            const filenameBase = `yt-dlx_AudioLowest_`;
            let filename = `${filenameBase}${filter ? filter + "_" : ""}${title}.avi`;
            (passthroughStream as any).filename = filename;
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
            return { stream: passthroughStream, filename: filename };
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
        if (verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
