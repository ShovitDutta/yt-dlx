// Suggestion: Add JSDoc comments to the function, explaining its purpose, parameters, and return value. Also, consider adding type definitions for the `textObj` parameter and the return value to improve type safety.
export default function extractText(textObj: any): { runs?: any[]; text: string } {
    return {
        runs: textObj?.runs || undefined,
        text: textObj?.text || textObj?.runs?.[0]?.text || "",
    };
}
