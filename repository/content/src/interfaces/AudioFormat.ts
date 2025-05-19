// Suggestion: Add JSDoc comments to each property of the interface to provide more context and explain the meaning of each field.
export default interface AudioFormat {
    filesize: number;
    filesizeP?: string | number | null;
    asr: number;
    format_note: string;
    tbr: number;
    url: string;
    ext: string;
    acodec: string;
    container: string;
    resolution: string;
    audio_ext: string;
    abr?: number | null;
    format: string;
}
