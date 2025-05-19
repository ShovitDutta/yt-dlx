import type VideoInfo from "./VideoInfo";
import type AudioFormat from "./AudioFormat";
import type VideoFormat from "./VideoFormat";
import type ManifestFormat from "./ManifestFormat";
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
}
