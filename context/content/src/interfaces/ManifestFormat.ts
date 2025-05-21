export type ManifestFormat = Pick<
    import(".").Format,
    "url" | "manifest_url" | "tbr" | "ext" | "fps" | "width" | "height" | "vcodec" | "dynamic_range" | "aspect_ratio" | "video_ext" | "vbr" | "format" | "resolution" // Add "resolution" here
>;
