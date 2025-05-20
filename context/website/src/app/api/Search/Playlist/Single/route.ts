import YouTubeDLX from "yt-dlx";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const playlistLink = req.nextUrl.searchParams.get("playlistLink");

        // Ensure playlistLink is provided
        if (!playlistLink) {
            return NextResponse.json({ error: "Playlist link is required" }, { status: 400 });
        }

        const decodedPlaylistLink = decodeURIComponent(playlistLink);

        // Call the YouTubeDLX.Search.Playlist.Single function to get playlist data
        const result = await YouTubeDLX.Search.Playlist.Single({ playlistLink: decodedPlaylistLink });
        return NextResponse.json({ result: result }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
