// console.clear();
// import web from "../../web";
// import colors from "colors";
// import type {
// PlaylistInfoType,
// VideoInfoType,
// TypePlaylist,
// TypeVideo,
// } from "../../web";

// (async () => {
// try {
// let Tube;
// Tube = (await web.browser.SearchVideos({
// query: "PERSONAL BY PLAZA",
// screenshot: false,
// verbose: false,
// type: "video",
// })) as TypeVideo[];
// console.log(colors.green("@pass:"), "video search results received");
// Tube = (await web.browser.VideoInfo({
// query: Tube[0]?.videoLink as string,
// screenshot: false,
// verbose: false,
// })) as VideoInfoType;
// console.log(colors.green("@pass:"), "single video data received");
// Tube = (await web.browser.SearchVideos({
// query: Tube.title,
// screenshot: false,
// type: "playlist",
// verbose: false,
// })) as TypePlaylist[];
// console.log(colors.green("@pass:"), "playlist search results received");
// Tube = (await web.browser.PlaylistInfo({
// query: Tube[0]?.playlistLink as string,
// screenshot: false,
// verbose: false,
// })) as PlaylistInfoType;
// console.log(colors.green("@pass:"), "single playlist data received");

// Tube = await web.browserLess.searchVideos({ query: "weeknd" });
// console.log(colors.green("searchVideos"), Tube[0]);
// Tube = await web.browserLess.searchPlaylists({ query: Tube[0].title });
// console.log(colors.green("searchPlaylists"), Tube[0]);
// Tube = await web.browserLess.playlistVideos({ playlistId: Tube[0].id });
// console.log(colors.green("playlistVideos"), Tube[0]);
// Tube = await web.browserLess.relatedVideos({ videoId: Tube[0].id });
// console.log(colors.green("relatedVideos"), Tube[0]);
// Tube = await web.browserLess.singleVideo({ videoId: Tube[0].id });
// console.log(colors.green("singleVideo"), Tube);
// } catch (error: any) {
// console.error(colors.red("@error:"), error.message);
// }
// })();
// =======================================================================
