// ./ytclone/src/app/api/video/[videoId]/comments/route.ts
import { NextResponse } from "next/server";
import YouTubeDLX from "yt-dlx";

export async function GET(
  request: Request,
  context: { params: Promise<{ videoId: string }> }, // Update type to Promise
) {
  // Await params before accessing properties
  const resolvedParams = await context.params;
  const { videoId } = resolvedParams;

  const { searchParams } = new URL(request.url);
  const verbose = searchParams.get("verbose") === "true";

  if (!videoId) return NextResponse.json({ error: "Video ID parameter is required" }, { status: 400 });

  try {
    const videoComments = await new Promise((resolve, reject) => {
      const emitter = YouTubeDLX.Misc.Video.Comments({
        query: videoId,
        verbose,
      });

      emitter.on("data", data => {
        resolve(data);
      });

      emitter.on("error", error => {
        reject(error);
      });
    });

    return NextResponse.json(videoComments);
  } catch (error: any) {
    console.error("Error fetching video comments:", error); // Add server-side logging
    return NextResponse.json({ error: error.message || "Failed to fetch video comments" }, { status: 500 });
  }
}
