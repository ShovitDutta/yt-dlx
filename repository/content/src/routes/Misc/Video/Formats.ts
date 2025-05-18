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
import * as vitest from "vitest";
vitest.describe("list_formats", () => {
    const validQuery = "test video";
    vitest.it("should handle basic format list fetch", async () => {
        const result = await list_formats({ query: validQuery });
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toHaveProperty("ManifestLow");
        vitest.expect(Array.isArray(result.data.ManifestLow)).toBe(true);
        vitest.expect(result.data).toHaveProperty("ManifestHigh");
        vitest.expect(Array.isArray(result.data.ManifestHigh)).toBe(true);
        vitest.expect(result.data).toHaveProperty("AudioLow");
        vitest.expect(Array.isArray(result.data.AudioLow)).toBe(true);
        vitest.expect(result.data).toHaveProperty("VideoLow");
        vitest.expect(Array.isArray(result.data.VideoLow)).toBe(true);
        vitest.expect(result.data).toHaveProperty("VideoHigh");
        vitest.expect(Array.isArray(result.data.VideoHigh)).toBe(true);
        vitest.expect(result.data).toHaveProperty("AudioHigh");
        vitest.expect(Array.isArray(result.data.AudioHigh)).toBe(true);
        vitest.expect(result.data).toHaveProperty("VideoLowHDR");
        vitest.expect(Array.isArray(result.data.VideoLowHDR)).toBe(true);
        vitest.expect(result.data).toHaveProperty("AudioLowDRC");
        vitest.expect(Array.isArray(result.data.AudioLowDRC)).toBe(true);
        vitest.expect(result.data).toHaveProperty("AudioHighDRC");
        vitest.expect(Array.isArray(result.data.AudioHighDRC)).toBe(true);
        vitest.expect(result.data).toHaveProperty("VideoHighHDR");
        vitest.expect(Array.isArray(result.data.VideoHighHDR)).toBe(true);
    });
    vitest.it("should handle format list fetch with verbose logging", async () => {
        const result = await list_formats({ query: validQuery, verbose: true });
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should throw Zod error for missing query", async () => {
        await vitest.expect(list_formats({} as any)).rejects.toThrowError(/query.*Required/);
    });
    vitest.it("should throw Zod error for short query", async () => {
        await vitest.expect(list_formats({ query: "a" })).rejects.toThrowError(/query.*should be at least 2 characters/);
    });
    vitest.it("should throw error if unable to get response from YouTube", async () => {
        const queryThatShouldFail = "a query that should return no results 12345abcde";
        try {
            await list_formats({ query: queryThatShouldFail });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/Unable to get response from YouTube./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for no engine data.");
    });
});
