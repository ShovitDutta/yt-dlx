import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import Tuber from "../../utils/Agent";
import progbar from "../../utils/progbar";
import { locator } from "../../utils/locator";
import { Readable, PassThrough } from "stream";
var ZodSchema = z.object({
    query: z.string().min(2),
    output: z.string().optional(),
    useTor: z.boolean().optional(),
    stream: z.boolean().optional(),
    verbose: z.boolean().optional(),
    metadata: z.boolean().optional(),
    filter: z.enum(["invert", "rotate90", "rotate270", "grayscale", "rotate180", "flipVertical", "flipHorizontal"]).optional(),
    resolution: z.string().regex(/^\d+p(\d+)?$/),
    showProgress: z.boolean().optional(),
});
type AudioVideoCustomOptions = z.infer<typeof ZodSchema>;
export default async function AudioVideoCustom({
    query,
    stream,
    output,
    useTor,
    filter,
    metadata,
    verbose,
    resolution,
    showProgress,
}: AudioVideoCustomOptions): Promise<{ metadata: object } | { outputPath: string } | { stream: Readable; filename: string }> {
    try {
        ZodSchema.parse({ query, stream, output, useTor, filter, metadata, verbose, resolution, showProgress });
        if (metadata && (stream || output || filter || showProgress)) {
            throw new Error(`${colors.red("@error:")} The 'metadata' parameter cannot be used with 'stream', 'output', 'filter', or 'showProgress'.`);
        }
        if (stream && output) throw new Error(`${colors.red("@error:")} The 'stream' parameter cannot be used with 'output'.`);
        if (metadata && showProgress) throw new Error(`${colors.red("@error:")} The 'showProgress' parameter cannot be used when 'metadata' is true.`);
        const EngineMeta = await Tuber({ query, verbose, useTor });
        if (!EngineMeta) throw new Error(`${colors.red("@error:")} Unable to retrieve a response from the engine.`);
        if (!EngineMeta.metaData) throw new Error(`${colors.red("@error:")} Metadata was not found in the engine response.`);
        if (metadata) {
            return {
                metadata: {
                    metaData: EngineMeta.metaData,
                    BestAudioLow: EngineMeta.BestAudioLow,
                    BestAudioHigh: EngineMeta.BestAudioHigh,
                    AudioLowDRC: EngineMeta.AudioLowDRC,
                    AudioHighDRC: EngineMeta.AudioHighDRC,
                    BestVideoLow: EngineMeta.BestVideoLow,
                    BestVideoHigh: EngineMeta.BestVideoHigh,
                    VideoLowHDR: EngineMeta.VideoLowHDR,
                    VideoHighHDR: EngineMeta.VideoHighHDR,
                    ManifestLow: EngineMeta.ManifestLow,
                    ManifestHigh: EngineMeta.ManifestHigh,
                    filename: `yt-dlx_AudioVideoCustom_${resolution}_${filter ? filter + "_" : ""}${EngineMeta.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "video"}.mkv`,
                },
            };
        }
        const title = EngineMeta.metaData.title?.replace(/[^a-zA-Z0-9_]+/g, "_") || "video";
        const folder = output ? output : process.cwd();
        if (!stream && !fs.existsSync(folder)) {
            try {
                fs.mkdirSync(folder, { recursive: true });
            } catch (mkdirError: any) {
                throw new Error(`${colors.red("@error:")} Failed to create the output directory: ${mkdirError?.message}`);
            }
        }
        const instance: ffmpeg.FfmpegCommand = ffmpeg();
        try {
            const paths = await locator();
            if (!paths.ffmpeg) throw new Error(`${colors.red("@error:")} ffmpeg executable not found.`);
            if (!paths.ffprobe) throw new Error(`${colors.red("@error:")} ffprobe executable not found.`);
            instance.setFfmpegPath(paths.ffmpeg);
            instance.setFfprobePath(paths.ffprobe);
            if (EngineMeta.metaData.thumbnail) instance.addInput(EngineMeta.metaData.thumbnail);
        } catch (locatorError: any) {
            throw new Error(`${colors.red("@error:")} Failed to locate ffmpeg or ffprobe: ${locatorError?.message}`);
        }
        if (!EngineMeta.BestAudioHigh?.url) throw new Error(`${colors.red("@error:")} Highest quality audio URL was not found.`);
        instance.addInput(EngineMeta.BestAudioHigh.url);
        const resolutionRegex = /(\d+)p(\d+)?/;
        const resolutionMatch = resolution.match(resolutionRegex);
        const targetHeight = resolutionMatch ? parseInt(resolutionMatch[1], 10) : null;
        const targetFps = resolutionMatch && resolutionMatch[2] ? parseInt(resolutionMatch[2], 10) : null;
        const manifest = EngineMeta.ManifestHigh?.find((i: any) => {
            const fps = i.fps;
            const height = i.height;
            const vcodec = i.vcodec;
            let heightMatches = height === targetHeight;
            let fpsMatches = targetFps === null || fps === targetFps;
            return heightMatches && fpsMatches && vcodec !== "none";
        });
        if (manifest) {
            if (!manifest.url) throw new Error(`${colors.red("@error:")} Video URL not found for resolution: ${resolution}.`);
            instance.addInput(manifest.url.toString());
            instance.withOutputFormat("matroska");
        } else throw new Error(`${colors.red("@error:")} No video data found for resolution: ${resolution}. Use list_formats() maybe?`);
        const filterMap: Record<string, string[]> = {
            invert: ["negate"],
            flipVertical: ["vflip"],
            rotate180: ["rotate=PI"],
            flipHorizontal: ["hflip"],
            rotate90: ["rotate=PI/2"],
            rotate270: ["rotate=3*PI/2"],
            grayscale: ["colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3"],
        };
        if (filter && filterMap[filter]) instance.withVideoFilter(filterMap[filter]);
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
            const filenameBase = `yt-dlx_AudioVideoCustom_${resolution}_`;
            let filename = `${filenameBase}${filter ? filter + "_" : ""}${title}.mkv`;
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
            const filenameBase = `yt-dlx_AudioVideoCustom_${resolution}_`;
            let filename = `${filenameBase}${filter ? filter + "_" : ""}${title}.mkv`;
            const outputPath = path.join(folder, filename);
            instance.output(outputPath);
            await new Promise<void>((resolve, reject) => {
                instance.on("start", command => {
                    if (verbose) console.log(colors.green("@info:"), "FFmpeg download started:", command);
                    if (showProgress) processStartTime = new Date();
                });
                instance.on("progress", progress => {
                    if (showProgress && processStartTime) progbar({ ...progress, percent: progress.percent !== undefined ? progress.percent : 0, startTime: processStartTime });
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
            return { outputPath: outputPath };
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
