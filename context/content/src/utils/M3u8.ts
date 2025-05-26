import * as os from "os";
import pq from "p-queue";
import axios from "axios";
import colors from "colors";
import * as path from "path";
import * as fs from "fs-extra";
import progbar from "./ProgBar";
import { z, ZodError } from "zod";
import ffmpeg from "fluent-ffmpeg";
import { EventEmitter } from "events";
import * as m3u8Parser from "m3u8-parser";

async function Get_M3U8(m3u8Url: string): Promise<string> {
    const response = await axios.get(m3u8Url);
    return response.data;
}

async function Segment_Download(tsUrl: string, index: number, segmentsDir: string, downloadedFiles: string[], totalSegments: number, progbarFn: any): Promise<void> {
    const segmentPath = path.join(segmentsDir, `segment${String(index).padStart(5, "0")}.ts`);
    const response = await axios.get(tsUrl, { responseType: "arraybuffer" });
    await fs.writeFile(segmentPath, response.data);
    downloadedFiles.push(segmentPath);

    progbarFn({ percent: (downloadedFiles.length / totalSegments) * 100, timemark: "N/A", startTime: new Date() });
}

async function TS_Segment_Download(tsUrls: string[], segmentsDir: string, downloadedFiles: string[], queue: pq, progbarFn: any): Promise<void> {
    const totalSegments = tsUrls.length;
    const downloadPromises = tsUrls.map((url, index) => {
        return queue.add(() => Segment_Download(url, index, segmentsDir, downloadedFiles, totalSegments, progbarFn));
    });
    await Promise.all(downloadPromises);
}

async function mergeTsSegments(segmentsDir: string, totalSegments: number): Promise<string> {
    const mergedFilePath = path.join(segmentsDir, "merged.ts");
    const writeStream = fs.createWriteStream(mergedFilePath);
    for (let i = 0; i < totalSegments; i++) {
        const segmentData = await fs.readFile(path.join(segmentsDir, `segment${String(i).padStart(5, "0")}.ts`));
        writeStream.write(segmentData);
    }
    writeStream.end();
    return new Promise((resolve, reject) => {
        writeStream.on("finish", () => resolve(mergedFilePath));
        writeStream.on("error", reject);
    });
}

const M3u8_Options_Schema = z.object({
    FFmpegPath: z.string().min(1, "FFmpegPath must be provided."),
    FFprobePath: z.string().min(1, "FFprobePath must be provided."),
    Audio_M3u8_URL: z.string().url("Audio_M3u8_URL must be a valid URL.").optional(),
    Video_M3u8_URL: z.string().url("Video_M3u8_URL must be a valid URL.").optional(),
    Verbose: z.boolean().optional(),
    configure: z
        .function()
        .args(z.any() as z.ZodType<ffmpeg.FfmpegCommand>)
        .returns(z.void()),
});
interface M3u8_Options extends z.infer<typeof M3u8_Options_Schema> {
    configure: (instance: ffmpeg.FfmpegCommand) => void;
    Verbose?: boolean;
    Video_M3u8_URL?: string;
}

export default class M3u8 extends EventEmitter {
    private options: M3u8_Options;

    constructor(options: M3u8_Options) {
        super();
        try {
            this.options = M3u8_Options_Schema.parse(options);
        } catch (error) {
            if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} M3u8 options validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
            throw error;
        }
    }

    private Parse_M3u8(m3u8Content: string, m3u8Url: string): string[] {
        if (this.options.Verbose) console.log(colors.green("@info: ") + "Parsing Segments...");
        const parser = new m3u8Parser.Parser();
        parser.push(m3u8Content);
        parser.end();
        return (parser.manifest?.segments || [])
            .filter(segment => segment.uri !== undefined)
            .map(segment => {
                return new URL(segment.uri!, m3u8Url).href;
            });
    }

    async getFfmpegCommand(): Promise<ffmpeg.FfmpegCommand> {
        const segmentsDir = path.join(process.cwd(), "YouTubeDLX", "m3u8_segments");
        const queue = new pq({ concurrency: 5 });
        const downloadedFiles: string[] = [];
        const audioUrl = this.options.Audio_M3u8_URL;
        const videoUrl = this.options.Video_M3u8_URL;

        if (!videoUrl) throw new Error(`${colors.red("@error:")} Video_M3u8_URL must be provided in the constructor options.`);

        const isAudioM3u8 = audioUrl ? audioUrl.includes(".m3u8") : false;
        let mergedAudioFilePath: string | undefined;

        try {
            if (this.options.Verbose) console.log(colors.green("@info: ") + "Ensuring Segments Directory Exists...");
            await fs.ensureDir(segmentsDir);

            if (isAudioM3u8 && audioUrl) {
                if (this.options.Verbose) console.log(colors.green("@info: ") + "Downloading Audio Segments...");
                const audioM3u8Content = await Get_M3U8(audioUrl);
                const audioTsUrls = this.Parse_M3u8(audioM3u8Content, audioUrl);
                const totalAudioSegments = audioTsUrls.length;
                await TS_Segment_Download(audioTsUrls, segmentsDir, downloadedFiles, queue, progbar);
                if (this.options.Verbose) console.log(colors.green("@info: ") + "Merging Audio Segments...");
                mergedAudioFilePath = await mergeTsSegments(segmentsDir, totalAudioSegments);
            }

            if (this.options.Verbose) console.log(colors.green("@info: ") + "Creating FFmpeg Command Instance...");
            const instance: ffmpeg.FfmpegCommand = ffmpeg();

            instance.input(videoUrl);
            if (mergedAudioFilePath) instance.input(mergedAudioFilePath);
            else if (audioUrl) instance.input(audioUrl);

            if (this.options.Verbose) console.log(colors.green("@info: ") + "Setting FFmpeg and FFprobe Paths...");
            instance.setFfmpegPath(this.options.FFmpegPath);
            instance.setFfprobePath(this.options.FFprobePath);

            if (this.options.Verbose) console.log(colors.green("@info: ") + "Configuring FFmpeg Instance...");
            this.options.configure(instance);

            return instance;
        } catch (error) {
            if (isAudioM3u8 && (await fs.pathExists(segmentsDir))) await fs.remove(segmentsDir);
            this.emit("error", error);
            throw error;
        }
    }
}
