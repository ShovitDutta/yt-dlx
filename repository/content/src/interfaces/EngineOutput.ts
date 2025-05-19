import type VideoInfo from "./VideoInfo";
import type AudioFormat from "./AudioFormat";
import type VideoFormat from "./VideoFormat";
import type ManifestFormat from "./ManifestFormat";

interface Format {
    filesize?: number;
    format_note?: string;
    url?: string;
    ext?: string;
    height?: number;
    width?: number;
    vcodec?: string;
    acodec?: string;
    protocol?: string;
    vbr?: number;
    // Add other properties as needed based on the structure in Engine.ts
}

export default interface EngineOutput {
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
    allFormats: Format[]; // Add the new property
}
