import * as colors from "colors";
import { promisify } from "util";
import { locator } from "./Locator";
import * as readline from "readline";
import * as retry from "async-retry";
import { Thumbnail } from "../interfaces";
import type { Format, Entry } from "../interfaces";
import type { AudioFormat } from "../interfaces/AudioFormat";
import type { VideoFormat } from "../interfaces/VideoFormat";
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
        const torProcess = spawn(ytDlxPath, ["--tor"], { stdio: ["ignore", "pipe", "pipe"] }) as unknown as ChildProcessWithoutNullStreams;
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
    else if (filesize < bytesPerGigabyte) return (filesize / bytesPerMegabyte).toFixed(2) + " MB";
    else if (filesize < bytesPerTerabyte) return (filesize / bytesPerGigabyte).toFixed(2) + " GB";
    else return (filesize / bytesPerTerabyte).toFixed(2) + " TB";
};
function MapAudioFormat(i: Format): AudioFormat {
    return {
        filesize: i.filesize,
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
        fps: i.fps,
        tbr: i.tbr,
        url: i.url,
        ext: i.ext,
        vbr: i.vbr,
        width: i.width,
        format: i.format,
        height: i.height,
        vcodec: i.vcodec,
        filesize: i.filesize,
        video_ext: i.video_ext,
        container: i.container,
        resolution: i.resolution,
        format_note: i.format_note,
        aspect_ratio: i.aspect_ratio,
        dynamic_range: i.dynamic_range,
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
        }
    }
    const AvailableParsedAudioFormats: AudioFormat[] = [];
    const AvailableParsedVideoFormats: VideoFormat[] = [];
    const AvailableParsedManifestFormats: ManifestFormat[] = [];
    const audioSingleQuality: { Lowest: AudioFormat | null; Highest: AudioFormat | null } = { Lowest: null, Highest: null };
    const audioMultipleQuality: { Lowest: AudioFormat[]; Highest: AudioFormat[] } = { Lowest: [], Highest: [] };
    const audioHasDRC: { Lowest?: AudioFormat[]; Highest?: AudioFormat[] } = {};
    const videoSingleQuality: { Lowest: VideoFormat | null; Highest: VideoFormat | null } = { Lowest: null, Highest: null };
    const videoMultipleQuality: { Lowest: VideoFormat[]; Highest: VideoFormat[] } = { Lowest: [], Highest: [] };
    const videoHasHDR: { Lowest?: VideoFormat[]; Highest?: VideoFormat[] } = {};
    const manifestSingleQuality: { Lowest: ManifestFormat | null; Highest: ManifestFormat | null } = { Lowest: null, Highest: null };
    const manifestMultipleQuality: { Lowest: ManifestFormat[]; Highest: ManifestFormat[] } = { Lowest: [], Highest: [] };
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
    }, retryConfig);
    if (torProcess) {
        torProcess.kill();
        if (verbose) console.log(colors.green("@info:"), `Tor process terminated on ${process.platform === "win32" ? "Windows" : "Linux"}`);
    }
    const i: Entry = JSON.parse(metaCore.stdout.toString().replace(/yt-dlp/g, "yt-dlx"));
    i.formats.forEach((tube: Format) => {
        const formatNote = tube.format_note || "";
        const isDRC = formatNote.includes("DRC");
        const isHDR = formatNote.includes("HDR");
        const isVideo = tube.vcodec !== "none" && tube.vcodec !== undefined && tube.vcodec !== null;
        const isAudio = tube.audio_ext !== undefined && tube.audio_ext !== null && tube.audio_ext !== "none";
        if (isAudio) {
            const mappedAudio: AudioFormat = MapAudioFormat(tube);
            AvailableParsedAudioFormats.push(mappedAudio);
            if (isDRC) {
                if (!audioHasDRC.Lowest || (mappedAudio.filesize !== undefined && audioHasDRC.Lowest[0]?.filesize !== undefined && mappedAudio.filesize < audioHasDRC.Lowest[0].filesize)) {
                    audioHasDRC.Lowest = [mappedAudio];
                }
                if (!audioHasDRC.Highest || (mappedAudio.filesize !== undefined && audioHasDRC.Highest[0]?.filesize !== undefined && mappedAudio.filesize > audioHasDRC.Highest[0].filesize)) {
                    audioHasDRC.Highest = [mappedAudio];
                }
            }
            if (!audioSingleQuality.Lowest || (mappedAudio.filesize !== undefined && audioSingleQuality.Lowest.filesize !== undefined && mappedAudio.filesize < audioSingleQuality.Lowest.filesize)) {
                audioSingleQuality.Lowest = mappedAudio;
            }
            if (
                !audioSingleQuality.Highest ||
                (mappedAudio.filesize !== undefined && audioSingleQuality.Highest.filesize !== undefined && mappedAudio.filesize > audioSingleQuality.Highest.filesize)
            ) {
                audioSingleQuality.Highest = mappedAudio;
            }
            audioMultipleQuality.Lowest.push(mappedAudio);
            audioMultipleQuality.Highest.push(mappedAudio);
        }
        if (isVideo) {
            const mappedVideo = MapVideoFormat(tube);
            AvailableParsedVideoFormats.push(mappedVideo);
            if (isHDR) {
                if (!videoHasHDR.Lowest || (mappedVideo.filesize !== undefined && videoHasHDR.Lowest[0]?.filesize !== undefined && mappedVideo.filesize < videoHasHDR.Lowest[0].filesize)) {
                    videoHasHDR.Lowest = [mappedVideo];
                }
                if (!videoHasHDR.Highest || (mappedVideo.filesize !== undefined && videoHasHDR.Highest[0]?.filesize !== undefined && mappedVideo.filesize > videoHasHDR.Highest[0].filesize)) {
                    videoHasHDR.Highest = [mappedVideo];
                }
            } else {
                if (
                    !videoSingleQuality.Lowest ||
                    (mappedVideo.filesize !== undefined && videoSingleQuality.Lowest.filesize !== undefined && mappedVideo.filesize < videoSingleQuality.Lowest.filesize)
                ) {
                    videoSingleQuality.Lowest = mappedVideo;
                }
                if (
                    !videoSingleQuality.Highest ||
                    (mappedVideo.filesize !== undefined && videoSingleQuality.Highest.filesize !== undefined && mappedVideo.filesize > videoSingleQuality.Highest.filesize)
                ) {
                    videoSingleQuality.Highest = mappedVideo;
                }
                videoMultipleQuality.Lowest.push(mappedVideo);
                videoMultipleQuality.Highest.push(mappedVideo);
            }
        }
        if (tube.protocol === "m3u8_native") {
            const mappedManifest = MapManifest(tube);
            AvailableParsedManifestFormats.push(mappedManifest);
            if (mappedManifest.tbr !== undefined) {
                if (!manifestSingleQuality.Lowest || (manifestSingleQuality.Lowest && (mappedManifest.tbr ?? 0) < (manifestSingleQuality.Lowest.tbr ?? 0))) {
                    manifestSingleQuality.Lowest = mappedManifest;
                }
                if (!manifestSingleQuality.Highest || (manifestSingleQuality.Highest && (mappedManifest.tbr ?? 0) > (manifestSingleQuality.Highest.tbr ?? 0))) {
                    manifestSingleQuality.Highest = mappedManifest;
                }
                manifestMultipleQuality.Lowest.push(mappedManifest);
                manifestMultipleQuality.Highest.push(mappedManifest);
            }
        }
    });
    audioMultipleQuality.Lowest.sort((a, b) => (a.filesize || 0) - (b.filesize || 0));
    audioMultipleQuality.Highest.sort((a, b) => (b.filesize || 0) - (a.filesize || 0));
    videoMultipleQuality.Lowest.sort((a, b) => (a.filesize || 0) - (b.filesize || 0));
    videoMultipleQuality.Highest.sort((a, b) => (b.filesize || 0) - (a.filesize || 0));
    manifestMultipleQuality.Lowest.sort((a, b) => (a.tbr ?? 0) - (b.tbr ?? 0));
    manifestMultipleQuality.Highest.sort((a, b) => (b.tbr ?? 0) - (a.tbr ?? 0));
    const payLoad: EngineOutput = {
        MetaData: {
            id: i.id,
            title: i.title,
            channel: i.channel,
            uploader: i.uploader,
            duration: i.duration,
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
            thumbnails: {
                Highest: Object.values(i.thumbnails || {})
                    .filter((thumbnail): thumbnail is Thumbnail => thumbnail != null && typeof thumbnail === "object" && "url" in thumbnail)
                    .reduce((prev: Thumbnail | null, curr: Thumbnail) => ((prev?.width ?? 0) * (prev?.height ?? 0) > curr.width * curr.height ? prev : curr), null),
                Lowest: Object.values(i.thumbnails || {})
                    .filter((thumbnail): thumbnail is Thumbnail => thumbnail != null && typeof thumbnail === "object" && "url" in thumbnail)
                    .reduce((prev: Thumbnail | null, curr: Thumbnail) => ((prev?.width ?? 0) * (prev?.height ?? 0) < curr.width * curr.height ? prev : curr), null),
                Combined: Object.values(i.thumbnails || {}).filter((thumbnail): thumbnail is Thumbnail => thumbnail != null && typeof thumbnail === "object" && "url" in thumbnail),
            },
        },
        AvailableFormats: { Audio: AvailableParsedAudioFormats, Video: AvailableParsedVideoFormats, Manifest: AvailableParsedManifestFormats },
        Audio: {
            HasDRC: audioHasDRC.Lowest || audioHasDRC.Highest ? audioHasDRC : {},
            SingleQuality: { Lowest: audioSingleQuality.Lowest!, Highest: audioSingleQuality.Highest! },
            MultipleQuality: { Lowest: audioMultipleQuality.Lowest, Highest: audioMultipleQuality.Highest },
        },
        Video: {
            HasHDR: videoHasHDR.Lowest || videoHasHDR.Highest ? videoHasHDR : {},
            SingleQuality: { Lowest: videoSingleQuality.Lowest!, Highest: videoSingleQuality.Highest! },
            MultipleQuality: { Lowest: videoMultipleQuality.Lowest, Highest: videoMultipleQuality.Highest },
        },
        Manifest: {
            SingleQuality: { Lowest: manifestSingleQuality.Lowest!, Highest: manifestSingleQuality.Highest! },
            MultipleQuality: { Lowest: manifestMultipleQuality.Lowest, Highest: manifestMultipleQuality.Highest },
        },
    };
    return payLoad;
}
