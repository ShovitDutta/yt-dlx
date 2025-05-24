import * as colors from "colors";
import { promisify } from "util";
import { locator } from "./Locator";
import * as readline from "readline";
import * as retry from "async-retry";
import { spawn, execFile, ChildProcessWithoutNullStreams } from "child_process";
import { EngineOutput, OriginalJson, CleanedAudioFormat, CleanedVideoFormat } from "../interfaces/EngineOutput";
let cachedLocatedPaths: Record<string, string> | null = null;
export const getLocatedPaths = async (): Promise<Record<string, string>> => {
    if (cachedLocatedPaths === null) cachedLocatedPaths = await locator();
    return cachedLocatedPaths;
};
const startTor = async (ytDlxPath: string, Verbose = false): Promise<ChildProcessWithoutNullStreams> => {
    return new Promise(async (resolve, reject) => {
        if (Verbose) console.log(colors.green("@info: ") + "Attempting to spawn Tor using yt-dlx at: " + ytDlxPath);
        const torProcess = spawn(ytDlxPath, ["--tor"], { stdio: ["ignore", "pipe", "pipe"] }) as unknown as ChildProcessWithoutNullStreams;
        const rlStdout = readline.createInterface({ input: torProcess.stdout, output: process.stdout, terminal: false });
        const rlStderr = readline.createInterface({ input: torProcess.stderr, output: process.stderr, terminal: false });
        rlStdout.on("line", line => {
            if (Verbose) console.log(colors.green("@info: ") + line);
            if (line.includes("Bootstrapped 100% (done): Done")) {
                if (Verbose) console.log(colors.green("@info: ") + "Tor is 100% bootstrapped!");
                rlStdout.removeAllListeners("line");
                rlStderr.removeAllListeners("line");
                resolve(torProcess);
            }
        });
        rlStderr.on("line", line => {
            if (Verbose) console.error(colors.red("@error: ") + line);
        });
        torProcess.on("error", err => {
            console.error(colors.red("@error: ") + "Tor process error: " + err);
            reject(err);
        });
        torProcess.on("close", code => {
            console.log(colors.green("@info: ") + "Tor process closed with code " + code);
            if (code !== 0) reject(new Error(`Tor process exited with code ${code} before bootstrapping.`));
        });
        if (Verbose) console.log(colors.green("@info: ") + "Spawned yt-dlx --tor process with PID: " + torProcess.pid + " using " + ytDlxPath + ". Waiting for bootstrap...");
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
const config = { factor: 2, retries: 3, minTimeout: 1000, maxTimeout: 3000 };
export default async function Engine(options: {
    Query: string;
    UseTor?: boolean;
    Verbose?: boolean;
    retryConfig?: { factor: number; retries: number; minTimeout: number; maxTimeout: number };
}): Promise<EngineOutput | null> {
    const { Query, UseTor = false, Verbose = false, retryConfig = config } = options;
    let torProcess: ChildProcessWithoutNullStreams | null = null;
    const located = await getLocatedPaths();
    const ytDlxPath = located["yt-dlx"];
    const ffmpegPath = located["ffmpeg"];
    if (!ytDlxPath) {
        console.error(colors.red("@error: ") + "yt-dlx executable path not found.");
        return null;
    }
    if (UseTor) {
        try {
            if (Verbose) console.log(colors.green("@info: ") + "Attempting to start Tor and wait for bootstrap...");
            torProcess = await startTor(ytDlxPath, Verbose);
            if (Verbose) console.log(colors.green("@info: ") + "Tor is ready for " + (process.platform === "win32" ? "Windows" : "Linux") + ".");
        } catch (error) {
            console.error(colors.red("@error:"), "Failed to start Tor:", error);
        }
    }
    const ytprobeArgs = [
        "--ytprobe",
        "--dump-single-json",
        Query,
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
    if (UseTor) {
        argsToInsert.push("--proxy", "socks5://127.0.0.1:9050");
        if (Verbose) console.log(colors.green("@info:"), "Adding Tor proxy arguments.");
    }
    if (ffmpegPath) {
        argsToInsert.push("--ffmpeg", ffmpegPath);
        if (Verbose) console.log(colors.green("@info:"), `Adding ffmpeg path argument: ${ffmpegPath}`);
    } else {
        console.warn(colors.yellow("@warn:"), "ffmpeg executable path not found. yt-dlx may use its built-in downloader or fail for some formats.");
    }
    if (Verbose) {
        argsToInsert.push("--Verbose");
        if (Verbose) console.log(colors.green("@info:"), "Adding Verbose argument for yt-dlx.");
    }
    if (argsToInsert.length > 0) {
        ytprobeArgs.splice(insertIndex, 0, ...argsToInsert);
    }
    var metaCore = await retry.default(async () => {
        return await promisify(execFile)(ytDlxPath, ytprobeArgs);
    }, retryConfig);
    if (torProcess) {
        torProcess.kill();
        if (Verbose) console.log(colors.green("@info:"), `Tor process terminated on ${process.platform === "win32" ? "Windows" : "Linux"}`);
    }
    const rawresp: OriginalJson = JSON.parse(metaCore.stdout.toString().replace(/yt-dlp/g, "yt-dlx"));
    const AllFormats = rawresp.formats || [];
    const NoStoryboard = AllFormats.filter(f => {
        return !f.format_note || !f.format_note.toLowerCase().includes("storyboard");
    });
    const AudioOnlyFormats: OriginalJson["formats"] = [];
    const VideoOnlyFormats: OriginalJson["formats"] = [];
    NoStoryboard.forEach(f => {
        if (f.resolution && f.resolution.toLowerCase().includes("audio")) AudioOnlyFormats.push(f);
        else VideoOnlyFormats.push(f);
    });
    const RemoveVideoFormatProperty = (formatsArray: OriginalJson["formats"]): CleanedVideoFormat[] => {
        if (!formatsArray) return [];
        return formatsArray.map(format => {
            if (!format) return format as CleanedVideoFormat;
            const newFormat: Partial<NonNullable<OriginalJson["formats"]>[number]> = { ...format };
            delete newFormat.source_preference;
            delete newFormat.__needs_testing;
            delete newFormat.http_headers;
            delete newFormat.format_index;
            delete newFormat.__working;
            delete newFormat.audio_ext;
            delete newFormat.preference;
            delete newFormat.format;
            delete newFormat.acodec;
            delete newFormat.abr;
            return newFormat as CleanedVideoFormat;
        });
    };
    const RemoveAudioFormatProperty = (formatsArray: OriginalJson["formats"]): CleanedAudioFormat[] => {
        if (!formatsArray) return [];
        return formatsArray.map(format => {
            if (!format) return format as CleanedAudioFormat;
            const newFormat: Partial<NonNullable<OriginalJson["formats"]>[number]> = { ...format };
            delete newFormat.source_preference;
            delete newFormat.__needs_testing;
            delete newFormat.http_headers;
            delete newFormat.format_index;
            delete newFormat.aspect_ratio;
            delete newFormat.resolution;
            delete newFormat.preference;
            delete newFormat.__working;
            delete newFormat.video_ext;
            delete newFormat.quality;
            delete newFormat.vcodec;
            delete newFormat.format;
            delete newFormat.ext;
            delete newFormat.vbr;
            return newFormat as CleanedAudioFormat;
        });
    };
    const cleanedAudioOnlyFormats = RemoveAudioFormatProperty(AudioOnlyFormats);
    const cleanedVideoOnlyFormats = RemoveVideoFormatProperty(VideoOnlyFormats);
    const drcAudioFormats = cleanedAudioOnlyFormats.filter(f => f.format_note && f.format_note.toLowerCase().includes("drc"));
    const nonDrcAudioFormats = cleanedAudioOnlyFormats.filter(f => !f.format_note || !f.format_note.toLowerCase().includes("drc"));
    const groupAudioFormatsByLanguage = (formats: CleanedAudioFormat[]) => {
        const formatsByLanguage: { [key: string]: CleanedAudioFormat[] } = {};
        formats.forEach(format => {
            const languageMatch = format.format_note?.match(/^([^ -]+)/);
            const language = languageMatch ? languageMatch[1] : "Unknown";
            if (!formatsByLanguage[language]) formatsByLanguage[language] = [];
            formatsByLanguage[language].push(format);
        });
        return formatsByLanguage;
    };
    const processLanguageGroup = (formats: CleanedAudioFormat[]) => {
        let highest: CleanedAudioFormat | null = null;
        let lowest: CleanedAudioFormat | null = null;
        formats.forEach(format => {
            if (highest === null || lowest === null) {
                highest = format;
                lowest = format;
                return;
            }
            if (parseInt(format.format_id!) > parseInt(highest.format_id!)) highest = format;
            if (parseInt(format.format_id!) < parseInt(lowest.format_id!)) lowest = format;
        });
        return { Highest: highest, Lowest: lowest, Combined: formats };
    };
    const nonDrcAudioByLanguage = groupAudioFormatsByLanguage(nonDrcAudioFormats);
    const drcAudioByLanguage = groupAudioFormatsByLanguage(drcAudioFormats);
    const audioOnlyData: {
        Standard: { [key: string]: { Highest: CleanedAudioFormat | null; Lowest: CleanedAudioFormat | null; Combined: CleanedAudioFormat[] } };
        Dynamic_Range_Compression: { [key: string]: { Highest: CleanedAudioFormat | null; Lowest: CleanedAudioFormat | null; Combined: CleanedAudioFormat[] } };
    } = { Standard: {}, Dynamic_Range_Compression: {} };
    for (const language in nonDrcAudioByLanguage) audioOnlyData.Standard[language] = processLanguageGroup(nonDrcAudioByLanguage[language]);
    for (const language in drcAudioByLanguage) audioOnlyData.Dynamic_Range_Compression[language] = processLanguageGroup(drcAudioByLanguage[language]);
    const sdrVideoFormats = cleanedVideoOnlyFormats.filter(f => f.dynamic_range === "SDR");
    const hdrVideoFormats = cleanedVideoOnlyFormats.filter(f => f.dynamic_range && f.dynamic_range.toLowerCase().includes("hdr"));
    let highestSdrVideoFormat: CleanedVideoFormat | null = null;
    let lowestSdrVideoFormat: CleanedVideoFormat | null = null;
    sdrVideoFormats.forEach(format => {
        if (highestSdrVideoFormat === null || lowestSdrVideoFormat === null) {
            highestSdrVideoFormat = format;
            lowestSdrVideoFormat = format;
            return;
        }
        if (format.vbr !== null && highestSdrVideoFormat.vbr !== null) {
            if (format.vbr! > highestSdrVideoFormat.vbr!) highestSdrVideoFormat = format;
        } else if (format.vbr !== null && highestSdrVideoFormat.vbr === null) highestSdrVideoFormat = format;
        else if (format.height !== null && highestSdrVideoFormat.height !== null) {
            if (format.height! > highestSdrVideoFormat.height!) highestSdrVideoFormat = format;
        } else if (format.height !== null && highestSdrVideoFormat.height === null) highestSdrVideoFormat = format;
        if (format.vbr !== null && lowestSdrVideoFormat.vbr !== null) {
            if (format.vbr! < lowestSdrVideoFormat.vbr!) lowestSdrVideoFormat = format;
        } else if (format.vbr !== null && lowestSdrVideoFormat.vbr === null) {
        } else if (format.height !== null && lowestSdrVideoFormat.height !== null) {
            if (format.height! < lowestSdrVideoFormat.height!) lowestSdrVideoFormat = format;
        } else if (format.height !== null && lowestSdrVideoFormat.height === null) {
        }
    });
    let highestHdrVideoFormat: CleanedVideoFormat | null = null;
    let lowestHdrVideoFormat: CleanedVideoFormat | null = null;
    hdrVideoFormats.forEach(format => {
        if (highestHdrVideoFormat === null || lowestHdrVideoFormat === null) {
            highestHdrVideoFormat = format;
            lowestHdrVideoFormat = format;
            return;
        }
        if (format.vbr !== null && highestHdrVideoFormat.vbr !== null) {
            if (format.vbr! > highestHdrVideoFormat.vbr!) highestHdrVideoFormat = format;
        } else if (format.vbr !== null && highestHdrVideoFormat.vbr === null) highestHdrVideoFormat = format;
        else if (format.height !== null && highestHdrVideoFormat.height !== null) {
            if (format.height! > highestHdrVideoFormat.height!) highestHdrVideoFormat = format;
        } else if (format.height !== null && highestHdrVideoFormat.height === null) highestHdrVideoFormat = format;
        if (format.vbr !== null && lowestHdrVideoFormat.vbr !== null) {
            if (format.vbr! < lowestHdrVideoFormat.vbr!) lowestHdrVideoFormat = format;
        } else if (format.vbr !== null && lowestHdrVideoFormat.vbr === null) {
        } else if (format.height !== null && lowestHdrVideoFormat.height !== null) {
            if (format.height! < lowestHdrVideoFormat.height!) lowestHdrVideoFormat = format;
        } else if (format.height !== null && lowestHdrVideoFormat.height === null) {
        }
    });
    const filteredThumbnails = (rawresp.thumbnails || []).filter(thumbnail => thumbnail.resolution);
    const cleanedThumbnails = filteredThumbnails.map(thumbnail => {
        const newThumbnail = { ...thumbnail };
        delete newThumbnail.preference;
        delete newThumbnail.id;
        return newThumbnail;
    });
    let highestThumbnail: NonNullable<OriginalJson["thumbnails"]>[number] | null = null;
    let lowestThumbnail: NonNullable<OriginalJson["thumbnails"]>[number] | null = null;
    cleanedThumbnails.forEach(thumbnail => {
        if (highestThumbnail === null || lowestThumbnail === null) {
            highestThumbnail = thumbnail;
            lowestThumbnail = thumbnail;
            return;
        }
        const currentResolution = (thumbnail.width || 0) * (thumbnail.height || 0);
        const highestResolution = (highestThumbnail.width || 0) * (highestThumbnail.height || 0);
        const lowestResolution = (lowestThumbnail.width || 0) * (lowestThumbnail.height || 0);
        if (currentResolution > highestResolution) highestThumbnail = thumbnail;
        if (currentResolution < lowestResolution) lowestThumbnail = thumbnail;
    });
    const FinalData: EngineOutput = {
        MetaData: {
            videoId: rawresp.id,
            videoLink: rawresp.webpage_url,
            title: rawresp.title,
            description: rawresp.description,
            channel_id: rawresp.channel_id,
            channel_url: rawresp.channel_url,
            duration: rawresp.duration,
            view_count: rawresp.view_count,
            average_rating: rawresp.average_rating,
            age_limit: rawresp.age_limit,
            categories: rawresp.categories,
            playable_in_embed: rawresp.playable_in_embed,
            live_status: rawresp.live_status,
            media_type: rawresp.media_type,
            release_timestamp: rawresp.release_timestamp,
            _format_sort_fields: rawresp._format_sort_fields,
            like_count: rawresp.like_count,
            channel: rawresp.channel,
            channel_follower_count: rawresp.channel_follower_count,
            channel_is_verified: rawresp.channel_is_verified,
            uploader: rawresp.uploader,
            uploader_id: rawresp.uploader_id,
            uploader_url: rawresp.uploader_url,
            upload_date: rawresp.upload_date,
            timestamp: rawresp.timestamp,
            availability: rawresp.availability,
            original_url: rawresp.original_url,
            webpage_url_basename: rawresp.webpage_url_basename,
            webpage_url_domain: rawresp.webpage_url_domain,
            extractor: rawresp.extractor,
            extractor_key: rawresp.extractor_key,
            playlist: rawresp.playlist,
            playlist_index: rawresp.playlist_index,
            display_id: rawresp.display_id,
            fulltitle: rawresp.fulltitle,
            duration_string: rawresp.duration_string,
            release_year: rawresp.release_year,
            is_live: rawresp.is_live,
            was_live: rawresp.was_live,
            requested_subtitles: rawresp.requested_subtitles,
            _has_drm: rawresp._has_drm,
            last_fetched: rawresp.epoch,
            tags: rawresp.tags,
        },
        AudioOnly: audioOnlyData,
        VideoOnly: {
            Standard_Dynamic_Range: { Highest: highestSdrVideoFormat, Lowest: lowestSdrVideoFormat, Combined: sdrVideoFormats },
            High_Dynamic_Range: { Highest: highestHdrVideoFormat, Lowest: lowestHdrVideoFormat, Combined: hdrVideoFormats },
        },
        Thumbnails: { Highest: highestThumbnail, Lowest: lowestThumbnail, Combined: cleanedThumbnails },
        Heatmap: rawresp.heatmap || [],
        Chapters: rawresp.chapters || [],
        Subtitle: rawresp.subtitles || [],
        Captions: rawresp.automatic_captions || [],
    };
    return FinalData;
}
