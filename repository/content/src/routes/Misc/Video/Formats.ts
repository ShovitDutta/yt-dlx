import colors from "colors";
import { z, ZodError } from "zod";
import Tuber from "../../../utils/Agent";
import type EngineOutput from "../../../interfaces/EngineOutput";
const ZodSchema = z.object({ query: z.string().min(2), verbose: z.boolean().optional() });
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
