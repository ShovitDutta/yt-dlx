// ./ytclone/src/app/api/video/[videoId]/related/route.ts

import { NextResponse } from 'next/server';
import YouTubeDLX from 'yt-dlx';

export async function GET(request: Request, { params }: { params: { videoId: string } }) {
  const { videoId } = params;

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID parameter is required' }, { status: 400 });
  }

  try {
    const relatedVideos = await new Promise((resolve, reject) => {
      const emitter = YouTubeDLX.Misc.Video.Related({
        videoId,
      });

      emitter.on('data', (data) => {
        resolve(data);
      });

      emitter.on('error', (error) => {
        reject(error);
      });
    });

    return NextResponse.json(relatedVideos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}