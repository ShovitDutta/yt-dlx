export type ManifestFormat = Pick<
    import(".").Format,
    "url" | "manifest_url" | "tbr" | "ext" | "fps" | "width" | "height" | "vcodec" | "dynamic_range" | "aspect_ratio" | "video_ext" | "vbr" | "format"> & {
    fps?: number;
    width?: number;
    height?: number;
    vcodec?: string;
    dynamic_range?: string;
    aspect_ratio?: number;
    video_ext?: string;
    vbr?: number;
    url?: string;
    manifest_url?: string;
};
