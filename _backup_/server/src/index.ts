import http from "http";
import WebSocket from "ws";
import dotenv from "dotenv";
import routeAudioLowest from "./routes/audio/AudioLowest";
import routeAudioHighest from "./routes/audio/AudioHighest";
import routeAudioCustom from "./routes/audio/AudioCustom";
import routeVideoLowest from "./routes/video/VideoLowest";
import routeVideoHighest from "./routes/video/VideoHighest";
import routeVideoCustom from "./routes/video/VideoCustom";
import routeAudioVideoLowest from "./routes/audiovideo/AudioVideoLowest";
import routeAudioVideoHighest from "./routes/audiovideo/AudioVideoHighest";
import routeAudioVideoCustom from "./routes/audiovideo/AudioVideoCustom";
import routeExtract from "./routes/command/extract";
import routeListFormats from "./routes/command/list_formats";
import routePlaylistData from "./routes/command/playlist_data";
import routeSearchPlaylists from "./routes/command/search_playlists";
import routeSearchVideos from "./routes/command/search_videos";
import routeVideoData from "./routes/command/video_data";

dotenv.config();
const port = process.env.PORT || 8642;
const server = http.createServer();
server.listen(port, () => console.log(`@web-socket: listening on port ${port}`));
server.on("error", error => console.error("Server error:", error));
const wss = new WebSocket.Server({ server }).on("connection", (ws: WebSocket, req) => {
  ws.on("message", (message: string) => {
    const data = JSON.parse(message);
    if (data.event === "AudioLowest") routeAudioLowest(ws, data.payload);
    else if (data.event === "AudioHighest") routeAudioHighest(ws, data.payload);
    else if (data.event === "AudioCustom") routeAudioCustom(ws, data.payload);
    else if (data.event === "VideoLowest") routeVideoLowest(ws, data.payload);
    else if (data.event === "VideoHighest") routeVideoHighest(ws, data.payload);
    else if (data.event === "VideoCustom") routeVideoCustom(ws, data.payload);
    else if (data.event === "AudioVideoLowest") routeAudioVideoLowest(ws, data.payload);
    else if (data.event === "AudioVideoHighest") routeAudioVideoHighest(ws, data.payload);
    else if (data.event === "AudioVideoCustom") routeAudioVideoCustom(ws, data.payload);
    else if (data.event === "Extract") routeExtract(ws, data.payload);
    else if (data.event === "VideoData") routeVideoData(ws, data.payload);
    else if (data.event === "ListFormats") routeListFormats(ws, data.payload);
    else if (data.event === "PlaylistData") routePlaylistData(ws, data.payload);
    else if (data.event === "SearchVideos") routeSearchVideos(ws, data.payload);
    else if (data.event === "SearchPlaylists") routeSearchPlaylists(ws, data.payload);
  });
  ws.on("error", error => console.error(`WebSocket error: ${error.message}`));
  ws.on("close", () => console.log(`WebSocket disconnected from ip: ${req.socket.remoteAddress}`));
});
const powerdown = () => {
  wss.clients.forEach(client => client.close());
  server.close(() => process.exit(0));
  setTimeout(() => {
    process.exit(1);
  }, 10000);
};
process.on("SIGTERM", powerdown);
process.on("SIGINT", powerdown);
