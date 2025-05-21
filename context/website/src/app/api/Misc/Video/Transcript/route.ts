import YouTubeDLX from "yt-dlx";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const videoLink = req.nextUrl.searchParams.get("videoLink");

        // Ensure videoLink is provided
        if (!videoLink) {
            return NextResponse.json({ error: "Video link is required" }, { status: 400 });
        }

        const decodedVideoLink = decodeURIComponent(videoLink);

        // Call the YouTubeDLX.Misc.Video.Transcript function to get video transcript
        const result = await YouTubeDLX.Misc.Video.Transcript({ videoLink: decodedVideoLink });
        return NextResponse.json({ result: result }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
