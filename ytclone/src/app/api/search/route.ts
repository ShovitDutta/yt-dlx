// ./ytclone/src/app/api/search/route.ts
import YouTubeDLX from "yt-dlx";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const orderBy = searchParams.get("orderBy");
  const minViews = searchParams.get("minViews");
  const maxViews = searchParams.get("maxViews");
  const verbose = searchParams.get("verbose") === "true";
  const allowedOrderBy = ["relevance", "viewCount", "rating", "date"];
  if (!query) return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  const validatedOrderBy = orderBy && allowedOrderBy.includes(orderBy) ? orderBy : undefined;
  try {
    const searchResults = await new Promise((resolve, reject) => {
      const emitter = YouTubeDLX.Search.Video.Multiple({
        verbose,
        query: decodeURIComponent(query),
        orderBy: validatedOrderBy as any,
        minViews: minViews ? parseInt(minViews, 10) : undefined,
        maxViews: maxViews ? parseInt(maxViews, 10) : undefined,
      });
      emitter.on("data", data => {
        resolve(data);
      });
      emitter.on("error", error => {
        reject(error);
      });
    });
    return NextResponse.json(searchResults);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
