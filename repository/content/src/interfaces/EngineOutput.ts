import type VideoInfo from "./VideoInfo";
import type AudioFormat from "./AudioFormat";
import type VideoFormat from "./VideoFormat";
import type ManifestFormat from "./ManifestFormat";
export default interface EngineOutput {
  metaData: VideoInfo;
  AudioLowF: AudioFormat;
  AudioHighF: AudioFormat;
  AudioLow: AudioFormat[];
  AudioHigh: AudioFormat[];
  AudioLowDRC: AudioFormat[];
  AudioHighDRC: AudioFormat[];
  VideoLowF: VideoFormat;
  VideoHighF: VideoFormat;
  VideoLow: VideoFormat[];
  VideoHigh: VideoFormat[];
  VideoLowHDR: VideoFormat[];
  VideoHighHDR: VideoFormat[];
  ManifestLow: ManifestFormat[];
  ManifestHigh: ManifestFormat[];
}
