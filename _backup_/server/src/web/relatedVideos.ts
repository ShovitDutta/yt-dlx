import colors from "colors";
import { Client } from "youtubei";

export interface relatedVideosType {
  id: string;
  title: string;
  isLive: boolean;
  duration: number;
  uploadDate: string;
  thumbnails: string[];
}
export default async function relatedVideos({ videoId }: { videoId: string }) {
  try {
    var youtube = new Client();
    var relatedVideos: any = await youtube.getVideo(videoId);
    var result: relatedVideosType[] = relatedVideos.related.items.map((item: any) => ({
      id: item.id,
      title: item.title,
      isLive: item.isLive,
      duration: item.duration,
      uploadDate: item.uploadDate,
      thumbnails: item.thumbnails,
    }));
    return result;
  } catch (error: any) {
    throw new Error(colors.red("@error: ") + error.message);
  }
}
