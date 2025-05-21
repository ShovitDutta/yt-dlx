import * as colors from "colors";
import * as retry from "async-retry";
import * as readline from "readline";
import { promisify } from "util";
import { locator } from "./locator";
// import type sizeFormat from "../interfaces/sizeFormat";
import type { AudioFormat } from "../interfaces/AudioFormat";
import type { VideoFormat } from "../interfaces/VideoFormat";
import type { Format, Entry } from "../interfaces/ytprobe";
import type { EngineOutput } from "../interfaces/EngineOutput";
import type { ManifestFormat } from "../interfaces/ManifestFormat";
import { spawn, execFile, ChildProcessWithoutNullStreams } from "child_process";
let cachedLocatedPaths: Record<string, string> | null = null;
export const getLocatedPaths = async (): Promise<Record<string, string>> => {
    if (cachedLocatedPaths === null) cachedLocatedPaths = await locator();
    return cachedLocatedPaths;
};
const startTor = async (ytDlxPath: string, verbose = false): Promise<ChildProcessWithoutNullStreams> => {
    return new Promise(async (resolve, reject) => {
        if (verbose) console.log(colors.green("@info:"), `Attempting to spawn Tor using yt-dlx at: ${ytDlxPath}`);
        const torProcess = spawn(ytDlxPath, ["--tor"], { stdio: ["ignore", "pipe", "pipe"] }) as any as ChildProcessWithoutNullStreams;
        const rlStdout = readline.createInterface({ input: torProcess.stdout, output: process.stdout, terminal: false });
        const rlStderr = readline.createInterface({ input: torProcess.stderr, output: process.stderr, terminal: false });
        rlStdout.on("line", line => {
            if (verbose) console.log(colors.green("@info:"), line);
            if (line.includes("Bootstrapped 100% (done): Done")) {
                if (verbose) console.log(colors.green("@info:"), "Tor is 100% bootstrapped!");
                rlStdout.removeAllListeners("line");
                rlStderr.removeAllListeners("line");
                resolve(torProcess);
            }
        });
        rlStderr.on("line", line => {
            if (verbose) console.error(colors.red("@error:"), line);
        });
        torProcess.on("error", err => {
            console.error(colors.red("@error:"), "Tor process error:", err);
            reject(err);
        });
        torProcess.on("close", code => {
            console.log(colors.green("@info:"), `Tor process closed with code ${code}`);
            if (code !== 0) reject(new Error(`Tor process exited with code ${code} before bootstrapping.`));
        });
        if (verbose) console.log(colors.green("@info:"), `Spawned yt-dlx --tor process with PID: ${torProcess.pid} using ${ytDlxPath}. Waiting for bootstrap...`);
    });
};
export var sizeFormat = (filesize: number): string | number => {
    if (isNaN(filesize) || filesize < 0) return filesize;
    let bytesPerMegabyte = 1024 * 1024;
    var bytesPerGigabyte = bytesPerMegabyte * 1024;
    var bytesPerTerabyte = bytesPerGigabyte * 1024;
    if (filesize < bytesPerMegabyte) return filesize + " B";
    else if (filesize < bytesPerGigabyte) {
        return (filesize / bytesPerGigabyte).toFixed(2) + " MB";
    } else if (filesize < bytesPerTerabyte) {
        return (filesize / bytesPerGigabyte).toFixed(2) + " GB";
    } else return (filesize / bytesPerTerabyte).toFixed(2) + " TB";
};
function CleanAudioFormat(i: Format): AudioFormat {
    // i.filesizeP = sizeFormat(i.filesize);
    const item = i as any;
    if (item.format_id) delete item.format_id;
    if (item.source_preference) delete item.source_preference;
    if (item.has_drm) delete item.has_drm;
    if (item.quality) delete item.quality;
    if (item.fps) delete item.fps;
    if (item.height) delete item.height;
    if (item.width) delete item.width;
    if (item.language) delete item.language;
    if (item.language_preference) delete item.language_preference;
    if (item.preference) delete item.preference;
    if (item.dynamic_range) delete item.dynamic_range;
    if (item.downloader_options) delete item.downloader_options;
    if (item.protocol) delete item.protocol;
    if (item.aspect_ratio) delete item.aspect_ratio;
    if (item.vbr) delete item.vbr;
    if (item.vcodec) delete item.vcodec;
    if (item.http_headers) delete item.http_headers;
    if (item.video_ext) delete item.video_ext;
    return i as AudioFormat;
}
function CeanVideoFormat(i: VideoFormat): VideoFormat {
    // i.filesizeP = sizeFormat(i.filesize);
    return i;
}
function MapAudioFormat(i: Format): AudioFormat {
    return {
        filesize: i.filesize,
        // filesizeP: sizeFormat(i.filesize) as string,
        asr: i.asr,
        format_note: i.format_note,
        tbr: i.tbr,
        url: i.url,
        ext: i.ext,
        acodec: i.acodec,
        container: i.container,
        resolution: i.resolution,
        audio_ext: i.audio_ext,
        abr: i.abr,
        format: i.format,
    };
}
function MapVideoFormat(i: Format): VideoFormat {
    return {
        filesize: i.filesize,
        // filesizeP: sizeFormat(i.filesize) as string,
        format_note: i.format_note,
        fps: i.fps,
        height: i.height,
        width: i.width,
        tbr: i.tbr,
        url: i.url,
        ext: i.ext,
        vcodec: i.vcodec,
        dynamic_range: i.dynamic_range,
        container: i.container,
        resolution: i.resolution,
        aspect_ratio: i.aspect_ratio,
        video_ext: i.video_ext,
        vbr: i.vbr,
        format: i.format,
    };
}
function MapManifest(i: Format): ManifestFormat {
    return {
        url: i.url,
        manifest_url: i.manifest_url,
        tbr: i.tbr,
        ext: i.ext,
        fps: i.fps,
        width: i.width,
        height: i.height,
        vcodec: i.vcodec,
        dynamic_range: i.dynamic_range,
        aspect_ratio: i.aspect_ratio,
        video_ext: i.video_ext,
        vbr: i.vbr,
        format: i.format,
    };
}
function FilterFormats(formats: Format[]): Format[] {
    return formats.filter(i => {
        return !i.format_note.includes("DRC") && !i.format_note.includes("HDR");
    });
}
const config = { factor: 2, retries: 3, minTimeout: 1000, maxTimeout: 3000 };
export default async function Engine(options: {
    query: string;
    useTor?: boolean;
    verbose?: boolean;
    retryConfig?: { factor: number; retries: number; minTimeout: number; maxTimeout: number };
}): Promise<EngineOutput | null> {
    const { query, useTor = false, verbose = false, retryConfig = config } = options;
    let torProcess: ChildProcessWithoutNullStreams | null = null;
    const located = await getLocatedPaths();
    const ytDlxPath = located["yt-dlx"];
    const ffmpegPath = located["ffmpeg"];
    if (!ytDlxPath) {
        console.error(colors.red("@error:"), "yt-dlx executable path not found.");
        return null;
    }
    if (useTor) {
        try {
            if (verbose) console.log(colors.green("@info:"), "Attempting to start Tor and wait for bootstrap...");
            torProcess = await startTor(ytDlxPath, verbose);
            if (verbose) console.log(colors.green("@info:"), `Tor is ready for ${process.platform === "win32" ? "Windows" : "Linux"}.`);
        } catch (error) {
            console.error(colors.red("@error:"), "Failed to start Tor:", error);
            let useTor = false;
        }
    }
    var AudioLow: Record<string, Format> = {};
    var AudioHigh: Record<string, Format> = {};
    var VideoLow: Record<string, Format> = {};
    var VideoHigh: Record<string, Format> = {};
    var ManifestLow: Record<string, Format> = {};
    var ManifestHigh: Record<string, Format> = {};
    var AudioLowDRC: Record<string, Format> = {};
    var AudioHighDRC: Record<string, Format> = {};
    var VideoLowHDR: Record<string, Format> = {};
    var VideoHighHDR: Record<string, Format> = {};
    var BestAudioLow: AudioFormat | null = null;
    var BestAudioHigh: AudioFormat | null = null;
    var BestVideoLow: VideoFormat | null = null;
    var BestVideoHigh: VideoFormat | null = null;
    const ytprobeArgs = [
        "--ytprobe",
        "--dump-single-json",
        query,
        "--no-check-certificate",
        "--prefer-insecure",
        "--no-call-home",
        "--skip-download",
        "--no-warnings",
        "--geo-bypass",
        "--user-agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
    ];
    const ytprobeIndex = ytprobeArgs.indexOf("--ytprobe");
    const insertIndex = ytprobeIndex !== -1 ? ytprobeIndex + 1 : 1;
    const argsToInsert: string[] = [];
    if (useTor) {
        argsToInsert.push("--proxy", "socks5://127.0.0.1:9050");
        if (verbose) console.log(colors.green("@info:"), "Adding Tor proxy arguments.");
    }
    if (ffmpegPath) {
        argsToInsert.push("--ffmpeg", ffmpegPath);
        if (verbose) console.log(colors.green("@info:"), `Adding ffmpeg path argument: ${ffmpegPath}`);
    } else {
        console.warn(colors.yellow("@warn:"), "ffmpeg executable path not found. yt-dlx may use its built-in downloader or fail for some formats.");
    }
    if (verbose) {
        argsToInsert.push("--verbose");
        if (verbose) console.log(colors.green("@info:"), "Adding verbose argument for yt-dlx.");
    }
    if (argsToInsert.length > 0) {
        ytprobeArgs.splice(insertIndex, 0, ...argsToInsert);
    }
    var metaCore = await retry.default(async () => {
        return await promisify(execFile)(ytDlxPath, ytprobeArgs);
    }, config);
    if (torProcess) {
        torProcess.kill();
        if (verbose) console.log(colors.green("@info:"), `Tor process terminated on ${process.platform === "win32" ? "Windows" : "Linux"}`);
    }
    const i: Entry = JSON.parse(metaCore.stdout.toString().replace(/yt-dlp/g, "yt-dlx"));
    i.formats.forEach((tube: Format) => {
        var rm = new Set(["storyboard", "Default"]);
        if (!rm.has(tube.format_note) && tube.protocol === "m3u8_native" && tube.vbr) {
            if (tube.resolution && (!ManifestLow[tube.resolution] || tube.vbr < ManifestLow[tube.resolution].vbr)) ManifestLow[tube.resolution] = tube;
            if (tube.resolution && (!ManifestHigh[tube.resolution] || tube.vbr > ManifestHigh[tube.resolution].vbr)) ManifestHigh[tube.resolution] = tube;
        }
        if (rm.has(tube.format_note) || tube.filesize === undefined || null) return;
        if (tube.format_note.includes("DRC")) {
            if (tube.resolution && AudioLow[tube.resolution] && !AudioLowDRC[tube.resolution]) {
                AudioLowDRC[tube.resolution] = AudioLow[tube.resolution];
            }
            if (tube.resolution && AudioHigh[tube.resolution] && !AudioHighDRC[tube.resolution]) {
                AudioHighDRC[tube.resolution] = AudioHigh[tube.resolution];
            }
            AudioLowDRC[tube.format_note] = tube;
            AudioHighDRC[tube.format_note] = tube;
        } else if (tube.format_note.includes("HDR")) {
            const videoLowHDRFilesize = VideoLowHDR[tube.format_note] ? VideoLowHDR[tube.format_note].filesize : undefined;
            const videoHighHDRFilesize = VideoHighHDR[tube.format_note] ? VideoHighHDR[tube.format_note].filesize : undefined;
            if (VideoLowHDR[tube.format_note] && (!VideoLowHDR[tube.format_note] || (videoLowHDRFilesize && tube.filesize < videoLowHDRFilesize))) VideoLowHDR[tube.format_note] = tube;
            if (VideoHighHDR[tube.format_note] && (!VideoHighHDR[tube.format_note] || (videoHighHDRFilesize && tube.filesize > videoHighHDRFilesize))) VideoHighHDR[tube.format_note] = tube;
        }
        var prevLowVideo = VideoLow[tube.format_note];
        var prevHighVideo = VideoHigh[tube.format_note];
        var prevLowAudio = AudioLow[tube.format_note];
        var prevHighAudio = AudioHigh[tube.format_note];
        switch (true) {
            case tube.format_note.includes("p"):
                if (prevLowVideo && (!prevLowVideo || (prevLowVideo.filesize && tube.filesize < prevLowVideo.filesize))) VideoLow[tube.format_note] = tube;
                if (prevHighVideo && (!prevHighVideo || (prevHighVideo.filesize && tube.filesize > prevHighVideo.filesize))) VideoHigh[tube.format_note] = tube;
                break;
            default:
                if (prevLowAudio && (!prevLowAudio || (prevLowAudio.filesize && tube.filesize < prevLowAudio.filesize))) AudioLow[tube.format_note] = tube;
                if (prevHighAudio && (!prevHighAudio || (prevHighAudio.filesize && tube.filesize > prevHighAudio.filesize))) AudioHigh[tube.format_note] = tube;
                break;
        }
    });
    (Object.values(AudioLow) as AudioFormat[]).forEach((audio: AudioFormat) => {
        if (audio.filesize !== null) {
            switch (true) {
                case !BestAudioLow || (audio.filesize && BestAudioLow.filesize && audio.filesize < BestAudioLow.filesize):
                    BestAudioLow = audio;
                    break;
                case !BestAudioHigh || (audio.filesize && BestAudioHigh.filesize && audio.filesize > BestAudioHigh.filesize):
                    BestAudioHigh = audio;
                    break;
                default:
                    break;
            }
        }
    });
    (Object.values(VideoLow) as VideoFormat[]).forEach((video: VideoFormat) => {
        if (video.filesize !== null) {
            switch (true) {
                case !BestVideoLow || (video.filesize && BestVideoLow.filesize && video.filesize < BestVideoLow.filesize):
                    BestVideoLow = video;
                    break;
                case !BestVideoHigh || (video.filesize && BestVideoHigh.filesize && video.filesize > BestVideoHigh.filesize):
                    BestVideoHigh = video;
                    break;
                default:
                    break;
            }
        }
    });
    var payLoad: EngineOutput = {
        BestAudioLow: (() => {
            var i = BestAudioLow || ({} as AudioFormat);
            return CleanAudioFormat(i as any);
        })(),
        BestAudioHigh: (() => {
            var i = BestAudioHigh || ({} as AudioFormat);
            return CleanAudioFormat(i as any);
        })(),
        BestVideoLow: (() => {
            var i = BestVideoLow || ({} as VideoFormat);
            return CeanVideoFormat(i);
        })(),
        BestVideoHigh: (() => {
            var i = BestVideoHigh || ({} as VideoFormat);
            return CeanVideoFormat(i);
        })(),
        allFormats: i.formats,
        AudioLowDRC: Object.values(AudioLowDRC).map(i => MapAudioFormat(i)),
        AudioHighDRC: Object.values(AudioHighDRC).map(i => MapAudioFormat(i)),
        AudioLow: FilterFormats(Object.values(AudioLow)).map(i => MapAudioFormat(i)),
        AudioHigh: FilterFormats(Object.values(AudioHigh)).map(i => MapAudioFormat(i)),
        VideoLowHDR: Object.values(VideoLowHDR).map(i => MapVideoFormat(i)),
        VideoHighHDR: Object.values(VideoHighHDR).map(i => MapVideoFormat(i)),
        VideoLow: FilterFormats(Object.values(VideoLow)).map(i => MapVideoFormat(i)),
        VideoHigh: FilterFormats(Object.values(VideoHigh)).map(i => MapVideoFormat(i)),
        ManifestLow: Object.values(ManifestLow).map(i => MapManifest(i)),
        ManifestHigh: Object.values(ManifestHigh).map(i => MapManifest(i)),
        metaData: {
            id: i.id,
            title: i.title,
            channel: i.channel,
            uploader: i.uploader,
            duration: i.duration,
            thumbnails: i.thumbnails,
            age_limit: i.age_limit,
            channel_id: i.channel_id,
            categories: i.categories,
            display_id: i.display_id,
            view_count: i.view_count,
            like_count: i.like_count,
            description: i.description,
            channel_url: i.channel_url,
            webpage_url: i.webpage_url,
            live_status: i.live_status,
            upload_date: i.upload_date,
            uploader_id: i.uploader_id,
            original_url: i.original_url,
            uploader_url: i.uploader_url,
            comment_count: i.comment_count,
            duration_string: i.duration_string,
            channel_follower_count: i.channel_follower_count,
        },
    };
    return payLoad;
}
