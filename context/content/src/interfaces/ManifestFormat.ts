export type ManifestFormat = Pick<
    import("./ytprobe").Format,
    "url" | "manifest_url" | "tbr" | "ext" | "fps" | "width" | "height" | "vcodec" | "dynamic_range" | "aspect_ratio" | "video_ext" | "vbr" | "format"
>;
