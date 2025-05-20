import YouTubeDLX from "yt-dlx";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const cookies = process.env.NEXT_PUBLIC_YOUTUBE_DLX_COOKIES;

        if (!cookies) {
            return NextResponse.json({ error: "NEXT_PUBLIC_YOUTUBE_DLX_COOKIES environment variable is not set" }, { status: 400 });
        }

        // Call the YouTubeDLX.Account.UnseenNotifications function to get unseen notifications data
        const result = await YouTubeDLX.Account.UnseenNotifications({ cookies: cookies });
        return NextResponse.json({ result: result }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
