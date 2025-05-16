import colors from "colors";
import retry from "async-retry";
import readline from "readline";
import { promisify } from "util";
import { locator } from "./locator";
import type { Readable } from "stream";
import { spawn, execFile, ChildProcess } from "child_process";

export interface sizeFormat {
    (filesize: number): Promise<string | number>;
}
export interface VideoFormat {
    filesize: number;
    filesizeP: string | number;
    format_note: string;
    fps: number;
    height: number;
    width: number;
    tbr: number;
    url: string;
    ext: string;
    vcodec: string;
    dynamic_range: string;
    container: string;
    resolution: string;
    aspect_ratio: number;
    video_ext: string;
    vbr: number;
    format: string;
}

export interface VideoInfo {
    id: string;
    title: string;
    channel: string;
    uploader: string;
    duration: number;
    thumbnail: string;
    age_limit: number;
    channel_id: string;
    categories: string[];
    display_id: string;
    description: string;
    channel_url: string;
    webpage_url: string;
    live_status: boolean;
    view_count: number;
    like_count: number;
    comment_count: number;
    channel_follower_count: number;
    upload_date: string;
    uploader_id: string;
    original_url: string;
    uploader_url: string;
    duration_string: string;
}
export interface AudioFormat {
    filesize: number;
    filesizeP: string | number;
    asr: number;
    format_note: string;
    tbr: number;
    url: string;
    ext: string;
    acodec: string;
    container: string;
    resolution: string;
    audio_ext: string;
    abr: number;
    format: string;
}
export interface ManifestFormat {
    url: string;
    manifest_url: string;
    tbr: number;
    ext: string;
    fps: number;
    width: number;
    height: number;
    vcodec: string;
    dynamic_range: string;
    aspect_ratio: number;
    video_ext: string;
    vbr: number;
    format: string;
}

export interface EngineOutput {
    metaData: VideoInfo;
    BestAudioLow: AudioFormat;
    BestAudioHigh: AudioFormat;
    AudioLow: AudioFormat[];
    AudioHigh: AudioFormat[];
    AudioLowDRC: AudioFormat[];
    AudioHighDRC: AudioFormat[];
    BestVideoLow: VideoFormat;
    BestVideoHigh: VideoFormat;
    VideoLow: VideoFormat[];
    VideoHigh: VideoFormat[];
    VideoLowHDR: VideoFormat[];
    VideoHighHDR: VideoFormat[];
    ManifestLow: ManifestFormat[];
    ManifestHigh: ManifestFormat[];
}

let cachedLocatedPaths: { [key: string]: string } | null = null;

/**
 * Retrieves cached executable paths or calls the locator function to find them using async/await.
 * Caches the result for subsequent calls.
 *
 * @returns A Promise that resolves with an object mapping executable names to their paths.
 */
export const getLocatedPaths = async (): Promise<{ [key: string]: string }> => {
    if (cachedLocatedPaths === null) {
        // Await the asynchronous locator function
        cachedLocatedPaths = await locator();
    }
    return cachedLocatedPaths;
};

/**
 * Spawns the yt-dlx process with the --tor flag and waits for Tor to bootstrap using async/await and event handling via Promises.
 *
 * @param ytDlxPath The path to the yt-dlx executable.
 * @param verbose Whether to log verbose output from the Tor process.
 * @returns A Promise that resolves with the spawned ChildProcess once Tor is bootstrapped, or rejects if an error occurs during spawning or bootstrapping.
 */
const startTor = async (ytDlxPath: string, verbose = false): Promise<ChildProcess> => {
    if (verbose) console.log(colors.green("@info:"), `Attempting to spawn Tor using yt-dlx at: ${ytDlxPath}`);

    // Spawn the child process
    const torProcess = spawn(ytDlxPath, ["--tor"], { stdio: ["ignore", "pipe", "pipe"] });

    if (verbose) console.log(colors.green("@info:"), `Spawned yt-dlx --tor process with PID: ${torProcess.pid} using ${ytDlxPath}. Waiting for bootstrap...`);

    // Create readline interfaces to process stdout and stderr line by line
    const rlStdout = readline.createInterface({ input: torProcess.stdout as Readable, terminal: false });
    const rlStderr = readline.createInterface({ input: torProcess.stderr as Readable, terminal: false });

    // Create Promises to represent the bootstrap success and error conditions
    const bootstrapSuccess = new Promise<ChildProcess>(resolve => {
        const lineListener = (line: string) => {
            if (verbose) console.log(colors.green("@info:"), line);
            if (line.includes("Bootstrapped 100% (done): Done")) {
                if (verbose) console.log(colors.green("@info:"), "Tor is 100% bootstrapped!");
                // Clean up listeners after success to prevent leaks
                rlStdout.removeListener("line", lineListener);
                // Optionally remove stderr listener if added elsewhere
                rlStderr.removeAllListeners("line"); // Remove any stderr listeners

                rlStdout.close(); // Close the readline interfaces
                rlStderr.close();

                resolve(torProcess); // Resolve the promise with the process
            }
        };
        rlStdout.on("line", lineListener);

        // Add a listener for stderr to log errors during bootstrap without immediately failing
        rlStderr.on("line", line => {
            if (verbose) console.error(colors.red("@error:"), line);
        });
    });

    const processError = new Promise<never>((_, reject) => {
        // Listen for process errors (e.g., file not found)
        torProcess.once("error", err => {
            console.error(colors.red("@error:"), "Tor process error:", err);
            // Clean up listeners before rejecting
            rlStdout.removeAllListeners("line");
            rlStderr.removeAllListeners("line");
            rlStdout.close();
            rlStderr.close();
            reject(err);
        });

        // Listen for process close events
        torProcess.once("close", code => {
            console.log(colors.green("@info:"), `Tor process closed with code ${code}`);
            // If the process closes with a non-zero code before bootstrap success
            if (code !== 0) {
                rlStdout.removeAllListeners("line");
                rlStderr.removeAllListeners("line");
                rlStdout.close();
                rlStderr.close();
                reject(new Error(`Tor process exited with code ${code} before bootstrapping.`));
            }
            // If code is 0 but bootstrap didn't finish, the success promise will handle it
        });
    });

    try {
        // Race the success signal against error/close signals
        const result = await Promise.race([bootstrapSuccess, processError]);
        return result;
    } catch (err) {
        // If an error occurred, ensure the process is killed
        if (torProcess && !torProcess.killed) {
            torProcess.kill();
            if (verbose) console.log(colors.green("@info:"), "Tor process killed due to startup error.");
        }
        rlStdout.close(); // Ensure interfaces are closed on error
        rlStderr.close();
        throw err; // Re-throw the error
    }
};

/**
 * Formats a filesize in bytes into a human-readable string (B, KB, MB, GB, TB) using async function syntax.
 * Although this function's internal operations are purely synchronous, it is defined as an async function
 * to maintain consistency with a codebase being refactored to predominantly use async/await.
 * It resolves immediately with the formatted string.
 *
 * @param filesize The filesize in bytes.
 * @returns A Promise resolving with the formatted filesize string (e.g., "1.50 MB"), or the original input if invalid.
 */
export var sizeFormat: sizeFormat = async (filesize: number): Promise<string | number> => {
    if (isNaN(filesize) || filesize < 0) return filesize;

    const bytesPerKilobyte = 1024;
    const bytesPerMegabyte = 1024 * bytesPerKilobyte;
    const bytesPerGigabyte = bytesPerMegabyte * 1024;
    const bytesPerTerabyte = bytesPerGigabyte * 1024;

    if (filesize < bytesPerKilobyte) return filesize + " B";
    else if (filesize < bytesPerMegabyte) return (filesize / bytesPerKilobyte).toFixed(2) + " KB";
    else if (filesize < bytesPerGigabyte) return (filesize / bytesPerMegabyte).toFixed(2) + " MB";
    else if (filesize < bytesPerTerabyte) return (filesize / bytesPerGigabyte).toFixed(2) + " GB";
    else return (filesize / bytesPerTerabyte).toFixed(2) + " TB";
};

/**
 * Cleans properties from an audio format object. Marked as async for consistency, resolves immediately.
 * Calls async `sizeFormat`.
 *
 * @param i The audio format object.
 * @returns A Promise resolving with the cleaned object.
 */
async function CleanAudioFormat(i: any): Promise<any> {
    // Await the async sizeFormat call
    i.filesizeP = await sizeFormat(i.filesize);

    delete i.format_id;
    delete i.source_preference;
    delete i.has_drm;
    delete i.quality;
    delete i.fps;
    delete i.height;
    delete i.width;
    delete i.language;
    delete i.language_preference;
    delete i.preference;
    delete i.dynamic_range;
    delete i.downloader_options;
    delete i.protocol;
    delete i.aspect_ratio;
    delete i.vbr;
    delete i.vcodec;
    delete i.http_headers;
    delete i.video_ext;
    return i;
}

/**
 * Cleans properties from a video format object. Marked as async for consistency, resolves immediately.
 * Calls async `sizeFormat`.
 * Note: Original function name is "CeanVideoFormat" - typo? Preserving it.
 *
 * @param i The video format object.
 * @returns A Promise resolving with the cleaned object.
 */
async function CeanVideoFormat(i: VideoFormat): Promise<VideoFormat> {
    // Await the async sizeFormat call
    i.filesizeP = await sizeFormat(i.filesize);
    return i;
}

/**
 * Maps raw format object properties to a more specific AudioFormat structure. Marked as async for consistency, resolves immediately.
 * Calls async `sizeFormat`.
 *
 * @param i The raw format object.
 * @returns A Promise resolving with the mapped AudioFormat object.
 */
async function MapAudioFormat(i: any): Promise<AudioFormat> {
    // Await the async sizeFormat call
    const filesizeP = await sizeFormat(i.filesize);
    return {
        filesize: i.filesize as number,
        filesizeP: filesizeP as string, // Use awaited result
        asr: parseFloat(i.asr) as number,
        format_note: i.format_note as string,
        tbr: parseFloat(i.tbr) as number,
        url: i.url as string,
        ext: i.ext as string,
        acodec: i.acodec as string,
        container: i.container as string,
        resolution: i.resolution as string,
        audio_ext: i.audio_ext as string,
        abr: parseFloat(i.abr) as number,
        format: i.format as string,
    };
}

/**
 * Maps raw format object properties to a more specific VideoFormat structure. Marked as async for consistency, resolves immediately.
 * Calls async `sizeFormat`.
 *
 * @param i The raw format object.
 * @returns A Promise resolving with the mapped VideoFormat object.
 */
async function MapVideoFormat(i: any): Promise<VideoFormat> {
    // Await the async sizeFormat call
    const filesizeP = await sizeFormat(i.filesize);
    return {
        filesize: i.filesize as number,
        filesizeP: filesizeP as string, // Use awaited result
        format_note: i.format_note as string,
        fps: parseFloat(i.fps) as number,
        height: parseFloat(i.height) as number,
        width: parseFloat(i.width) as number,
        tbr: parseFloat(i.tbr) as number,
        url: i.url as string,
        ext: i.ext as string,
        vcodec: i.vcodec as string,
        dynamic_range: i.dynamic_range as string,
        container: i.container as string,
        resolution: i.resolution as string,
        aspect_ratio: parseFloat(i.aspect_ratio) as number,
        video_ext: i.video_ext as string,
        vbr: parseFloat(i.vbr) as number,
        format: i.format as string,
    };
}

/**
 * Maps raw format object properties to a simplified Manifest structure. Marked as async for consistency, resolves immediately.
 *
 * @param i The raw format object.
 * @returns A Promise resolving with the mapped Manifest object.
 */
async function MapManifest(i: any): Promise<any> {
    // All operations are synchronous property access and parsing.
    // Marked async for consistency, resolves immediately.
    return {
        url: i.url as string,
        manifest_url: i.manifest_url as string,
        tbr: parseFloat(i.tbr) as number,
        ext: i.ext as string,
        fps: parseFloat(i.fps) as number,
        width: parseFloat(i.width) as number,
        height: parseFloat(i.height) as number,
        vcodec: i.vcodec as string,
        dynamic_range: i.dynamic_range as string,
        aspect_ratio: parseFloat(i.aspect_ratio) as number,
        video_ext: i.video_ext as string,
        vbr: parseFloat(i.vbr) as number,
        format: i.format as string,
    };
}

/**
 * Filters format objects based on their format_note property using async function syntax.
 * Although the filtering logic is synchronous, this function is defined as async
 * for consistency with a codebase using async/await. It resolves immediately.
 *
 * @param formats An array of format objects to filter.
 * @returns A Promise resolving with a new array containing only the formats that do not include "DRC" or "HDR" in their format_note.
 */
async function FilterFormats(formats: any[]): Promise<any[]> {
    // Filtering operation is synchronous.
    // The 'async' keyword here makes the function return a Promise resolving immediately.
    return formats.filter(i => {
        return !i.format_note?.includes("DRC") && !i.format_note?.includes("HDR"); // Added optional chaining
    });
}

/**
 * Executes the yt-dlx process to extract video metadata and formats, optionally using Tor.
 * Processes the output to categorize and structure format information using async/await.
 *
 * @param options - The engine options.
 * @param options.query The YouTube video URL or ID.
 * @param [options.useTor=false] Whether to attempt to use Tor for the request.
 * @param [options.verbose=false] Whether to enable verbose logging.
 * @returns A Promise that resolves with an EngineOutput object containing categorized format data and metadata, or null if the yt-dlx executable is not found.
 */
export default async function Engine({ query, useTor = false, verbose = false }: { query: string; useTor?: boolean; verbose?: boolean }): Promise<EngineOutput | null> {
    let torProcess: ChildProcess | null = null;

    // Await the executable paths locator
    const located = await getLocatedPaths();
    const ytDlxPath = located["yt-dlx"];
    const ffmpegPath = located["ffmpeg"];

    if (!ytDlxPath) {
        console.error(colors.red("@error:"), "yt-dlx executable path not found.");
        return null;
    }

    // Optionally start Tor and await its bootstrap
    if (useTor) {
        try {
            if (verbose) console.log(colors.green("@info:"), "Attempting to start Tor and wait for bootstrap...");
            torProcess = await startTor(ytDlxPath, verbose); // Await the startTor function
            if (verbose) console.log(colors.green("@info:"), `Tor is ready for ${process.platform === "win32" ? "Windows" : "Linux"}.`);
        } catch (error) {
            console.error(colors.red("@error:"), "Failed to start Tor:", error);
            useTor = false; // Disable Tor if startup failed
        }
    }

    // Initialize objects to hold categorized formats
    var AudioLow: { [key: string]: any } = {};
    var AudioHigh: { [key: string]: any } = {};
    var VideoLow: { [key: string]: any } = {};
    var VideoHigh: { [key: string]: any } = {};
    var ManifestLow: { [key: string]: any } = {};
    var ManifestHigh: { [key: string]: any } = {};
    var AudioLowDRC: { [key: string]: any } = {};
    var AudioHighDRC: { [key: string]: any } = {};
    var VideoLowHDR: { [key: string]: any } = {};
    var VideoHighHDR: { [key: string]: any } = {};

    // Initialize best format variables (will be populated later)
    var BestAudioLow: AudioFormat | any = null;
    var BestAudioHigh: AudioFormat | any = null;
    var BestVideoLow: VideoFormat | any = null;
    var BestVideoHigh: VideoFormat | any = null;

    // Retry configuration for executing yt-dlx
    var config = { factor: 2, retries: 3, minTimeout: 1000, maxTimeout: 3000 };

    // Construct yt-dlx arguments
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

    // Add Tor proxy and ffmpeg path arguments if applicable
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

    if (argsToInsert.length > 0) {
        ytprobeArgs.splice(insertIndex, 0, ...argsToInsert);
    }

    // Execute yt-dlx with retry logic using await and promisify
    var metaCore = await retry(async () => {
        // promisify(execFile) converts the callback-based execFile to a Promise
        return await promisify(execFile)(ytDlxPath, ytprobeArgs, { maxBuffer: 1024 * 1024 * 10 }); // Increased max buffer
    }, config);

    // If Tor process was started, kill it after the yt-dlx command finishes
    if (torProcess && !torProcess.killed) {
        torProcess.kill();
        if (verbose) console.log(colors.green("@info:"), `Tor process terminated on ${process.platform === "win32" ? "Windows" : "Linux"}`);
    }

    // Parse the JSON output from yt-dlx
    // Replace 'yt-dlp' with 'yt-dlx' in the output string before parsing
    var i = JSON.parse(metaCore.stdout.toString().replace(/yt-dlp/g, "yt-dlx"));

    // Process the extracted formats
    i.formats.forEach((tube: any) => {
        var rm = new Set(["storyboard", "Default"]);

        // Handle Manifest formats (likely m3u8)
        if (!rm.has(tube.format_note) && tube.protocol === "m3u8_native" && tube.vbr) {
            if (!ManifestLow[tube.resolution] || tube.vbr < ManifestLow[tube.resolution].vbr) ManifestLow[tube.resolution] = tube;
            if (!ManifestHigh[tube.resolution] || tube.vbr > ManifestHigh[tube.resolution].vbr) ManifestHigh[tube.resolution] = tube;
        }

        // Skip formats with specified notes or missing filesize
        if (rm.has(tube.format_note) || tube.filesize === undefined || tube.filesize === null) return;

        // Handle DRC and HDR formats
        if (tube.format_note?.includes("DRC")) {
            // Added optional chaining
            if (AudioLow[tube.resolution] && !AudioLowDRC[tube.resolution]) {
                AudioLowDRC[tube.resolution] = AudioLow[tube.resolution];
            }
            if (AudioHigh[tube.resolution] && !AudioHighDRC[tube.resolution]) {
                AudioHighDRC[tube.resolution] = AudioHigh[tube.resolution];
            }
            // Note: Original logic overwrites with the current tube based on format_note key,
            // which seems to only store the *last* DRC/HDR format encountered for a given note.
            // Preserving original logic's key usage (format_note).
            AudioLowDRC[tube.format_note] = tube; // Keying by format_note
            AudioHighDRC[tube.format_note] = tube; // Keying by format_note
        } else if (tube.format_note?.includes("HDR")) {
            // Added optional chaining
            // Keying by format_note and comparing by filesize
            if (!VideoLowHDR[tube.format_note] || tube.filesize < VideoLowHDR[tube.format_note].filesize) VideoLowHDR[tube.format_note] = tube;
            if (!VideoHighHDR[tube.format_note] || tube.filesize > VideoHighHDR[tube.format_note].filesize) VideoHighHDR[tube.format_note] = tube;
        }

        // Handle standard audio and video formats
        var prevLowVideo = VideoLow[tube.format_note];
        var prevHighVideo = VideoHigh[tube.format_note];
        var prevLowAudio = AudioLow[tube.format_note];
        var prevHighAudio = AudioHigh[tube.format_note];

        switch (true) {
            case tube.format_note?.includes("p"): // Video format (e.g., 1080p, 720p)
                // Keying by format_note and comparing by filesize
                if (!prevLowVideo || tube.filesize < prevLowVideo.filesize) VideoLow[tube.format_note] = tube;
                if (!prevHighVideo || tube.filesize > prevHighVideo.filesize) VideoHigh[tube.format_note] = tube;
                break;
            default: // Audio format
                // Keying by format_note and comparing by filesize
                if (!prevLowAudio || tube.filesize < prevLowAudio.filesize) AudioLow[tube.format_note] = tube;
                if (!prevHighAudio || tube.filesize > prevHighAudio.filesize) AudioHigh[tube.format_note] = tube;
                break;
        }
    });

    // Determine Best Audio/Video formats based on filesize
    // Iterate over the values collected in the loops above
    (Object.values(AudioLow) as any[]).forEach((audio: any) => {
        // Looping over collected audio formats (could be partial structures)
        if (audio.filesize !== null && audio.filesize !== undefined) {
            // Comparing based on filesize to find overall lowest and highest filesize audio
            switch (true) {
                case !BestAudioLow || audio.filesize < BestAudioLow.filesize:
                    BestAudioLow = audio;
                    break;
                case !BestAudioHigh || audio.filesize > BestAudioHigh.filesize:
                    BestAudioHigh = audio;
                    break;
                default:
                    break;
            }
        }
    });

    (Object.values(VideoLow) as any[]).forEach((video: any) => {
        // Looping over collected video formats
        if (video.filesize !== null && video.filesize !== undefined) {
            // Comparing based on filesize to find overall lowest and highest filesize video
            switch (true) {
                case !BestVideoLow || video.filesize < BestVideoLow.filesize:
                    BestVideoLow = video;
                    break;
                case !BestVideoHigh || video.filesize > BestVideoHigh.filesize:
                    BestVideoHigh = video;
                    break;
                default:
                    break;
            }
        }
    });

    // Construct the final payload object using awaited results from mapping and cleaning functions
    var payLoad: EngineOutput = {
        // Use async IIFEs to await cleaning for the best formats
        BestAudioLow: await (async () => {
            var i = BestAudioLow || ({} as AudioFormat); // Use the found best format or an empty object
            return await CleanAudioFormat(i); // Await the cleaning
        })(),
        BestAudioHigh: await (async () => {
            var i = BestAudioHigh || ({} as AudioFormat); // Use the found best format or an empty object
            return await CleanAudioFormat(i); // Await the cleaning
        })(),
        BestVideoLow: await (async () => {
            var i = BestVideoLow || ({} as VideoFormat); // Use the found best format or an empty object
            return await CeanVideoFormat(i); // Await the cleaning
        })(),
        BestVideoHigh: await (async () => {
            var i = BestVideoHigh || ({} as VideoFormat); // Use the found best format or an empty object
            return await CeanVideoFormat(i); // Await the cleaning
        })(),

        // Use Promise.all to await mapping for arrays of formats
        // Await FilterFormats first, then map with awaited Map*Format, then await Promise.all
        AudioLowDRC: await Promise.all(Object.values(AudioLowDRC).map(async i => await MapAudioFormat(i))),
        AudioHighDRC: await Promise.all(Object.values(AudioHighDRC).map(async i => await MapAudioFormat(i))),
        AudioLow: await Promise.all((await FilterFormats(Object.values(AudioLow))).map(async i => await MapAudioFormat(i))),
        AudioHigh: await Promise.all((await FilterFormats(Object.values(AudioHigh))).map(async i => await MapAudioFormat(i))),
        VideoLowHDR: await Promise.all(Object.values(VideoLowHDR).map(async i => await MapVideoFormat(i))),
        VideoHighHDR: await Promise.all(Object.values(VideoHighHDR).map(async i => await MapVideoFormat(i))),
        VideoLow: await Promise.all((await FilterFormats(Object.values(VideoLow))).map(async i => await MapVideoFormat(i))),
        VideoHigh: await Promise.all((await FilterFormats(Object.values(VideoHigh))).map(async i => await MapVideoFormat(i))),
        ManifestLow: await Promise.all(Object.values(ManifestLow).map(async i => await MapManifest(i))),
        ManifestHigh: await Promise.all(Object.values(ManifestHigh).map(async i => await MapManifest(i))),

        // Metadata extraction remains synchronous property access
        metaData: {
            id: i.id as string,
            title: i.title as string,
            channel: i.channel as string,
            uploader: i.uploader as string,
            duration: i.duration as number,
            thumbnail: i.thumbnail as string,
            age_limit: i.age_limit as number,
            channel_id: i.channel_id as string,
            categories: i.categories as string[],
            display_id: i.display_id as string,
            view_count: i.view_count as number,
            like_count: i.like_count as number,
            description: i.description as string,
            channel_url: i.channel_url as string,
            webpage_url: i.webpage_url as string,
            live_status: i.live_status as boolean,
            upload_date: i.upload_date as string,
            uploader_id: i.uploader_id as string,
            original_url: i.original_url as string,
            uploader_url: i.uploader_url as string,
            comment_count: i.comment_count as number,
            duration_string: i.duration_string as string,
            channel_follower_count: i.channel_follower_count as number,
        },
    };

    return payLoad;
}
