import * as path from "path";
import retry from "async-retry";
import { promisify } from "util";
import { exec } from "child_process";
import type sizeFormat from "../interfaces/sizeFormat";
import type AudioFormat from "../interfaces/AudioFormat";
import type VideoFormat from "../interfaces/VideoFormat";
import type EngineOutput from "../interfaces/EngineOutput";

export var sizeFormat: sizeFormat = (filesize: number): string | number => {
  if (isNaN(filesize) || filesize < 0) return filesize;
  var bytesPerMegabyte = 1024 * 1024;
  var bytesPerGigabyte = bytesPerMegabyte * 1024;
  var bytesPerTerabyte = bytesPerGigabyte * 1024;
  if (filesize < bytesPerMegabyte) return filesize + " B";
  else if (filesize < bytesPerGigabyte) {
    return (filesize / bytesPerMegabyte).toFixed(2) + " MB";
  } else if (filesize < bytesPerTerabyte) {
    return (filesize / bytesPerGigabyte).toFixed(2) + " GB";
  } else return (filesize / bytesPerTerabyte).toFixed(2) + " TB";
};

function nAudio(i: any) {
  i.filesizeP = sizeFormat(i.filesize);
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
function nVideo(i: any) {
  i.filesizeP = sizeFormat(i.filesize);
  delete i.asr;
  delete i.format_id;
  delete i.has_drm;
  delete i.quality;
  delete i.source_preference;
  delete i.audio_channels;
  delete i.protocol;
  delete i.language;
  delete i.language_preference;
  delete i.preference;
  delete i.acodec;
  delete i.downloader_options;
  delete i.http_headers;
  delete i.audio_ext;
  delete i.abr;
  return i;
}
function pAudio(i: any) {
  return {
    filesize: i.filesize as number,
    filesizeP: sizeFormat(i.filesize) as string,
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
function pVideo(i: any) {
  return {
    filesize: i.filesize as number,
    filesizeP: sizeFormat(i.filesize) as string,
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
function pManifest(i: any) {
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

export default async function Engine({ sudo, query, useTor, ipAddress }: { query: string; sudo?: boolean; useTor?: boolean; ipAddress: string }) {
  var AudioLow: any = {};
  var AudioHigh: any = {};
  var VideoLow: any = {};
  var VideoHigh: any = {};
  var ManifestLow: any = {};
  var ManifestHigh: any = {};
  var AudioLowDRC: any = {};
  var AudioHighDRC: any = {};
  var VideoLowHDR: any = {};
  var VideoHighHDR: any = {};
  var AudioLowF: AudioFormat | any = null;
  var AudioHighF: AudioFormat | any = null;
  var VideoLowF: VideoFormat | any = null;
  var VideoHighF: VideoFormat | any = null;
  var cprobe = "";
  switch (process.platform) {
    case "win32":
      cprobe = path.join(__dirname, "../../", "public", "cprobe.exe");
      break;
    case "darwin":
      cprobe = path.join(__dirname, "../../", "public", "cprobe_macos");
      break;
    case "linux":
      cprobe = path.join(__dirname, "../../", "public", "cprobe_linux");
      break;
    default:
      throw new Error("Unsupported platform");
  }
  var pLoc = `${cprobe}`;
  var config = {
    factor: 2,
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 3000,
  };
  var metaCore = await retry(async () => {
    pLoc += ` --dump-single-json "${query}"`;
    pLoc += ` --no-check-certificate --prefer-insecure --no-call-home --skip-download --no-warnings --geo-bypass`;
    pLoc += ` --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"`;
    return await promisify(exec)(pLoc);
  }, config);
  var i = JSON.parse(metaCore.stdout.toString());
  i.formats.forEach((tube: any) => {
    var rm = new Set(["storyboard", "Default"]);
    if (!rm.has(tube.format_note) && tube.protocol === "m3u8_native" && tube.vbr) {
      if (!ManifestLow[tube.resolution] || tube.vbr < ManifestLow[tube.resolution].vbr) ManifestLow[tube.resolution] = tube;
      if (!ManifestHigh[tube.resolution] || tube.vbr > ManifestHigh[tube.resolution].vbr) ManifestHigh[tube.resolution] = tube;
    }
    if (rm.has(tube.format_note) || tube.filesize === undefined || null) return;
    if (tube.format_note.includes("DRC")) {
      if (AudioLow[tube.resolution] && !AudioLowDRC[tube.resolution]) {
        AudioLowDRC[tube.resolution] = AudioLow[tube.resolution];
      }
      if (AudioHigh[tube.resolution] && !AudioHighDRC[tube.resolution]) {
        AudioHighDRC[tube.resolution] = AudioHigh[tube.resolution];
      }
      AudioLowDRC[tube.format_note] = tube;
      AudioHighDRC[tube.format_note] = tube;
    } else if (tube.format_note.includes("HDR")) {
      if (!VideoLowHDR[tube.format_note] || tube.filesize < VideoLowHDR[tube.format_note].filesize) VideoLowHDR[tube.format_note] = tube;
      if (!VideoHighHDR[tube.format_note] || tube.filesize > VideoHighHDR[tube.format_note].filesize) VideoHighHDR[tube.format_note] = tube;
    }
    var prevLowVideo = VideoLow[tube.format_note];
    var prevHighVideo = VideoHigh[tube.format_note];
    var prevLowAudio = AudioLow[tube.format_note];
    var prevHighAudio = AudioHigh[tube.format_note];
    switch (true) {
      case tube.format_note.includes("p"):
        if (!prevLowVideo || tube.filesize < prevLowVideo.filesize) VideoLow[tube.format_note] = tube;
        if (!prevHighVideo || tube.filesize > prevHighVideo.filesize) VideoHigh[tube.format_note] = tube;
        break;
      default:
        if (!prevLowAudio || tube.filesize < prevLowAudio.filesize) AudioLow[tube.format_note] = tube;
        if (!prevHighAudio || tube.filesize > prevHighAudio.filesize) AudioHigh[tube.format_note] = tube;
        break;
    }
  });
  (Object.values(AudioLow) as AudioFormat[]).forEach((audio: AudioFormat) => {
    if (audio.filesize !== null) {
      switch (true) {
        case !AudioLowF || audio.filesize < AudioLowF.filesize:
          AudioLowF = audio;
          break;
        case !AudioHighF || audio.filesize > AudioHighF.filesize:
          AudioHighF = audio;
          break;
        default:
          break;
      }
    }
  });
  (Object.values(VideoLow) as VideoFormat[]).forEach((video: VideoFormat) => {
    if (video.filesize !== null) {
      switch (true) {
        case !VideoLowF || video.filesize < VideoLowF.filesize:
          VideoLowF = video;
          break;
        case !VideoHighF || video.filesize > VideoHighF.filesize:
          VideoHighF = video;
          break;
        default:
          break;
      }
    }
  });
  function propfilter(formats: any[]) {
    return formats.filter(i => {
      return !i.format_note.includes("DRC") && !i.format_note.includes("HDR");
    });
  }
  var payLoad: EngineOutput = {
    ipAddress,
    AudioLowF: (() => {
      var i = AudioLowF || ({} as AudioFormat);
      return nAudio(i);
    })(),
    AudioHighF: (() => {
      var i = AudioHighF || ({} as AudioFormat);
      return nAudio(i);
    })(),
    VideoLowF: (() => {
      var i = VideoLowF || ({} as VideoFormat);
      return nVideo(i);
    })(),
    VideoHighF: (() => {
      var i = VideoHighF || ({} as VideoFormat);
      return nVideo(i);
    })(),
    AudioLowDRC: Object.values(AudioLowDRC).map((i: any) => pAudio(i)),
    AudioHighDRC: Object.values(AudioHighDRC).map((i: any) => pAudio(i)),
    AudioLow: propfilter(Object.values(AudioLow)).map((i: any) => pAudio(i)),
    AudioHigh: propfilter(Object.values(AudioHigh)).map((i: any) => pAudio(i)),
    VideoLowHDR: Object.values(VideoLowHDR).map((i: any) => pVideo(i)),
    VideoHighHDR: Object.values(VideoHighHDR).map((i: any) => pVideo(i)),
    VideoLow: propfilter(Object.values(VideoLow)).map((i: any) => pVideo(i)),
    VideoHigh: propfilter(Object.values(VideoHigh)).map((i: any) => pVideo(i)),
    ManifestLow: Object.values(ManifestLow).map((i: any) => pManifest(i)),
    ManifestHigh: Object.values(ManifestHigh).map((i: any) => pManifest(i)),
    metaData: {
      ipAddress,
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
      comment_count: i.comment_count as number,
      channel_follower_count: i.channel_follower_count as number,
      description: i.description as string,
      channel_url: i.channel_url as string,
      webpage_url: i.webpage_url as string,
      live_status: i.live_status as boolean,
      upload_date: i.upload_date as string,
      uploader_id: i.uploader_id as string,
      original_url: i.original_url as string,
      uploader_url: i.uploader_url as string,
      duration_string: i.duration_string as string,
    },
  };
  return payLoad;
}
