// ./ytclone/src/app/api/video/[videoId]/comments/route.ts

import { NextResponse } from 'next/server';
import YouTubeDLX from 'yt-dlx';

export async function GET(request: Request, { params }: { params: { videoId: string } }) {
  const { videoId } = params;
  const { searchParams } = new URL(request.url);
  const verbose = searchParams.get('verbose') === 'true';

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID parameter is required' }, { status: 400 });
  }

  try {
    const videoComments = await new Promise((resolve, reject) => {
      // The Comments function in yt-dlx takes a query, not a videoId directly.
      // We'll use the videoId as the query here, assuming yt-dlx can handle it.
      // If not, we might need an intermediate step to get video details first.
      const emitter = YouTubeDLX.Misc.Video.Comments({
        query: videoId,
        verbose,
      });

      emitter.on('data', (data) => {
        resolve(data);
      });

      emitter.on('error', (error) => {
        reject(error);
      });
    });

    return NextResponse.json(videoComments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}