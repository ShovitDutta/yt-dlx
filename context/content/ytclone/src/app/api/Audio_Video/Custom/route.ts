import YouTubeDLX from 'yt-dlx';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, options, resolution } = await req.json();

    // Ensure videoUrl is provided
    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    const decodedVideoUrl = decodeURIComponent(videoUrl);

    // Call the YouTubeDLX.Audio_Video.Custom function to download the audio and video
    const result = await YouTubeDLX.Audio_Video.Custom({ query: decodedVideoUrl, resolution: resolution, ...options });
    return NextResponse.json({ result: result }, { status: 200 });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}