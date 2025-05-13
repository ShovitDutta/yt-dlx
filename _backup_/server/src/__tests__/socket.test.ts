// ====================================================================================================
//
import path from "path";
import socket from "ws";
var server = new socket("ws://localhost:8642");
server.on("close", ip => console.log("@disconnected:", ip));
server.on("error", error => console.error("@error:", error));
//
// =============================================[ Audio ]=============================================
//
server.on("open", async () => {
  for (var AudioEvent of ["AudioLowest", "AudioHighest"]) {
    var payLoad = JSON.stringify({
      event: AudioEvent,
      payload: {
        stream: true,
        useTor: true,
        verbose: true,
        metadata: false,
        query: "careless-whisper",
        output: path.join(process.cwd(), "downloads"),
      },
    });
    server.send(payLoad);
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
});
//
// =============================================[ Video ]=============================================
//
server.on("open", async () => {
  for (var VideoEvent of ["VideoLowest", "VideoHighest"]) {
    var payLoad = JSON.stringify({
      event: VideoEvent,
      payload: {
        stream: true,
        useTor: true,
        verbose: true,
        metadata: false,
        query: "careless-whisper",
        output: path.join(process.cwd(), "downloads"),
      },
    });
    server.send(payLoad);
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
});
//
// =============================================[ AudioVideo ]=============================================
//
server.on("open", async () => {
  for (var AudioVideoEvent of ["AudioVideoLowest", "AudioVideoHighest"]) {
    var payLoad = JSON.stringify({
      event: AudioVideoEvent,
      payload: {
        stream: true,
        useTor: true,
        verbose: true,
        metadata: false,
        query: "careless-whisper",
        output: path.join(process.cwd(), "downloads"),
      },
    });
    server.send(payLoad);
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
});
//
// =============================================[ Searchers ]=============================================
//
server.on("open", async () => {
  for (var SearchEvent of ["extract", "list_formats", "playlist_data", "search_playlists", "search_videos", "video_data"]) {
    var payLoad = JSON.stringify({
      event: SearchEvent,
      payload: {
        verbose: true,
        query: "careless-whisper",
      },
    });
    server.send(payLoad);
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
});
//
// =============================================[ message ]=============================================
//
server.on("message", response => {
  var input = JSON.parse(response.toString());
  if (input.event === "end") console.log("@end", input.data);
  if (input.event === "error") console.log("@error:", input.data);
  if (input.event === "start") console.log("@start:", input.data);
  if (input.event === "progress") console.log("@progress:", input.data);
  if (input.event === "metadata") console.log("@metadata:", input.data);
});
//
// ====================================================================================================
