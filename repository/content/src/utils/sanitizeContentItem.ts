import extractText from "./extractText";
import sanitizeRenderer from "./sanitizeRenderer"; // Assuming this is now an async function

/**
 * Sanitizes a content item based on its type, processing RichItem, RichSection, and ContinuationItem types.
 * This function is async because it calls and awaits other asynchronous sanitization functions like `sanitizeRenderer`.
 *
 * @param item The content item object to sanitize.
 * @returns A Promise resolving with the sanitized object structure, or the original item if its type is not handled, or null if the input is null/undefined.
 */
export default async function sanitizeContentItem(item: any): Promise<any> {
    if (!item) {
        return null;
    }

    if (item.type === "RichItem" && item.content?.videoRenderer) {
        // Operations within this block are synchronous
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
    } else if (item.type === "RichSection") {
        // Calling an assumed async function, so must await
        const sanitizedContent = item.content ? await sanitizeRenderer(item.content) : null;
        return { type: "RichSection", content: sanitizedContent };
    } else if (item.type === "ContinuationItem") {
        // This return is synchronous
        return { type: "ContinuationItem" };
    }

    // Default case: return item as is (synchronous)
    return item;
}
