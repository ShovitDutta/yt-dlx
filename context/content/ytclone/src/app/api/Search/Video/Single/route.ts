import YouTubeDLX from 'yt-dlx';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const videoLink = req.nextUrl.searchParams.get('videoLink');

    // Ensure videoLink is provided
    if (!videoLink) {
      return NextResponse.json({ error: 'Video link is required' }, { status: 400 });
    }

    // Call the YouTubeDLX.Search.Video.Single function to get video data
    const result = await YouTubeDLX.Search.Video.Single({ videoLink: videoLink });
    return NextResponse.json({ result: result }, { status: 200 });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}