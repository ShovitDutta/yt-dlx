import colors from "colors";
import { z, ZodError } from "zod";
import Tuber from "../../../utils/Agent";
import type EngineOutput from "../../../interfaces/EngineOutput";
const ZodSchema = z.object({ query: z.string().min(2), verbose: z.boolean().optional() });
interface ManifestFormat {
    format: string;
    tbr: number;
}
interface OtherFormat {
    filesizeP?: string | number;
    format_note?: string;
}
interface ListFormatsData {
    ManifestLow: ManifestFormat[];
    ManifestHigh: ManifestFormat[];
    AudioLow: OtherFormat[];
    VideoLow: OtherFormat[];
    VideoHigh: OtherFormat[];
    AudioHigh: OtherFormat[];
    VideoLowHDR: OtherFormat[];
    AudioLowDRC: OtherFormat[];
    AudioHighDRC: OtherFormat[];
    VideoHighHDR: OtherFormat[];
}
/**
 * @shortdesc Lists available audio and video formats for a YouTube video based on a search query or URL.
 *
 * @description This function retrieves detailed information about the various audio and video formats
 * available for a specific YouTube video identified by a search query or URL.
 * It uses an internal engine (`Tuber`) to fetch this data.
 * The function requires a query string as input and can optionally enable verbose logging for the internal fetching process.
 *
 * The function returns a structured object containing arrays of formats categorized by quality (low, high)
 * and type (Manifest, Audio, Video, HDR, DRC). The format details include properties like format identifier,
 * average bitrate (`tbr` for Manifests), estimated file size (`filesizeP`), and format notes.
 *
 * It requires a valid search query or URL to identify the YouTube video.
 *
 * The function supports the following configuration options:
 * - **Query:** A string representing the Youtube query or video URL. Must be at least 2 characters long. **Required**.
 * - **Verbose:** An optional boolean flag that, if true, enables detailed console logging for the internal fetching process by the engine. Defaults to `false`.
 *
 * The function returns a Promise that resolves with an object containing the formatted list of available streams.
 *
 * @param {object} options - The configuration options for listing formats.
 * @param {string} options.query - The Youtube query or video URL (minimum 2 characters). **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging for the internal engine request.
 *
 * @returns {Promise<{ data: ListFormatsData }>} A Promise that resolves with an object containing a `data` property. The `data` property is a `ListFormatsData` object with arrays of various audio and video formats.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing `query`, `query` is less than 2 characters).
 * - Throws an `Error` if the internal engine (`Tuber`) fails to retrieve a response from YouTube.
 * - Throws a generic `Error` for any other unexpected issues.
 *
 * @example
 * // 1. Running Basic Format List Fetch Example
 * try {
 * const result = await list_formats({ query: "test video" });
 * console.log("Available Formats:", result.data);
 * // Example: Accessing specific format lists
 * // console.log("High Quality Audio Formats:", result.data.AudioHigh);
 * // console.log("Manifest High Quality Formats:", result.data.ManifestHigh);
 * } catch (error) {
 * console.error("Basic Format List Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Format List Fetch with Verbose Logging Example
 * try {
 * const result = await list_formats({ query: "another video topic", verbose: true });
 * console.log("Available Formats:", result.data);
 * } catch (error) {
 * console.error("Verbose Format List Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Zod Validation Error Example (Missing Query - will throw ZodError)
 * try {
 * await list_formats({} as any); // Using 'as any' to simulate missing required parameter
 * } catch (error) {
 * console.error("Expected Error (Missing Query):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Zod Validation Error Example (Short Query - will throw ZodError)
 * try {
 * await list_formats({ query: "a" }); // Query is less than minimum length (2)
 * } catch (error) {
 * console.error("Expected Error (Query Too Short):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Example of Error when Engine Fails to Respond (e.g., network issue, engine down)
 * // This is hard to trigger predictably with a simple query.
 * // You might try a query that is specifically designed to cause the engine to fail, if known.
 * // try {
 * //    await list_formats({ query: "query-that-causes-engine-error" });
 * // } catch (error) {
 * //    console.error("Expected Error (Engine Response Failure):", error instanceof Error ? error.message : error);
 * // }
 *
 * @example
 * // 6. Example of an Unexpected Error
 * // This catches any errors not specifically handled (like Zod or engine response failure).
 * // try {
 * //    // Code that might lead to an unexpected error during execution
 * //    await list_formats({ query: "some video query" });
 * // } catch (error) {
 * //    console.error("Expected Unexpected Error:", error instanceof Error ? error.message : error);
 * // }
 */
export default async function list_formats({ query, verbose }: z.infer<typeof ZodSchema>): Promise<{ data: ListFormatsData }> {
    try {
        ZodSchema.parse({ query, verbose });
        const metaBody: EngineOutput = await Tuber({ query, verbose });
        if (!metaBody) {
            throw new Error(`${colors.red("@error:")} Unable to get response from YouTube.`);
        }
        const data: ListFormatsData = {
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
