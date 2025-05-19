import YouTubeDLX from "yt-dlx";
import { NextResponse, NextRequest } from "next/server";
export async function GET(req: NextRequest) {
    try {
        const region = req.nextUrl.searchParams.get("region");
        if (!region) return NextResponse.json({ error: "Region is required" }, { status: 400 });
        const query = `Today Trending in ${decodeURIComponent(region)}`;
        const result = await YouTubeDLX.Search.Video.Multiple({ query: query });
        return NextResponse.json({ result: result }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
