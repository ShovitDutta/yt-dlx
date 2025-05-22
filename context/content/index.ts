import fs from "fs/promises";

interface OriginalJson {
    id?: string;
    title?: string;
    formats?: {
        format_id?: string;
        format_note?: string | null;
        format_index?: number | null;
        url?: string;
        manifest_url?: string;
        language?: string | null;
        ext?: string;
        protocol?: string;
        preference?: number | null;
        quality?: number | string | null;
        has_drm?: boolean;
        vcodec?: string | null;
        source_preference?: number;
        __needs_testing?: boolean;
        audio_ext?: string;
        video_ext?: string;
        vbr?: number | null;
        abr?: number | null;
        tbr?: number | null;
        resolution?: string | null;
        aspect_ratio?: number | null;
        filesize_approx?: number | null;
        http_headers?: { "User-Agent"?: string; Accept?: string; "Accept-Language"?: string; "Sec-Fetch-Mode"?: string };
        format?: string;
        width?: number | null;
        height?: number | null;
        fps?: number | null;
        rows?: number;
        columns?: number;
        fragments?: { url?: string; duration?: number }[];
        dynamic_range?: string;
        __working?: boolean;
        stretched_ratio?: number | null;
        asr?: number | null;
        audio_channels?: number | null;
    }[];
    thumbnails?: { url?: string; preference?: number; id?: string; height?: number; width?: number; resolution?: string }[];
    thumbnail?: string;
    description?: string;
    channel_id?: string;
    channel_url?: string;
    duration?: number;
    view_count?: number;
    average_rating?: number | null;
    age_limit?: number;
    webpage_url?: string;
    categories?: string[];
    tags?: string[];
    playable_in_embed?: boolean;
    live_status?: string;
    media_type?: string | null;
    release_timestamp?: number | null;
    _format_sort_fields?: string[];
    automatic_captions?: {};
    subtitles?: {};
    comment_count?: number;
    chapters?: null;
    heatmap?: null;
    like_count?: number;
    channel?: string;
    channel_follower_count?: number;
    channel_is_verified?: boolean;
    uploader?: string;
    uploader_id?: string;
    uploader_url?: string;
    upload_date?: string;
    timestamp?: number;
    availability?: string;
    original_url?: string;
    webpage_url_basename?: string;
    webpage_url_domain?: string;
    extractor?: string;
    extractor_key?: string;
    playlist?: null;
    playlist_index?: null;
    display_id?: string;
    fulltitle?: string;
    duration_string?: string;
    release_year?: number | null;
    is_live?: boolean;
    was_live?: boolean;
    requested_subtitles?: null;
    _has_drm?: null;
    epoch?: number;
    requested_formats?: {
        format_id?: string;
        format_index?: number | null;
        url?: string;
        manifest_url?: string;
        language?: string | null;
        ext?: string;
        protocol?: string;
        preference?: number | null;
        quality?: number | string | null;
        has_drm?: boolean;
        vcodec?: string | null;
        source_preference?: number;
        __needs_testing?: boolean;
        audio_ext?: string;
        video_ext?: string;
        vbr?: number | null;
        abr?: number | null;
        tbr?: number | null;
        resolution?: string | null;
        aspect_ratio?: number | null;
        filesize_approx?: number | null;
        http_headers?: { "User-Agent"?: string; Accept?: string; "Accept-Language"?: string; "Sec-Fetch-Mode"?: string };
        format?: string;
        width?: number | null;
        height?: number | null;
        fps?: number | null;
        dynamic_range?: string;
        __working?: boolean;
        stretched_ratio?: number | null;
        asr?: number | null;
        audio_channels?: number | null;
    }[];
    requested_downloads?: {
        requested_formats?: {
            format_id?: string;
            format_index?: number | null;
            url?: string;
            manifest_url?: string;
            language?: string | null;
            ext?: string;
            protocol?: string;
            preference?: number | null;
            quality?: number | string | null;
            has_drm?: boolean;
            vcodec?: string | null;
            source_preference?: number;
            __needs_testing?: boolean;
            audio_ext?: string;
            video_ext?: string;
            vbr?: number | null;
            abr?: number | null;
            tbr?: number | null;
            resolution?: string | null;
            aspect_ratio?: number | null;
            files_approx?: number | null;
            http_headers?: { "User-Agent"?: string; Accept?: string; "Accept-Language"?: string; "Sec-Fetch-Mode"?: string };
            format?: string;
            width?: number;
            height?: number;
            fps?: number | null;
            dynamic_range?: string;
            __working?: boolean;
            stretched_ratio?: number | null;
            asr?: number | null;
            audio_channels?: number | null;
        }[];
        format?: string;
        format_id?: string;
        ext?: string;
        protocol?: string;
        format_note?: string;
        tbr?: number;
        width?: number;
        height?: number;
        resolution?: string;
        fps?: number;
        dynamic_range?: string;
        vcodec?: string;
        vbr?: number;
        aspect_ratio?: number;
        _filename?: string;
        filename?: string;
        __write_download_archive?: boolean;
    }[];
    format?: string;
    format_id?: string;
    ext?: string;
    protocol?: string;
    language?: string | null;
    format_note?: string | null;
    filesize_approx?: number | null;
    tbr?: number | null;
    width?: number | null;
    height?: number | null;
    resolution?: string | null;
    fps?: number | null;
    dynamic_range?: string | null;
    vcodec?: string | null;
    vbr?: number | null;
    stretched_ratio?: number | null;
    aspect_ratio?: number | null;
    acodec?: string | null;
    abr?: number | null;
    asr?: number | null;
    audio_channels?: number | null;
    _type?: string;
    _version?: { version?: string; current_git_head?: string | null; release_git_head?: string | null; repository?: string };
}

interface CleanedAudioFormat extends Omit<NonNullable<OriginalJson["formats"]>[number], "format"> {
    __needs_testing?: never;
    http_headers?: never;
    format_index?: never;
    __working?: never;
    abr?: never;
    resolution: string | null;
}
interface CleanedVideoFormat extends Omit<NonNullable<OriginalJson["formats"]>[number], "format"> {
    __needs_testing?: never;
    http_headers?: never;
    format_index?: never;
    __working?: never;
    vbr?: never;
    resolution: string | null;
}
async function TransformToEnhanced() {
    const rawresp: OriginalJson = JSON.parse(await fs.readFile("original.json", "utf-8"));
    const AllFormats = rawresp.formats || [];
    const NoStoryboard = AllFormats.filter(f => {
        return !f.format_note || !f.format_note.toLowerCase().includes("storyboard");
    });
    const AudioOnlyFormats: OriginalJson["formats"] = [];
    const VideoOnlyFormats: OriginalJson["formats"] = [];
    NoStoryboard.forEach(f => {
        if (f.resolution && f.resolution.toLowerCase().includes("audio")) AudioOnlyFormats.push(f);
        else VideoOnlyFormats.push(f);
    });
    const RemoveVideoFormatProperty = (formatsArray: OriginalJson["formats"]): CleanedVideoFormat[] => {
        if (!formatsArray) return [];
        return formatsArray.map(format => {
            if (!format) return format as CleanedVideoFormat;
            const newFormat: Partial<NonNullable<OriginalJson["formats"]>[number]> = { ...format };
            delete newFormat.__needs_testing;
            delete newFormat.http_headers;
            delete newFormat.format_index;
            delete newFormat.__working;
            delete newFormat.format;
            delete newFormat.abr;
            return newFormat as CleanedVideoFormat;
        });
    };
    const RemoveAudioFormatProperty = (formatsArray: OriginalJson["formats"]): CleanedAudioFormat[] => {
        if (!formatsArray) return [];
        return formatsArray.map(format => {
            if (!format) return format as CleanedAudioFormat;
            const newFormat: Partial<NonNullable<OriginalJson["formats"]>[number]> = { ...format };
            delete newFormat.__needs_testing;
            delete newFormat.http_headers;
            delete newFormat.format_index;
            delete newFormat.__working;
            delete newFormat.format;
            delete newFormat.vbr;
            return newFormat as CleanedAudioFormat;
        });
    };
    const cleanedAudioOnlyFormats = RemoveAudioFormatProperty(AudioOnlyFormats);
    const cleanedVideoOnlyFormats = RemoveVideoFormatProperty(VideoOnlyFormats);
    let highestVbr: number | null = null;
    let lowestVbr: number | null = null;
    if (cleanedVideoOnlyFormats.length > 0) {
        const vbrValues = cleanedVideoOnlyFormats.reduce((acc: number[], format) => {
            if (format.vbr !== null && format.vbr !== undefined) acc.push(format.vbr);
            return acc;
        }, []);
        if (vbrValues.length > 0) {
            highestVbr = Math.max(...vbrValues);
            lowestVbr = Math.min(...vbrValues);
        }
    }
    const outputData = {
        AudioOnly: { Total_Items: cleanedAudioOnlyFormats.length, Combined: cleanedAudioOnlyFormats },
        VideoOnly: { Total_Items: cleanedVideoOnlyFormats.length, Highest_VBR: highestVbr, Lowest_VBR: lowestVbr, Combined: cleanedVideoOnlyFormats },
    };
    await fs.writeFile("Enhanced.json", JSON.stringify(outputData, null, 2), "utf8");
}
TransformToEnhanced();
