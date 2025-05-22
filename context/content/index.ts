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
        acodec?: string | null;
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
        vcodec?: string | null;
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
    format_id?: string;
    format_note?: string | null;
    url?: string;
    manifest_url?: string;
    language?: string | null;
    protocol?: string;
    has_drm?: boolean;
    audio_ext?: string;
    tbr?: number | null;
}
interface CleanedVideoFormat extends Omit<NonNullable<OriginalJson["formats"]>[number], "format"> {
    __needs_testing?: never;
    http_headers?: never;
    format_index?: never;
    __working?: never;
    format_id?: string;
    url?: string;
    manifest_url?: string;
    tbr?: number | null;
    ext?: string;
    fps?: number | null;
    protocol?: string;
    quality?: number | string | null;
    has_drm?: boolean;
    width?: number | null;
    height?: number | null;
    vcodec?: string | null;
    dynamic_range?: string;
    video_ext?: string;
    vbr?: number | null;
    resolution?: string | null;
    aspect_ratio?: number | null;
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
            delete newFormat.source_preference;
            delete newFormat.__needs_testing;
            delete newFormat.http_headers;
            delete newFormat.format_index;
            delete newFormat.__working;
            delete newFormat.audio_ext;
            delete newFormat.preference;
            delete newFormat.format;
            delete newFormat.acodec;
            delete newFormat.abr;
            return newFormat as CleanedVideoFormat;
        });
    };
    const RemoveAudioFormatProperty = (formatsArray: OriginalJson["formats"]): CleanedAudioFormat[] => {
        if (!formatsArray) return [];
        return formatsArray.map(format => {
            if (!format) return format as CleanedAudioFormat;
            const newFormat: Partial<NonNullable<OriginalJson["formats"]>[number]> = { ...format };
            delete newFormat.source_preference;
            delete newFormat.__needs_testing;
            delete newFormat.http_headers;
            delete newFormat.format_index;
            delete newFormat.aspect_ratio;
            delete newFormat.resolution;
            delete newFormat.preference;
            delete newFormat.__working;
            delete newFormat.video_ext;
            delete newFormat.quality;
            delete newFormat.vcodec;
            delete newFormat.format;
            delete newFormat.ext;
            delete newFormat.vbr;
            return newFormat as CleanedAudioFormat;
        });
    };
    const cleanedAudioOnlyFormats = RemoveAudioFormatProperty(AudioOnlyFormats);
    const cleanedVideoOnlyFormats = RemoveVideoFormatProperty(VideoOnlyFormats);
    const drcAudioFormats = cleanedAudioOnlyFormats.filter(f => f.format_note && f.format_note.toLowerCase().includes("drc"));
    const nonDrcAudioFormats = cleanedAudioOnlyFormats.filter(f => !f.format_note || !f.format_note.toLowerCase().includes("drc"));
    let highestDrcAudioFormat: CleanedAudioFormat | null = null;
    let lowestDrcAudioFormat: CleanedAudioFormat | null = null;
    drcAudioFormats.forEach(format => {
        if (highestDrcAudioFormat === null || lowestDrcAudioFormat === null) {
            highestDrcAudioFormat = format;
            lowestDrcAudioFormat = format;
            return;
        }
        if (parseInt(format.format_id!) > parseInt(highestDrcAudioFormat.format_id!)) highestDrcAudioFormat = format;
        if (parseInt(format.format_id!) < parseInt(lowestDrcAudioFormat.format_id!)) lowestDrcAudioFormat = format;
    });
    let highestNonDrcAudioFormat: CleanedAudioFormat | null = null;
    let lowestNonDrcAudioFormat: CleanedAudioFormat | null = null;
    nonDrcAudioFormats.forEach(format => {
        if (highestNonDrcAudioFormat === null || lowestNonDrcAudioFormat === null) {
            highestNonDrcAudioFormat = format;
            lowestNonDrcAudioFormat = format;
            return;
        }
        if (parseInt(format.format_id!) > parseInt(highestNonDrcAudioFormat.format_id!)) highestNonDrcAudioFormat = format;
        if (parseInt(format.format_id!) < parseInt(lowestNonDrcAudioFormat.format_id!)) lowestNonDrcAudioFormat = format;
    });
    const sdrVideoFormats = cleanedVideoOnlyFormats.filter(f => f.dynamic_range === "SDR");
    const hdrVideoFormats = cleanedVideoOnlyFormats.filter(f => f.dynamic_range && f.dynamic_range.toLowerCase().includes("hdr"));
    let highestSdrVideoFormat: CleanedVideoFormat | null = null;
    let lowestSdrVideoFormat: CleanedVideoFormat | null = null;
    sdrVideoFormats.forEach(format => {
        if (highestSdrVideoFormat === null || lowestSdrVideoFormat === null) {
            highestSdrVideoFormat = format;
            lowestSdrVideoFormat = format;
            return;
        }
        if (format.vbr !== null && highestSdrVideoFormat.vbr !== null) {
            if (format.vbr! > highestSdrVideoFormat.vbr!) highestSdrVideoFormat = format;
        } else if (format.vbr !== null && highestSdrVideoFormat.vbr === null) highestSdrVideoFormat = format;
        else if (format.height !== null && highestSdrVideoFormat.height !== null) {
            if (format.height! > highestSdrVideoFormat.height!) highestSdrVideoFormat = format;
        } else if (format.height !== null && highestSdrVideoFormat.height === null) highestSdrVideoFormat = format;
        if (format.vbr !== null && lowestSdrVideoFormat.vbr !== null) {
            if (format.vbr! < lowestSdrVideoFormat.vbr!) lowestSdrVideoFormat = format;
        } else if (format.vbr !== null && lowestSdrVideoFormat.vbr === null) {
        } else if (format.height !== null && lowestSdrVideoFormat.height !== null) {
            if (format.height! < lowestSdrVideoFormat.height!) lowestSdrVideoFormat = format;
        } else if (format.height !== null && lowestSdrVideoFormat.height === null) {
        }
    });
    let highestHdrVideoFormat: CleanedVideoFormat | null = null;
    let lowestHdrVideoFormat: CleanedVideoFormat | null = null;
    hdrVideoFormats.forEach(format => {
        if (highestHdrVideoFormat === null || lowestHdrVideoFormat === null) {
            highestHdrVideoFormat = format;
            lowestHdrVideoFormat = format;
            return;
        }
        if (format.vbr !== null && highestHdrVideoFormat.vbr !== null) {
            if (format.vbr! > highestHdrVideoFormat.vbr!) highestHdrVideoFormat = format;
        } else if (format.vbr !== null && highestHdrVideoFormat.vbr === null) highestHdrVideoFormat = format;
        else if (format.height !== null && highestHdrVideoFormat.height !== null) {
            if (format.height! > highestHdrVideoFormat.height!) highestHdrVideoFormat = format;
        } else if (format.height !== null && highestHdrVideoFormat.height === null) highestHdrVideoFormat = format;
        if (format.vbr !== null && lowestHdrVideoFormat.vbr !== null) {
            if (format.vbr! < lowestHdrVideoFormat.vbr!) lowestHdrVideoFormat = format;
        } else if (format.vbr !== null && lowestHdrVideoFormat.vbr === null) {
        } else if (format.height !== null && lowestHdrVideoFormat.height !== null) {
            if (format.height! < lowestHdrVideoFormat.height!) lowestHdrVideoFormat = format;
        } else if (format.height !== null && lowestHdrVideoFormat.height === null) {
        }
    });
    const filteredThumbnails = (rawresp.thumbnails || []).filter(thumbnail => thumbnail.resolution);
    const cleanedThumbnails = filteredThumbnails.map(thumbnail => {
        const newThumbnail = { ...thumbnail };
        delete newThumbnail.preference;
        delete newThumbnail.id;
        return newThumbnail;
    });
    let highestThumbnail: NonNullable<OriginalJson["thumbnails"]>[number] | null = null;
    let lowestThumbnail: NonNullable<OriginalJson["thumbnails"]>[number] | null = null;
    cleanedThumbnails.forEach(thumbnail => {
        if (highestThumbnail === null || lowestThumbnail === null) {
            highestThumbnail = thumbnail;
            lowestThumbnail = thumbnail;
            return;
        }
        const currentResolution = (thumbnail.width || 0) * (thumbnail.height || 0);
        const highestResolution = (highestThumbnail.width || 0) * (highestThumbnail.height || 0);
        const lowestResolution = (lowestThumbnail.width || 0) * (lowestThumbnail.height || 0);
        if (currentResolution > highestResolution) highestThumbnail = thumbnail;
        if (currentResolution < lowestResolution) lowestThumbnail = thumbnail;
    });
    const FinalData = {
        MetaData: {
            id: rawresp.id,
            title: rawresp.title,
            description: rawresp.description,
            channel_id: rawresp.channel_id,
            channel_url: rawresp.channel_url,
            duration: rawresp.duration,
            view_count: rawresp.view_count,
            average_rating: rawresp.average_rating,
            age_limit: rawresp.age_limit,
            webpage_url: rawresp.webpage_url,
            categories: rawresp.categories,
            playable_in_embed: rawresp.playable_in_embed,
            live_status: rawresp.live_status,
            media_type: rawresp.media_type,
            release_timestamp: rawresp.release_timestamp,
            _format_sort_fields: rawresp._format_sort_fields,
            automatic_captions: rawresp.automatic_captions,
            subtitles: rawresp.subtitles,
            comment_count: rawresp.comment_count,
            chapters: rawresp.chapters,
            heatmap: rawresp.heatmap,
            like_count: rawresp.like_count,
            channel: rawresp.channel,
            channel_follower_count: rawresp.channel_follower_count,
            channel_is_verified: rawresp.channel_is_verified,
            uploader: rawresp.uploader,
            uploader_id: rawresp.uploader_id,
            uploader_url: rawresp.uploader_url,
            upload_date: rawresp.upload_date,
            timestamp: rawresp.timestamp,
            availability: rawresp.availability,
            original_url: rawresp.original_url,
            webpage_url_basename: rawresp.webpage_url_basename,
            webpage_url_domain: rawresp.webpage_url_domain,
            extractor: rawresp.extractor,
            extractor_key: rawresp.extractor_key,
            playlist: rawresp.playlist,
            playlist_index: rawresp.playlist_index,
            display_id: rawresp.display_id,
            fulltitle: rawresp.fulltitle,
            duration_string: rawresp.duration_string,
            release_year: rawresp.release_year,
            is_live: rawresp.is_live,
            was_live: rawresp.was_live,
            requested_subtitles: rawresp.requested_subtitles,
            _has_drm: rawresp._has_drm,
            epoch: rawresp.epoch,
            tags: rawresp.tags,
        },
        AudioOnly: {
            Standard: { Highest: highestNonDrcAudioFormat, Lowest: lowestNonDrcAudioFormat, Combined: nonDrcAudioFormats },
            Dynamic_Range_Compression: { Highest: highestDrcAudioFormat, Lowest: lowestDrcAudioFormat, Combined: drcAudioFormats },
        },
        VideoOnly: {
            Standard_Dynamic_Range: { Highest: highestSdrVideoFormat, Lowest: lowestSdrVideoFormat, Combined: sdrVideoFormats },
            High_Dynamic_Range: { Highest: highestHdrVideoFormat, Lowest: lowestHdrVideoFormat, Combined: hdrVideoFormats },
        },
        Thumbnails: {
            Highest: highestThumbnail,
            Lowest: lowestThumbnail,
            Combined: cleanedThumbnails,
        },
    };
    await fs.writeFile("Enhanced.json", JSON.stringify(FinalData, null, 4), "utf8");
}
TransformToEnhanced();
