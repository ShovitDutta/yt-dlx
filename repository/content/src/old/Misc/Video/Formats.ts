import colors from "colors";
import { z, ZodError } from "zod";
import { EventEmitter } from "events";
import Tuber from "../../../../utils/Agent";
import type EngineOutput from "../../../../interfaces/EngineOutput";
const ZodSchema = z.object({ query: z.string().min(2), verbose: z.boolean().optional() });
/**
 * @shortdesc Lists available audio and video formats for a YouTube video.
 *
 * @description This function retrieves and provides a detailed list of all available audio and video formats for a given YouTube video, specified by a search query or URL. It queries the engine to get format information, including details like format type, bitrate (tbr), filesize, and format notes. Optional verbose logging can be enabled.
 *
 * The function requires a search query or video URL.
 *
 * It supports the following configuration options:
 * - **query:** A string representing the search query or video URL for which to list formats. This is a mandatory parameter with a minimum length of 2 characters.
 * - **verbose:** An optional boolean value that, if true, enables detailed logging to the console during the process of querying the engine.
 *
 * The function returns an EventEmitter instance that emits events during the process:
 * - `"data"`: Emitted when the format information is successfully fetched and processed. The emitted data is an object containing arrays of formats categorized by type and quality (e.g., `ManifestLow`, `AudioHigh`, `VideoLowHDR`). Each item in these arrays includes relevant details like `format`, `tbr`, `filesizeP`, `format_note`, and `url` (though the code only maps a subset of properties for data emission).
 * - `"error"`: Emitted when an error occurs at any stage, such as argument validation, issues with the engine response, or unexpected errors. The emitted data is the error message.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.query - The search query or video URL. **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 *
 * @returns {EventEmitter} An EventEmitter instance for handling events during format listing.
 *
 * @example
 * // 1. List formats for a video using a query
 * YouTubeDLX.Misc.Video.Formats({ query: "your search query or url" })
 * .on("data", (data) => console.log("Available Formats:", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 2. List formats for a video with verbose logging
 * YouTubeDLX.Misc.Video.Formats({ query: "your search query or url", verbose: true })
 * .on("data", (data) => console.log("Available Formats (Verbose):", data))
 * .on("error", (error) => console.error("Error:", error));
 *
 * @example
 * // 3. Missing required 'query' parameter (will result in an error)
 * YouTubeDLX.Misc.Video.Formats({} as any)
 * .on("error", (error) => console.error("Expected Error (missing query):", error));
 *
 * @example
 * // 4. 'query' parameter is too short (will result in an error - Zod validation)
 * YouTubeDLX.Misc.Video.Formats({ query: "a" })
 * .on("error", (error) => console.error("Expected Error (query too short):", error));
 *
 * @example
 * // 5. Query results in no engine data
 * // Note: This scenario depends on the internal Tuber function's behavior.
 * // You can simulate by providing a query that is unlikely to return results.
 * YouTubeDLX.Misc.Video.Formats({ query: "a query that should return no results 12345abcde" })
 * .on("error", (error) => console.error("Expected Error (no engine data):", error));
 *
 */
export default function list_formats({ query, verbose }: z.infer<typeof ZodSchema>): EventEmitter {
    const emitter = new EventEmitter();
    (async () => {
        try {
            ZodSchema.parse({ query, verbose });
            const metaBody: EngineOutput = await Tuber({ query, verbose });
            if (!metaBody) {
                emitter.emit("error", `${colors.red("@error:")} Unable to get response from YouTube.`);
                return;
            }
            emitter.emit("data", {
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
            });
        } catch (error) {
            if (error instanceof ZodError) emitter.emit("error", `${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
            else if (error instanceof Error) emitter.emit("error", `${colors.red("@error:")} ${error.message}`);
            else emitter.emit("error", `${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
        } finally {
            console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
        }
    })();
    return emitter;
}
