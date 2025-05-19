// Suggestion: Add JSDoc comments to each property of the interface to provide more context and explain the meaning of each field.
export default interface ManifestFormat {
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
