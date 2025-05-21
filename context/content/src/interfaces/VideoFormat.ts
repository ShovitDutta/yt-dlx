export type VideoFormat = Pick<
    import(".").Format,
    "filesize" | "format_note" | "fps" | "height" | "width" | "tbr" | "url" | "ext" | "vcodec" | "dynamic_range" | "container" | "resolution" | "aspect_ratio" | "video_ext" | "vbr" | "format"
> & { filesizeP?: string | number | null };
