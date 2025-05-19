// Suggestion: Add JSDoc comments to each property of the interface to provide more context and explain the meaning of each field.
export default interface VideoFormat {
    filesize: number;
    filesizeP?: string | number | null;
    format_note: string;
    fps: number;
    height: number;
    width: number;
    tbr: number;
    url: string;
    ext: string;
    vcodec: string;
    dynamic_range?: string | null;
    container: string;
    resolution: string;
    aspect_ratio: number;
    video_ext: string;
    vbr: number;
    format: string;
}
