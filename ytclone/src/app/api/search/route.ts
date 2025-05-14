// ./ytclone/src/app/api/search/route.ts

import { NextResponse } from 'next/server';
import YouTubeDLX from 'yt-dlx';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const minViews = searchParams.get('minViews');
  const maxViews = searchParams.get('maxViews');
  const orderBy = searchParams.get('orderBy');
  const verbose = searchParams.get('verbose') === 'true';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const searchResults = await new Promise((resolve, reject) => {
      const emitter = YouTubeDLX.Search.Video.Multiple({
        query,
        minViews: minViews ? parseInt(minViews, 10) : undefined,
        maxViews: maxViews ? parseInt(maxViews, 10) : undefined,
        orderBy: orderBy as any, // Cast to any for now, refine with Zod schema later
        verbose,
      });

      emitter.on('data', (data) => {
        resolve(data);
      });

      emitter.on('error', (error) => {
        reject(error);
      });
    });

    return NextResponse.json(searchResults);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}