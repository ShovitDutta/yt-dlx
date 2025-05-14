// ./ytclone/src/app/api/video/[videoId]/details/route.ts
import { NextResponse } from "next/server";
import YouTubeDLX from "yt-dlx";
export async function GET(request: Request, context: { params: Promise<{ videoId: string }> }) {
  const resolvedParams = await context.params;
  const { videoId } = resolvedParams;
  const { searchParams } = new URL(request.url);
  const verbose = searchParams.get("verbose") === "true";
  const useTor = searchParams.get("useTor") === "true";
  if (!videoId) return NextResponse.json({ error: "Video ID parameter is required" }, { status: 400 });
  try {
    const videoDetails = await new Promise((resolve, reject) => {
      const emitter = YouTubeDLX.Misc.Video.Extract({ query: videoId, verbose, useTor });
      emitter.on("data", data => {
        console.log(data);
        resolve(data);
      });
      emitter.on("error", error => {
        console.error(error);
        reject(error);
      });
    });
    return NextResponse.json(videoDetails);
  } catch (error: any) {
    console.error("Error fetching video details:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch video details" }, { status: 500 });
  }
}
