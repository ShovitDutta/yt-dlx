import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/SanitizeContentItem";
const ZodSchema = z.object({ Cookies: z.string(), Verbose: z.boolean().optional(), Sort: z.enum(["oldest", "newest"]).optional() });
type WatchHistoryOptions = z.infer<typeof ZodSchema>;
interface ReelShelfItem {
    accessibility_text?: string;
    on_tap_endpoint?: { payload?: { videoId?: string } };
    thumbnail?: {
        url: string;
        width: number;
        height: number;
    }[];
}
export interface Short {
    title: string;
    videoId: string;
    thumbnails: {
        url: string;
        width: number;
        height: number;
    }[];
}
export interface Video {
    title: string;
    videoId: string;
    thumbnails: {
        url: string;
        width: number;
        height: number;
    }[];
    description: string;
}
/**
 * @summary Fetches and processes the YouTube watch history for a given account.
 *
 * This function retrieves the watch history (including Shorts and regular videos) for a YouTube account using the provided cookies.
 * It initializes a Tube client, fetches the history, and then sanitizes and categorizes the content into Shorts and Videos.
 * The results can optionally be sorted based on the `Sort` parameter.
 * The `Verbose` option provides additional logging information.
 *
 * @param options - An object containing the options for fetching the watch history.
 * @param options.Cookies - A string containing the YouTube cookies required for authentication. This is a mandatory parameter.
 * @param options.Verbose - An optional boolean that, when set to `true`, enables verbose logging, displaying informational messages during execution. Defaults to `false`.
 * @param options.Sort - An optional enum specifying the sorting order for the fetched history items.
 * - `"oldest"`: Returns only the oldest item in both Shorts and Videos arrays.
 * - `"newest"`: Returns only the newest item in both Shorts and Videos arrays.
 *
 * @returns A Promise that resolves to a `TubeResponse` object.
 * If successful, the `status` will be "success" and `data` will contain an object with:
 * - `Shorts`: An array of `Short` objects, each containing `title`, `videoId`, and `thumbnails`.
 * - `Videos`: An array of `Video` objects, each containing `title`, `videoId`, `thumbnails`, and `description`.
 *
 * @throws {Error}
 * - If `Cookies` are not provided: `Error: @error: Cookies not provided!`
 * - If the Tube client cannot be initialized: `Error: @error: Could not initialize Tube client.`
 * - If fetching watch history fails: `Error: @error: Failed to fetch watch history.`
 * - If argument validation fails due to invalid `options` (e.g., incorrect type or missing required fields): `Error: @error: Argument validation failed: [path]: [message]`
 * - For any other unexpected errors: `Error: @error: An unexpected error occurred: [error_message]`
 */
export default async function Account_History(options: WatchHistoryOptions & { Verbose?: boolean }): Promise<TubeResponse<{ Shorts: Short[]; Videos: Video[] }>> {
    let Verbose = false;
    try {
        ZodSchema.parse(options);
        const { Verbose: parsedVerbose = false, Cookies, Sort } = options;
        Verbose = parsedVerbose;
        if (!Cookies) throw new Error(`${colors.red("@error:")} Cookies not provided!`);
        const client: TubeType = await TubeLogin(Cookies);
        if (!client) throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        const history = await client.getHistory();
        if (!history) throw new Error(`${colors.red("@error:")} Failed to fetch watch history.`);
        const result: TubeResponse<{ Shorts: Short[]; Videos: Video[] }> = { status: "success", data: { Shorts: [], Videos: [] } };
        history.sections?.forEach(section => {
            section.contents?.forEach(content => {
                const sanitized = sanitizeContentItem(content);
                if (sanitized?.type === "ReelShelf") {
                    const shorts =
                        sanitized.items?.map((item: ReelShelfItem) => ({ title: item?.accessibility_text, videoId: item?.on_tap_endpoint?.payload?.videoId, thumbnails: item?.thumbnail })) || [];
                    if (result.data?.Shorts) result.data.Shorts.push(...shorts);
                } else if (sanitized?.type === "Video") {
                    const video = { title: sanitized?.title?.text, videoId: sanitized?.videoId, thumbnails: sanitized?.thumbnails, description: sanitized?.description || "" };
                    if (result.data?.Videos) result.data.Videos.push(video);
                }
            });
        });
        switch (Sort) {
            case "oldest":
                if (result.data?.Shorts && result.data.Shorts.length > 0) result.data.Shorts.splice(0, result.data.Shorts.length - 1);
                if (result.data?.Videos && result.data.Videos.length > 0) result.data.Videos.splice(0, result.data.Videos.length - 1);
                break;
            case "newest":
                if (result.data?.Shorts && result.data.Shorts.length > 1) result.data.Shorts.splice(1);
                if (result.data?.Videos && result.data.Videos.length > 1) result.data.Videos.splice(1);
                break;
        }
        return result;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw error;
        else throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
