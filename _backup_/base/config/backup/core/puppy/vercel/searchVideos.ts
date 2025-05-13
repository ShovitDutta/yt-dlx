import colors from "colors";
import { Client } from "youtubei";

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
export default async function searchVideos({ query }: { query: string }) {
  try {
    const youtube = new Client();
    const searchVideos = await youtube.search(query, {
      type: "video",
    });
    const result: searchVideosType[] = searchVideos.items.map((item: any) => ({
      id: item.id,
      title: item.title,
      isLive: item.isLive,
      duration: item.duration,
      viewCount: item.viewCount,
      uploadDate: item.uploadDate,
      channelid: item.channel.id,
      channelname: item.channel.name,
      description: item.description,
      thumbnails: item.thumbnails,
    }));
    return result;
  } catch (error: any) {
    throw new Error(colors.red("@error: ") + error.message);
  }
}
