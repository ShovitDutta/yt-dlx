import WebSocket from "ws";
import { env } from "node:process";

const wsUrl = "ws://localhost:8080";
const ws = new WebSocket(wsUrl);

const testCases = [
  // Account Routes (require valid cookies)
  { action: "Account.History", params: { cookies: env.YouTubeDLX_COOKIES, verbose: true }, requestId: "account-history-1" },
  { action: "Account.HomeFeed", params: { cookies: env.YouTubeDLX_COOKIES, sort: "newest" }, requestId: "account-homefeed-1" },
  { action: "Account.SubscriptionsFeed", params: { cookies: env.YouTubeDLX_COOKIES }, requestId: "account-subscriptions-1" },
  { action: "Account.UnseenNotifications", params: { cookies: env.YouTubeDLX_COOKIES }, requestId: "account-notifications-1" },

  // Audio Routes (require query)
  { action: "Audio.Highest", params: { query: "test video", metadata: true }, requestId: "audio-highest-1" },
  { action: "Audio.Lowest", params: { query: "test video", metadata: true }, requestId: "audio-lowest-1" },
  { action: "Audio.Custom", params: { query: "test video", resolution: "high", metadata: true }, requestId: "audio-custom-1" },

  // Audio_Video Routes (require query)
  { action: "Audio_Video.Highest", params: { query: "test video", metadata: true }, requestId: "av-highest-1" },
  { action: "Audio_Video.Lowest", params: { query: "test video", metadata: true }, requestId: "av-lowest-1" },
  { action: "Audio_Video.Custom", params: { query: "test video", resolution: "720p", metadata: true }, requestId: "av-custom-1" },

  // Misc Routes (require query or link/id)
  { action: "Misc.System.Help", params: {}, requestId: "misc-help-1" }, // No params needed
  { action: "Misc.Video.Comments", params: { query: "test video" }, requestId: "misc-comments-1" },
  { action: "Misc.Video.Extract", params: { query: "test video" }, requestId: "misc-extract-1" },
  { action: "Misc.Video.Formats", params: { query: "test video" }, requestId: "misc-formats-1" },
  { action: "Misc.Video.Related", params: { videoId: "dQw4w9WgXcQ" }, requestId: "misc-related-1" }, // Example video ID
  { action: "Misc.Video.Transcript", params: { videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }, requestId: "misc-transcript-1" }, // Example video link

  // Search Routes (require query or link/id)
  { action: "Search.Channel.Single", params: { channelLink: "UC-9-kyTW8ZkZNSB7LxqIENA" }, requestId: "search-channel-single-1" }, // Example channel ID
  { action: "Search.Channel.Multiple", params: { query: "programming" }, requestId: "search-channel-multiple-1" },
  { action: "Search.Playlist.Single", params: { playlistLink: "https://www.youtube.com/playlist?list=PLFs4qd2aqV-qS_l_k4S2H4c4Wb5Z5F5z5" }, requestId: "search-playlist-single-1" }, // Example playlist link
  { action: "Search.Playlist.Multiple", params: { playlistLink: "lofi hip hop" }, requestId: "search-playlist-multiple-1" }, // Search query
  { action: "Search.Video.Single", params: { videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }, requestId: "search-video-single-1" }, // Example video link
  { action: "Search.Video.Multiple", params: { query: "coding tutorials" }, requestId: "search-video-multiple-1" },
];

ws.on("open", () => {
  console.log("Connected to WebSocket server");
  // Send test cases after a short delay to ensure server is ready
  setTimeout(() => {
    testCases.forEach(testCase => {
      console.log(`Sending request: ${JSON.stringify(testCase)}`);
      ws.send(JSON.stringify(testCase));
    });
  }, 1000);
});

ws.on("message", (data: string) => {
  const response = JSON.parse(data);
  console.log(`Received response for requestId ${response.requestId}:`, response);
});

ws.on("error", (error: Error) => {
  console.error(`WebSocket error: ${error}`);
});

ws.on("close", (code: number, reason: string) => {
  console.log(`WebSocket connection closed: code ${code}, reason: ${reason}`);
});
