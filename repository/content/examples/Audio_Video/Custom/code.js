/**
 * @shortdesc Downloads or streams combined audio and video from YouTube with custom options.
 * @description This function allows you to download or stream a combined audio and video stream from YouTube based on a search query or video URL and a specified video resolution. It offers customization options such as saving the output to a specified directory, using Tor for anonymity, enabling verbose logging, streaming the output, or simply fetching the metadata without downloading. Video filters can also be applied.
 *
 * The function requires a search query or video URL and the desired video resolution. It fetches the highest quality audio and the specified video resolution stream and merges them.
 *
 * It supports the following configuration options:
 * - **query:** A string representing the search query or video URL. This is a mandatory parameter.
 * - **resolution:** A string specifying the desired video resolution. Mandatory parameter. Accepted values are "144p", "240p", "360p", "480p", "720p", "1080p", "1440p", "2160p", "3072p", "4320p", "6480p", "8640p", "12000p".
 * - **output:** An optional string specifying the directory where the output video file should be saved. If not provided, the file will be saved in the current working directory. This parameter cannot be used when `metadata` is true.
 * - **useTor:** An optional boolean value. If true, the function will attempt to use Tor for the network requests, enhancing anonymity.
 * - **stream:** An optional boolean value. If true, the video will be streamed instead of saved to a file. When streaming, the `end` event will provide the streamable path and the `stream` event will provide the FFmpeg instance. This parameter cannot be used when `metadata` is true.
 * - **verbose:** An optional boolean value. If true, enables detailed logging to the console, providing more information about the process.
 * - **metadata:** An optional boolean value. If true, the function will only fetch and emit the video metadata and available format details without downloading or streaming. When `metadata` is true, the `output`, `stream`, and `filter` parameters are not allowed.
 * - **filter:** An optional string specifying a video filter to apply to the video stream. This parameter is ignored when `metadata` is true. Available filters include: "invert", "rotate90", "rotate270", "grayscale", "rotate180", "flipVertical", "flipHorizontal".
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - "start": Emitted when the process begins, providing the FFmpeg command being executed.
 * - "progress": Emitted periodically during the download/streaming process, providing progress details (e.g., downloaded size, time remaining).
 * - "end": Emitted when the download/streaming process completes successfully, providing the path to the saved file. If `stream` is true, it provides the streamable path.
 * - "metadata": Emitted only when the `metadata` parameter is true. Provides an object containing the video metadata, available audio and video format details, and a suggested filename.
 * - "stream": Emitted only when the `stream` parameter is true. Provides an object containing the streamable filename/path and the FFmpeg instance.
 * - "error": Emitted when an error occurs at any stage, such as argument validation, network issues, or FFmpeg errors. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.query - The search query or video URL. **Required**.
 * @param {boolean} [options.stream] - Whether to stream the output. Cannot be used with `metadata: true`.
 * @param {string} [options.output] - The directory to save the output file. Cannot be used with `metadata: true`.
 * @param {boolean} [options.useTor] - Whether to use Tor.
 * @param {("invert" | "rotate90" | "rotate270" | "grayscale" | "rotate180" | "flipVertical" | "flipHorizontal")} [options.filter] - A video filter to apply. Cannot be used with `metadata: true`.
 * @param {boolean} [options.metadata] - Only fetch metadata. Cannot be used with `output`, `stream`, or `filter`.
 * @param {boolean} [options.verbose] - Enable verbose logging.
 * @param {("144p" | "240p" | "360p" | "480p" | "720p" | "1080p" | "1440p" | "2160p" | "3072p" | "4320p" | "6480p" | "8640p" | "12000p")} options.resolution - The desired video resolution. **Required**.
 * @returns {EventEmitter} An EventEmitter instance for handling events during the audio/video processing.
 *
 */

const YouTubeDLX = require("yt-dlx").default;

// 1. Download combined audio/video with a specific resolution to the current directory
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "720p" })
  .on("start", start => console.log("FFmpeg started:", start))
  .on("progress", progress => console.log("Progress:", progress))
  .on("end", outputPath => console.log("Download finished:", outputPath))
  .on("error", error => console.error("Error:", error));

// 2. Download combined audio/video with a specific resolution to a custom output directory
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "1080p", output: "./video_downloads" })
  .on("start", start => console.log("FFmpeg started:", start))
  .on("progress", progress => console.log("Progress:", progress))
  .on("end", outputPath => console.log("Download finished:", outputPath))
  .on("error", error => console.error("Error:", error));

// 3. Stream combined audio/video with a specific resolution
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "480p", stream: true })
  .on("start", start => console.log("FFmpeg started:", start))
  .on("progress", progress => console.log("Progress:", progress))
  .on("stream", data => {
    console.log("Stream available:", data.filename); // You can use data.ffmpeg instance for streaming
  })
  .on("end", streamPath => console.log("Streaming session ended:", streamPath))
  .on("error", error => console.error("Error:", error));

// 4. Fetch only metadata for a video
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "720p", metadata: true })
  .on("metadata", data => console.log("Metadata:", data))
  .on("error", error => console.error("Error:", error));
// Note: output, stream, and filter are ignored when metadata is true.

// 5. Download combined audio/video with a specific resolution and apply a filter
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "720p", filter: "grayscale" })
  .on("start", start => console.log("FFmpeg started:", start))
  .on("progress", progress => console.log("Progress:", progress))
  .on("end", outputPath => console.log("Download finished:", outputPath))
  .on("error", error => console.error("Error:", error));

// 6. Download combined audio/video with a specific resolution and use Tor
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "1080p", useTor: true })
  .on("start", start => console.log("FFmpeg started:", start))
  .on("progress", progress => console.log("Progress:", progress))
  .on("end", outputPath => console.log("Download finished:", outputPath))
  .on("error", error => console.error("Error:", error));

// 7. Download combined audio/video with a specific resolution and enable verbose logging
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "480p", verbose: true })
  .on("start", start => console.log("FFmpeg started:", start))
  .on("progress", progress => console.log("Progress:", progress))
  .on("end", outputPath => console.log("Download finished:", outputPath))
  .on("error", error => console.error("Error:", error));

// 8. Download combined audio/video with a specific resolution, custom output, and apply a filter
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "720p", output: "./filtered_videos", filter: "rotate90" })
  .on("start", start => console.log("FFmpeg started:", start))
  .on("progress", progress => console.log("Progress:", progress))
  .on("end", outputPath => console.log("Download finished:", outputPath))
  .on("error", error => console.error("Error:", error));

// 9. Stream combined audio/video with a specific resolution and apply a filter
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "1080p", stream: true, filter: "flipHorizontal" })
  .on("start", start => console.log("FFmpeg started:", start))
  .on("progress", progress => console.log("Progress:", progress))
  .on("stream", data => {
    console.log("Stream available:", data.filename); // You can use data.ffmpeg instance for streaming
  })
  .on("end", streamPath => console.log("Streaming session ended:", streamPath))
  .on("error", error => console.error("Error:", error));

// 10. Download combined audio/video with all applicable options enabled (query, resolution, output, useTor, verbose, filter)
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "2160p", output: "./full_options_video", useTor: true, verbose: true, filter: "invert" })
  .on("start", start => console.log("FFmpeg started:", start))
  .on("progress", progress => console.log("Progress:", progress))
  .on("end", outputPath => console.log("Download finished:", outputPath))
  .on("error", error => console.error("Error:", error));

// 11. Stream combined audio/video with all applicable options enabled (query, resolution, stream, useTor, verbose, filter)
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "1440p", stream: true, useTor: true, verbose: true, filter: "rotate180" })
  .on("start", start => console.log("FFmpeg started:", start))
  .on("progress", progress => console.log("Progress:", progress))
  .on("stream", data => {
    console.log("Stream available:", data.filename); // You can use data.ffmpeg instance for streaming
  })
  .on("end", streamPath => console.log("Streaming session ended:", streamPath))
  .on("error", error => console.error("Error:", error));

// 12. Fetch metadata with verbose logging and use Tor
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "720p", metadata: true, verbose: true, useTor: true })
  .on("metadata", data => console.log("Metadata (Verbose, Tor):", data))
  .on("error", error => console.error("Error:", error));

// 13. Attempt to use output with metadata (will result in an error)
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "720p", metadata: true, output: "./should_fail" }).on("error", error =>
  console.error("Expected Error (output with metadata):", error),
);

// 14. Attempt to use stream with metadata (will result in an error)
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "720p", metadata: true, stream: true }).on("error", error =>
  console.error("Expected Error (stream with metadata):", error),
);

// 15. Attempt to use filter with metadata (will result in an error)
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "720p", metadata: true, filter: "grayscale" }).on("error", error =>
  console.error("Expected Error (filter with metadata):", error),
);

// 16. Attempt to use stream and output together
// Based on the code, stream: true and an output path provided will likely result in a file being saved and the stream event also firing.
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "720p", stream: true, output: "./streamed_and_saved" })
  .on("start", start => console.log("FFmpeg started:", start))
  .on("progress", progress => console.log("Progress:", progress))
  .on("stream", data => {
    console.log("Stream event fired, file likely being saved to:", data.filename);
  })
  .on("end", outputPath => console.log("Process ended, file saved at:", outputPath)) // Should output the path in './streamed_and_saved'
  .on("error", error => console.error("Error:", error));

// 17. Missing required 'query' parameter (will result in an error)
YouTubeDLX.Audio_Video.Custom({ resolution: "720p" }).on("error", error => console.error("Expected Error (missing query):", error));

// 18. Missing required 'resolution' parameter (will result in an error)
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url" }).on("error", error => console.error("Expected Error (missing resolution):", error));

// 19. Invalid 'resolution' value (will result in an error - Zod validation)
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "500p" }).on("error", error => console.error("Expected Error (invalid resolution):", error));

// 20. Invalid 'filter' value (will result in an error - Zod validation)
YouTubeDLX.Audio_Video.Custom({ query: "your search query or url", resolution: "720p", filter: "nonexistentfilter" }).on("error", error => console.error("Expected Error (invalid filter):", error));

// 21. Query results in no engine data
// Note: This scenario depends on the internal ytdlx function's behavior.
// You can simulate by providing a query that is unlikely to return results.
YouTubeDLX.Audio_Video.Custom({ query: "a query that should return no results 12345abcde", resolution: "720p" }).on("error", error => console.error("Expected Error (no engine data):", error));

// 22. Engine data missing metadata
// Note: This is an internal error scenario, difficult to trigger via simple example call.
// The error emitted would be: "@error: Metadata was not found in the engine response."

// 23. Highest quality audio URL was not found
// Note: This is an internal error scenario, might happen for unusual content.
// The error emitted would be: "@error: Highest quality audio URL was not found."

// 24. Video URL not found for specified resolution
// Note: This might happen if the requested resolution is not available for the video.
// The error emitted would be: "@error: Video URL not found for resolution: [resolution]."
YouTubeDLX.Audio_Video.Custom({ query: "some video with limited resolutions", resolution: "8640p" }).on("error", error => console.error("Expected Error (video URL not found):", error));

// 25. No video data found for specified resolution
// Note: Similar to example 24, indicates the resolution is not available.
// The error emitted would be: "@error: No video data found for resolution: [resolution]. Use list_formats() maybe?"
YouTubeDLX.Audio_Video.Custom({ query: "some video with limited resolutions", resolution: "12000p" }).on("error", error => console.error("Expected Error (no video data):", error));
