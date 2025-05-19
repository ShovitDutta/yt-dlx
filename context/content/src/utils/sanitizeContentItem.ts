// Suggestion: Add JSDoc comments to the function, explaining its purpose, parameters, and return value. Also, consider defining specific interfaces for the different types of content items to improve type safety and code readability.
import extractText from "./extractText";
import sanitizeRenderer from "./sanitizeRenderer";
export default function sanitizeContentItem(item: any): any {
    if (!item) return null;
    if (item.type === "RichItem" && item.content?.videoRenderer) {
        return {
            type: "RichItem",
            content: {
                videoId: item.content.videoRenderer.videoId || "",
                title: extractText(item.content.videoRenderer.title),
                thumbnail:
                    item.content.videoRenderer.thumbnail?.thumbnails?.map((t: any) => ({
                        url: t.url,
                        width: t.width,
                        height: t.height,
                    })) || [],
            },
        };
    } else if (item.type === "RichSection") return { type: "RichSection", content: item.content ? sanitizeRenderer(item.content) : null };
    else if (item.type === "ContinuationItem") return { type: "ContinuationItem" };

    return item;
}
