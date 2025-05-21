import type { VideoInfo } from "./VideoInfo";
import type { AudioFormat } from "./AudioFormat";
import type { VideoFormat } from "./VideoFormat";
import type { ManifestFormat } from "./ManifestFormat";

export interface EngineOutput {
    MetaData: VideoInfo;
    AvailableFormats: {
        Audio: string[];
        Video: string[];
        Manifest: {
            // Changed to an object
            Audio: string[]; // Array of strings for audio-only manifests
            Video: string[]; // Array of strings for video manifests
        };
    };
    Audio: {
        SingleQuality: {
            Lowest: AudioFormat;
            Highest: AudioFormat;
        };
        MultipleQuality: {
            Lowest: AudioFormat[];
            Highest: AudioFormat[];
        };
        HasDRC: {
            Lowest?: AudioFormat[];
            Highest?: AudioFormat[];
        };
    };
    Video: {
        SingleQuality: {
            Lowest: VideoFormat;
            Highest: VideoFormat;
        };
        MultipleQuality: {
            Lowest: VideoFormat[];
            Highest: VideoFormat[];
        };
        HasHDR: {
            Lowest?: VideoFormat[];
            Highest?: VideoFormat[];
        };
    };
    Manifest: {
        SingleQuality: {
            Lowest: ManifestFormat;
            Highest: ManifestFormat;
        };
        MultipleQuality: {
            Lowest: ManifestFormat[];
            Highest: ManifestFormat[];
        };
    };
}
