import colors from "colors";
import { z, ZodError } from "zod";
import Tuber from "../../../utils/Agent";
import type EngineOutput from "../../../interfaces/EngineOutput";
const ZodSchema = z.object({ query: z.string().min(2), verbose: z.boolean().optional() });
/**
 * @shortdesc Lists available audio and video formats for a YouTube video based on a search query or URL.
 *
 * @description This function fetches information about the various audio and video formats available
 * for a YouTube video identified by a search query or URL. It uses an internal engine (`Tuber`)
 * to retrieve the video data and then extracts and organizes the format details.
 *
 * It requires a valid search query or URL to identify the YouTube video.
 * The function provides details on different format types, including manifest formats,
 * standard audio/video streams, and HDR/DRC variants, along with information like
 * format notes, total bitrate, and estimated file size (if available).
 *
 * The function supports the following configuration options:
 * - **Query:** A string representing the Youtube query or video URL. Must be at least 2 characters long. **Required**.
 * - **Verbose:** An optional boolean flag that, if true, enables detailed console logging during the fetching process. Defaults to `false`.
 *
 * The function returns a Promise that resolves with an object containing a `data` property.
 * The `data` property is an object where keys represent format categories (e.g., `ManifestLow`, `AudioHigh`, `VideoHighHDR`)
 * and values are arrays of simplified objects describing the formats within that category.
 *
 * @param {object} options - The configuration options for listing formats.
 * @param {string} options.query - The Youtube query or video URL (minimum 2 characters). **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 *
 * @returns {Promise<{ data: { ManifestLow: { format: string, tbr?: number }[], ManifestHigh: { format: string, tbr?: number }[], AudioLow: { filesizeP?: string, format_note?: string }[], VideoLow: { filesizeP?: string, format_note?: string }[], VideoHigh: { filesizeP?: string, format_note?: string }[], AudioHigh: { filesizeP?: string, format_note?: string }[], VideoLowHDR: { filesizeP?: string, format_note?: string }[], AudioLowDRC: { filesizeP?: string, format_note?: string }[], AudioHighDRC: { filesizeP?: string, format_note?: string }[], VideoHighHDR: { filesizeP?: string, format_note?: string }[] } }>} A Promise that resolves with an object containing the available format data categorized by type.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing `query`, `query` is less than 2 characters).
 * - Throws an `Error` if the internal engine (`Tuber`) is unable to retrieve a response for the query.
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Running Basic Format List
 * try {
 * const result = await list_formats({ query: "your search query or url" });
 * console.log("Available Formats:", result.data);
 * // Example access: console.log("High Quality Audio Formats:", result.data.AudioHigh);
 * } catch (error) {
 * console.error("Basic Format List Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Format List with Verbose Logging
 * try {
 * const result = await list_formats({ query: "your search query or url", verbose: true });
 * console.log("Available Formats (Verbose):", result.data);
 * } catch (error) {
 * console.error("Format List with Verbose Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Zod Validation Error Example (Missing Query - will throw ZodError)
 * try {
 * await list_formats({} as any); // Using 'as any' to simulate missing required parameter
 * console.log("This should not be reached - Missing Query Error.");
 * } catch (error) {
 * console.error("Expected Error (Missing Query):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Zod Validation Error Example (Short Query - will throw ZodError)
 * try {
 * await list_formats({ query: "a" }); // Query is less than minimum length (2)
 * console.log("This should not be reached - Short Query Error.");
 * } catch (error) {
 * console.error("Expected Error (Query Too Short):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Running No Engine Data Error (e.g., query yields no results or engine fails)
 * // Use a query very unlikely to return results or trigger an engine failure.
 * try {
 * await list_formats({ query: "a query that should return no results 12345abcde" });
 * console.log("This should not be reached - No Engine Data Error.");
 * } catch (error) {
 * console.error("Expected Error (No Engine Data):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Example of an Unexpected Error during fetch
 * // This is harder to trigger predictably with a simple example.
 * // try {
 * //    // Use a query that might somehow cause an unexpected issue with the internal engine
 * //    await list_formats({ query: "query causing internal error" });
 * // } catch (error) {
 * //    console.error("Expected Unexpected Error:", error instanceof Error ? error.message : error);
 * // }
 */
export default async function list_formats({ query, verbose }: z.infer<typeof ZodSchema>): Promise<{ data: any }> {
    try {
        ZodSchema.parse({ query, verbose });
        const metaBody: EngineOutput = await Tuber({ query, verbose });
        if (!metaBody) {
            throw new Error(`${colors.red("@error:")} Unable to get response from YouTube.`);
        }
        const data = {
            ManifestLow: metaBody.ManifestLow?.map(item => ({ format: item.format, tbr: item.tbr })) || [],
            ManifestHigh: metaBody.ManifestHigh?.map(item => ({ format: item.format, tbr: item.tbr })) || [],
            AudioLow: metaBody.AudioLow?.map(item => ({ filesizeP: item.filesizeP, format_note: item.format_note })) || [],
            VideoLow: metaBody.VideoLow?.map(item => ({ filesizeP: item.filesizeP, format_note: item.format_note })) || [],
            VideoHigh: metaBody.VideoHigh?.map(item => ({ filesizeP: item.filesizeP, format_note: item.format_note })) || [],
            AudioHigh: metaBody.AudioHigh?.map(item => ({ filesizeP: item.filesizeP, format_note: item.format_note })) || [],
            VideoLowHDR: metaBody.VideoLowHDR?.map(item => ({ filesizeP: item.filesizeP, format_note: item.format_note })) || [],
            AudioLowDRC: metaBody.AudioLowDRC?.map(item => ({ filesizeP: item.filesizeP, format_note: item.format_note })) || [],
            AudioHighDRC: metaBody.AudioHighDRC?.map(item => ({ filesizeP: item.filesizeP, format_note: item.format_note })) || [],
            VideoHighHDR: metaBody.VideoHighHDR?.map(item => ({ filesizeP: item.filesizeP, format_note: item.format_note })) || [],
        };
        return { data };
    } catch (error: any) {
        if (error instanceof ZodError) {
            const errorMessage = `${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        } else if (error instanceof Error) {
            console.error(error.message);
            throw error;
        } else {
            const unexpectedError = `${colors.red("@error:")} An unexpected error occurred: ${String(error)}`;
            console.error(unexpectedError);
            throw new Error(unexpectedError);
        }
    } finally {
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
(async () => {
    try {
        console.log("--- Running Basic Format List ---");
        const result = await list_formats({ query: "your search query or url" });
        console.log("Available Formats:", result.data);
    } catch (error) {
        console.error("Basic Format List Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Format List with Verbose Logging ---");
        const result = await list_formats({ query: "your search query or url", verbose: true });
        console.log("Available Formats (Verbose):", result.data);
    } catch (error) {
        console.error("Format List with Verbose Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Missing Query Error ---");
        await list_formats({} as any);
        console.log("This should not be reached - Missing Query Error.");
    } catch (error) {
        console.error("Expected Error (Missing Query):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Short Query Error ---");
        await list_formats({ query: "a" });
        console.log("This should not be reached - Short Query Error.");
    } catch (error) {
        console.error("Expected Error (Query Too Short):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running No Engine Data Error ---");
        await list_formats({ query: "a query that should return no results 12345abcde" });
        console.log("This should not be reached - No Engine Data Error.");
    } catch (error) {
        console.error("Expected Error (No Engine Data):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
