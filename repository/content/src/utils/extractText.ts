/**
 * Extracts text content from a text object structure, commonly found in API responses (e.g., from YouTube).
 * It attempts to retrieve a direct 'text' property or extract text from a 'runs' array property.
 * Although this function performs purely synchronous operations, it is defined as an async function
 * to maintain consistency with a codebase being refactored to predominantly use async/await.
 * The function resolves immediately with the extracted text information.
 *
 * @param textObj The object expected to contain text data, potentially having a 'text' property or a 'runs' array.
 * @returns A Promise resolving with an object containing the original 'runs' array (if present) and the extracted 'text' string.
 * Returns `{ runs: undefined, text: "" }` if the input object is null/undefined or if text cannot be extracted from the expected properties.
 */
export default async function extractText(textObj: any): Promise<{ runs?: any[]; text: string }> {
    // All operations within this function are synchronous object manipulations.
    // The 'async' keyword here primarily serves to make the function return a Promise,
    // aligning with the refactoring goal of using async/await syntax, even when no
    // asynchronous operations are being awaited internally.
    return {
        // Return the 'runs' array if it exists on the input object, otherwise undefined.
        runs: textObj?.runs || undefined,
        // Attempt to get 'text' from textObj.text, falling back to the text of the first item in textObj.runs,
        // and finally defaulting to an empty string if neither is found.
        text: textObj?.text || textObj?.runs?.[0]?.text || "",
    };
}
