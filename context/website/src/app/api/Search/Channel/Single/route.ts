import YouTubeDLX from "yt-dlx";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const channelLink = req.nextUrl.searchParams.get("channelLink");

        // Ensure channelLink is provided
        if (!channelLink) {
            return NextResponse.json({ error: "Channel link is required" }, { status: 400 });
        }

        const decodedChannelLink = decodeURIComponent(channelLink);

        // Call the YouTubeDLX.Search.Channel.Single function to get channel data
        const result = await YouTubeDLX.Search.Channel.Single({ channelLink: decodedChannelLink });
        return NextResponse.json({ result: result }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
