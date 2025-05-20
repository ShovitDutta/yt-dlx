import YouTubeDLX from "yt-dlx";
import { NextResponse, NextRequest } from "next/server";
export async function GET(req: NextRequest) {
    try {
        const query = req.nextUrl.searchParams.get("query");
        if (!query) {
            const errorResponse = NextResponse.json({ error: "query is required" }, { status: 400 });
            errorResponse.headers.set("Access-Control-Allow-Origin", "*");
            errorResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
            return errorResponse;
        }
        const decodedQuery = decodeURIComponent(query);
        const result = await YouTubeDLX.Misc.Video.Extract({ query: decodedQuery });
        const successResponse = NextResponse.json(result, { status: 200 });
        successResponse.headers.set("Access-Control-Allow-Origin", "*");
        successResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        successResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        return successResponse;
    } catch (error: any) {
        console.error(error);
        const errorResponse = NextResponse.json({ error: error.message }, { status: 500 });
        errorResponse.headers.set("Access-Control-Allow-Origin", "*");
        errorResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        return errorResponse;
    }
}

export async function OPTIONS(request: Request) {
    const response = new Response(null, { status: 200 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Max-Age", "86400");
    return response;
}
