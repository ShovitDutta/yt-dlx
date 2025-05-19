// Suggestion: Add JSDoc comments to the function, explaining its purpose, parameters, and return value. Also, consider defining specific interfaces for the different types of renderers to improve type safety and code readability. The function recursively calls itself, so it could potentially lead to a stack overflow error if the renderer object is too deeply nested. Consider adding a check to prevent this.
export default function sanitizeRenderer(renderer: any): any {
    if (!renderer) return null;
    const result: any = { type: renderer.type };
    for (const key in renderer) {
        if (key === "type") continue;
        if (Array.isArray(renderer[key])) result[key] = renderer[key].map((item: any) => (typeof item === "object" ? sanitizeRenderer(item) : item));
        else if (typeof renderer[key] === "object") result[key] = sanitizeRenderer(renderer[key]);
        else result[key] = renderer[key];
    }
    return result;
}
