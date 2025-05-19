// Suggestion: Add JSDoc comments to each property of the interface to provide more context and explain the meaning of each field. Consider using more specific types for the `allFormats` property instead of `any[]`.
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
    AudioLowDRC?: AudioFormat[];
    AudioHighDRC?: AudioFormat[];
    BestVideoLow: VideoFormat;
    BestVideoHigh: VideoFormat;
    VideoLow: VideoFormat[];
    VideoHigh: VideoFormat[];
    VideoLowHDR?: VideoFormat[];
    VideoHighHDR?: VideoFormat[];
    ManifestLow: ManifestFormat[];
    ManifestHigh: ManifestFormat[];
    allFormats: (AudioFormat | VideoFormat | ManifestFormat)[];
}
