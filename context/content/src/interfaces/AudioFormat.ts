export interface AudioFormat {
    filesize?: number;
    asr?: number;
    format_note: string;
    tbr: number | null;
    url: string;
    ext: string;
    acodec: string;
    container?: string;
    resolution?: string | null;
    audio_ext?: string;
    abr?: number | null;
    format: string;
}
