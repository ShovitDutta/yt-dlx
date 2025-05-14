// ./ytclone/src/app/api/video/[videoId]/details/route.ts

import { NextResponse } from 'next/server';
import YouTubeDLX from 'yt-dlx';

export async function GET(request: Request, { params }: { params: { videoId: string } }) {
  const { videoId } = params;
  const { searchParams } = new URL(request.url);
  const verbose = searchParams.get('verbose') === 'true';
  const useTor = searchParams.get('useTor') === 'true';


  if (!videoId) {
    return NextResponse.json({ error: 'Video ID parameter is required' }, { status: 400 });
  }

  try {
    const videoDetails = await new Promise((resolve, reject) => {
      const emitter = YouTubeDLX.Misc.Video.Extract({
        query: videoId, // Use videoId as query for Extract
        verbose,
        useTor,
      });

      emitter.on('data', (data) => {
        resolve(data);
      });

      emitter.on('error', (error) => {
        reject(error);
      });
    });

    return NextResponse.json(videoDetails);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}