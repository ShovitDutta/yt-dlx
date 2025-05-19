import YouTubeDLX from 'yt-dlx';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const query  = req.nextUrl.searchParams.get('query');

    // Ensure query is provided
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const decodedQuery = decodeURIComponent(query);

    // Call the YouTubeDLX.Search.Video.Multiple function to search for videos
    const result = await YouTubeDLX.Search.Video.Multiple({ query: decodedQuery });
    return NextResponse.json({ result: result }, { status: 200 });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}