import YouTubeDLX from "yt-dlx";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const videoId = req.nextUrl.searchParams.get("videoId");

        // Ensure videoId is provided
        if (!videoId) {
            return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
        }

        const decodedVideoId = decodeURIComponent(videoId);

        // Call the YouTubeDLX.Misc.Video.Related function to get related videos
        const result = await YouTubeDLX.Misc.Video.Related({ videoId: decodedVideoId });
        return NextResponse.json({ result: result }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
