import YouTubeDLX from 'yt-dlx';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const playlistLink = req.nextUrl.searchParams.get('playlistLink');
    const optionsString = req.nextUrl.searchParams.get('options');

    // Ensure playlistLink is provided
    if (!playlistLink) {
      return NextResponse.json({ error: 'Playlist link is required' }, { status: 400 });
    }

    let options = {};
    if (optionsString) {
      try {
        options = JSON.parse(optionsString);
      } catch (error) {
        return NextResponse.json({ error: 'Invalid options format. Options must be a valid JSON string.' }, { status: 400 });
      }
    }

    // Call the YouTubeDLX.Search.Playlist.Multiple function to search for playlists
    const result = await YouTubeDLX.Search.Playlist.Multiple({ playlistLink: playlistLink, ...options });
    return NextResponse.json({ result: result }, { status: 200 });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}