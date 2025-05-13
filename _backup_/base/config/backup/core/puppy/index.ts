import PlaylistInfo from "./browser/PlaylistInfo";
import type { PlaylistInfoType } from "./browser/PlaylistInfo";
import SearchVideos from "./browser/SearchVideos";
import type { TypePlaylist, TypeVideo } from "./browser/SearchVideos";
import VideoInfo from "./browser/VideoInfo";
import type { VideoInfoType } from "./browser/VideoInfo";
import playlistVideos from "./vercel/playlistVideos";
import type { playlistVideosType } from "./vercel/playlistVideos";
import relatedVideos from "./vercel/relatedVideos";
import type { relatedVideosType } from "./vercel/relatedVideos";
import searchPlaylists from "./vercel/searchPlaylists";
import type { searchPlaylistsType } from "./vercel/searchPlaylists";
import searchVideos from "./vercel/searchVideos";
import type { searchVideosType } from "./vercel/searchVideos";
import singleVideo from "./vercel/singleVideo";
import type { singleVideoType } from "./vercel/singleVideo";

export type { TypeVideo, TypePlaylist, VideoInfoType, PlaylistInfoType };

export type { singleVideoType, searchVideosType, relatedVideosType, playlistVideosType, searchPlaylistsType };

const web = {
  browser: {
    VideoInfo,
    SearchVideos,
    PlaylistInfo,
  },
  browserLess: {
    singleVideo,
    searchVideos,
    relatedVideos,
    playlistVideos,
    searchPlaylists,
  },
};
export default web;
