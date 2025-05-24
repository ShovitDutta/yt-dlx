import colors from "colors";
import Engine from "./Engine";
import { Client } from "youtubei";
import YouTubeID from "./YouTubeId";
import type { EngineOutput } from "../interfaces/EngineOutput";
export async function VideoInfo({ videoId }: { videoId: string }): Promise<VideoInfoType | null> {
    try {
        const youtube = new Client();
        const VideoInfoData: any = await youtube.getVideo(videoId);
        if (!VideoInfoData) throw new Error(`${colors.red("@error: ")} Unable to fetch video data for id: ${videoId}`);
        return {
            id: VideoInfoData.id,
            tags: VideoInfoData.tags,
            title: VideoInfoData.title,
            duration: VideoInfoData.duration,
            likeCount: VideoInfoData.likeCount,
            viewCount: VideoInfoData.viewCount,
            isLive: VideoInfoData.isLiveContent,
            thumbnails: VideoInfoData.thumbnails,
            uploadDate: VideoInfoData.uploadDate,
            channelid: VideoInfoData.channel?.id,
            description: VideoInfoData.description,
            channelname: VideoInfoData.channel?.name,
        };
    } catch (error: any) {
        throw new Error(`${colors.red("@error: ")} Error fetching video data: ${error.message}`);
    }
}
export interface VideoInfoType {
    id: string;
    title: string;
    isLive: boolean;
    duration: number;
    viewCount: number;
    uploadDate: string;
    description: string;
    thumbnails: string[];
    tags: string[] | undefined;
    likeCount: number | undefined;
    channelid: string | undefined;
    channelname: string | undefined;
}
export interface searchVideosType {
    id: string;
    title: string;
    isLive: boolean;
    duration: number;
    viewCount: number;
    uploadDate: string;
    channelid: string;
    channelname: string;
    description: string;
    thumbnails: string[];
}
export default async function Agent({ Query, UseTor = false, Verbose = false }: { Query: string; UseTor?: boolean; Verbose?: boolean }): Promise<EngineOutput | null> {
    let url: string;
    const youtube = new Client();
    const videoId: string | undefined = await YouTubeID(Query);
    if (Verbose && UseTor) console.log(colors.green("@info:"), "Using Tor for request anonymization");
    if (!videoId) {
        try {
            const searchResults = await youtube.search(Query, { type: "video" });
            if (searchResults.items.length === 0) throw new Error(`${colors.red("@error: ")} Unable to find a video for Query: ${Query}`);
            const video = searchResults.items[0];
            console.log(colors.green("@info:"), "preparing payload for", video.title);
            url = `https://www.youtube.com/watch?v=${video.id}`;
        } catch (error: any) {
            throw new Error(`${colors.red("@error: ")} Error during video search: ${error.message}`);
        }
    } else {
        const TubeBody = await VideoInfo({ videoId });
        if (!TubeBody) throw new Error(`${colors.red("@error: ")} Unable to get video data for id: ${videoId}`);
        console.log(colors.green("@info:"), "preparing payload for", TubeBody.title);
        url = `https://www.youtube.com/watch?v=${TubeBody.id}`;
    }
    return await Engine({ Query: url, UseTor, Verbose });
}
