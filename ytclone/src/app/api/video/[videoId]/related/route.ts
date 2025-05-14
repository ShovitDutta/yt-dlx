// ./ytclone/src/app/api/video/[videoId]/related/route.ts
import { NextResponse } from "next/server";
import YouTubeDLX from "yt-dlx";

export async function GET(
  request: Request,
  context: { params: Promise<{ videoId: string }> }, // Update type to Promise
) {
  // Await params before accessing properties
  const resolvedParams = await context.params;
  const { videoId } = resolvedParams;

  if (!videoId) return NextResponse.json({ error: "Video ID parameter is required" }, { status: 400 });

  try {
    const relatedVideos = await new Promise((resolve, reject) => {
      const emitter = YouTubeDLX.Misc.Video.Related({
        videoId,
      });

      emitter.on("data", data => {
        resolve(data);
      });

      emitter.on("error", error => {
        reject(error);
      });
    });

    return NextResponse.json(relatedVideos);
  } catch (error: any) {
    console.error("Error fetching related videos:", error); // Add server-side logging
    return NextResponse.json({ error: error.message || "Failed to fetch related videos" }, { status: 500 });
  }
}
