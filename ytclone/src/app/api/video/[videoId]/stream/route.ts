// ./ytclone/src/app/api/video/[videoId]/stream/route.ts
import { NextResponse } from "next/server";
import YouTubeDLX from "yt-dlx";

export async function GET(
  request: Request,
  context: { params: Promise<{ videoId: string }> }, // Update type to Promise
) {
  // Await params before accessing properties
  const resolvedParams = await context.params;
  const { videoId } = resolvedParams;

  // In a real app, you'd get resolution/format from searchParams
  // For simplicity, we'll use Video.Highest for now.

  if (!videoId) return NextResponse.json({ error: "Video ID parameter is required" }, { status: 400 });

  // Create a ReadableStream to pipe the video data
  const readableStream = new ReadableStream({
    start(controller) {
      try {
        // Use Video.Highest for simplicity, could be Custom based on params
        const emitter = YouTubeDLX.Video.Highest({
          query: videoId,
          stream: true, // Request streaming
          // verbose: true, // Optional: enable verbose logging for debugging
        });

        emitter.on("stream", data => {
          // The 'stream' event provides the FFmpeg instance and filename.
          // We need to listen to the FFmpeg instance's data events.
          const ffmpegStream = data.ffmpeg.pipe(); // Get the output stream from FFmpeg

          ffmpegStream.on("data", (chunk: Buffer) => {
            controller.enqueue(chunk); // Enqueue data chunks to the stream
          });

          ffmpegStream.on("end", () => {
            controller.close(); // Close the stream when FFmpeg finishes
          });

          ffmpegStream.on("error", (error: Error) => {
            console.error("FFmpeg stream error:", error);
            controller.error(error); // Signal an error in the stream
          });

          // Listen for yt-dlx emitter errors as well
          emitter.on("error", (error: any) => {
            console.error("yt-dlx emitter error:", error);
            controller.error(new Error(`yt-dlx error: ${error.message || error}`)); // Signal an error
          });

          emitter.on("end", () => {
            // The 'end' event from yt-dlx emitter might fire before the ffmpegStream 'end'
            // The ffmpegStream 'end' is the definitive signal that data is finished.
            // No action needed here, ffmpegStream.on('end') handles closing.
          });
        });

        emitter.on("error", (error: any) => {
          console.error("yt-dlx emitter error before stream event:", error);
          controller.error(new Error(`yt-dlx error: ${error.message || error}`)); // Signal an error
        });
      } catch (error: any) {
        console.error("Error initiating yt-dlx stream:", error);
        controller.error(error); // Signal an error during setup
      }
    },
    cancel() {
      // Handle client disconnecting
      console.log("Client disconnected, cancelling stream.");
      // TODO: Implement logic to stop the yt-dlx/FFmpeg process
    },
  });

  // Set appropriate headers for video streaming
  const headers = new Headers();
  headers.set("Content-Type", "video/mp4"); // Or appropriate video type
  headers.set("Transfer-Encoding", "chunked");
  // Add CORS headers if needed
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  return new NextResponse(readableStream, { headers });
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new NextResponse(null, { headers });
}
