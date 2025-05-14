// ./ytclone/src/app/api/video/[videoId]/transcript/route.ts
import { NextResponse } from "next/server";
import YouTubeDLX from "yt-dlx";
export async function GET(request: Request, context: { params: Promise<{ videoId: string }> }) {
  const resolvedParams = await context.params;
  const { videoId } = resolvedParams;
  const { searchParams } = new URL(request.url);
  const verbose = searchParams.get("verbose") === "true";
  if (!videoId) return NextResponse.json({ error: "Video ID parameter is required" }, { status: 400 });
  try {
    const videoLink = `https://www.youtube.com/watch?v=${videoId}`;
    const videoTranscript = await new Promise((resolve, reject) => {
      const emitter = YouTubeDLX.Misc.Video.Transcript({
        videoLink,
      });
      emitter.on("data", data => {
        resolve(data);
      });
      emitter.on("error", error => {
        reject(error);
      });
    });
    return NextResponse.json(videoTranscript);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
