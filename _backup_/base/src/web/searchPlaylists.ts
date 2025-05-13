import colors from "colors";
import { Client } from "youtubei";

export interface searchPlaylistsType {
  id: string;
  title: string;
  videoCount: number;
  thumbnails: string[];
}
export default async function searchPlaylists({ query }: { query: string }) {
  try {
    var youtube = new Client();
    var searchPlaylists = await youtube.search(query, {
      type: "playlist",
    });
    var result: searchPlaylistsType[] = searchPlaylists.items.map((item: any) => ({
      id: item.id,
      title: item.title,
      videoCount: item.videoCount,
      thumbnails: item.thumbnails,
    }));
    return result;
  } catch (error: any) {
    throw new Error(colors.red("@error: ") + error.message);
  }
}
