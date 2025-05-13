import colors from "colors";
import { Client } from "youtubei";

export interface playlistVideosType {
  id: string;
  title: string;
  videoCount: number;
  result: {
    id: string;
    title: string;
    isLive: boolean;
    duration: number;
    thumbnails: string[];
  };
}
export default async function playlistVideos({ playlistId }: { playlistId: string }) {
  try {
    const youtube = new Client();
    const playlistVideos: any = await youtube.getPlaylist(playlistId);
    const result = playlistVideos.videos.items.map((item: any) => ({
      id: item.id,
      title: item.title,
      isLive: item.isLive,
      duration: item.duration,
      thumbnails: item.thumbnails,
    }));
    return {
      id: playlistVideos.id,
      title: playlistVideos.title,
      videoCount: playlistVideos.videoCount,
      result,
    };
  } catch (error: any) {
    throw new Error(colors.red("@error: ") + error.message);
  }
}
