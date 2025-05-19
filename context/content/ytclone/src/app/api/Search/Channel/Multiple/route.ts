import YouTubeDLX from 'yt-dlx';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const query  = req.nextUrl.searchParams.get('query');
    const optionsString = req.nextUrl.searchParams.get('options');

    // Ensure query is provided
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const decodedQuery = decodeURIComponent(query);

    let options = {};
    if (optionsString) {
      try {
        options = JSON.parse(optionsString);
      } catch (error) {
        return NextResponse.json({ error: 'Invalid options format. Options must be a valid JSON string.' }, { status: 400 });
      }
    }

    // Call the YouTubeDLX.Search.Channel.Multiple function to search for channels
    const result = await YouTubeDLX.Search.Channel.Multiple({ query: decodedQuery, ...options });
    return NextResponse.json({ result: result }, { status: 200 });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}