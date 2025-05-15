export default function sanitizeRenderer(renderer: { [x: string]; type }) {
    if (!renderer) return null;
    const result = { type: renderer.type };
    for (const key in renderer) {
        if (key === "type") continue;
        if (Array.isArray(renderer[key])) result[key] = renderer[key].map(item => (typeof item === "object" ? sanitizeRenderer(item) : item));
        else if (typeof renderer[key] === "object") result[key] = sanitizeRenderer(renderer[key]);
        else result[key] = renderer[key];
    }
    return result;
}
