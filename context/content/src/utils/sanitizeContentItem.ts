import extractText from "./ExtractText";
import sanitizeRenderer from "./SanitizeRenderer";
export default function sanitizeContentItem(item: any): any {
    if (!item) return null;
    if (item.type === "RichItem" && item.content?.videoRenderer) {
        return {
            type: "RichItem",
            content: {
                videoId: item.content.videoRenderer.videoId || "",
                title: extractText(item.content.videoRenderer.title),
                thumbnail: item.content.videoRenderer.thumbnail?.thumbnails?.map((t: any) => ({ url: t.url, width: t.width, height: t.height })) || [],
            },
        };
    } else if (item.type === "RichSection") return { type: "RichSection", content: item.content ? sanitizeRenderer(item.content) : null };
    else if (item.type === "ContinuationItem") return { type: "ContinuationItem" };
    return item;
}
