/**
 * Recursively sanitizes a renderer object by copying its properties,
 * excluding the top-level 'type' key, and recursively sanitizing nested objects and arrays of objects.
 * This function is marked as async to align with a potentially larger async codebase,
 * although its internal operations are synchronous and it resolves immediately.
 *
 * @param renderer The renderer object to sanitize.
 * @returns A Promise resolving with the sanitized object structure, or null if the input is null/undefined.
 */
export default async function sanitizeRenderer(renderer: any): Promise<any> {
    if (!renderer) return null;

    const result: any = { type: renderer.type };

    for (const key in renderer) {
        if (key === "type") continue;

        if (Array.isArray(renderer[key])) {
            result[key] = renderer[key].map((item: any) => (typeof item === "object" && item !== null ? sanitizeRenderer(item) : item));
        } else if (typeof renderer[key] === "object" && renderer[key] !== null) {
            result[key] = sanitizeRenderer(renderer[key]);
        } else {
            result[key] = renderer[key];
        }
    }

    return result;
}
