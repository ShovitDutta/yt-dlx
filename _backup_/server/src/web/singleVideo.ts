import colors from "colors";
import { Client } from "youtubei";

export interface singleVideoType {
  id: string;
  title: string;
  thumbnails: string[];
  uploadDate: string;
  description: string;
  duration: number;
  isLive: boolean;
  viewCount: number;
  channelid: string;
  channelname: string;
  tags: string;
  likeCount: number;
}
export default async function singleVideo({ videoId }: { videoId: string }) {
  try {
    var youtube = new Client();
    var singleVideo: any = await youtube.getVideo(videoId);
    return {
      id: singleVideo.id,
      title: singleVideo.title,
      thumbnails: singleVideo.thumbnails,
      uploadDate: singleVideo.uploadDate,
      description: singleVideo.description,
      duration: singleVideo.duration,
      isLive: singleVideo.isLiveContent,
      viewCount: singleVideo.viewCount,
      channelid: singleVideo.channel.id,
      channelname: singleVideo.channel.name,
      tags: singleVideo.tags,
      likeCount: singleVideo.likeCount,
    };
  } catch (error: any) {
    throw new Error(colors.red("@error: ") + error.message);
  }
}
