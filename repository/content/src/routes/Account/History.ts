import colors from "colors";
import { z, ZodError } from "zod";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/sanitizeContentItem";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional(), sort: z.enum(["oldest", "newest", "old-to-new", "new-to-old"]).optional() });
interface TubeResponse<T> {
    data?: T;
    message?: string;
    status: "success" | "error";
}
type WatchHistoryResultData = { Shorts: any[]; Videos: any[] };
type WatchHistoryResult = TubeResponse<WatchHistoryResultData>;
/**
 * @shortdesc Fetches the user's watch history, including videos and shorts, with optional sorting using async/await.
 * @description This function allows you to retrieve a user's watch history from the platform asynchronously using async/await.
 * It requires valid cookies for authentication and can fetch both regular videos and short videos from the history.
 * The function supports optional verbose logging and various sorting options.
 *
 * @param options - An object containing the configuration options validated by ZodSchema.
 * @param options.cookies - The user's cookies as a string. **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 * @param {("oldest" | "newest" | "old-to-new" | "new-to-old")} [options.sort] - Specify how the watch history should be sorted.
 * @returns {Promise<WatchHistoryResult>} A Promise that resolves with a TubeResponse object containing the fetched history, separated into `Shorts` and `Videos` arrays, upon successful completion. The status will be "success".
 * @throws {Error} Throws an error if argument validation fails (ZodError), cookie initialization fails, fetching history fails, or any other error occurs during the process. The error message will be formatted.
 */
export default async function watch_history(options: z.infer<typeof ZodSchema>): Promise<WatchHistoryResult> {
    try {
        ZodSchema.parse(options);
        const { verbose, cookies, sort } = options;
        if (verbose) console.log(colors.green("@info:"), "Fetching watch history...");
        if (!cookies) throw new Error(`${colors.red("@error:")} cookies not provided!`);
        const client: TubeType = await TubeLogin(cookies);
        if (!client) throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        const history = await client.getHistory();
        if (!history) throw new Error(`${colors.red("@error:")} Failed to fetch watch history.`);
        const result: WatchHistoryResult = { status: "success", data: { Shorts: [], Videos: [] } };
        if (history.sections) {
            for (const section of history.sections) {
                if (section.contents) {
                    for (const content of section.contents) {
                        const sanitized = await sanitizeContentItem(content);
                        if (sanitized?.type === "ReelShelf") {
                            const shorts =
                                sanitized.items?.map((item: any) => ({ title: item?.accessibility_text, videoId: item?.on_tap_endpoint?.payload?.videoId, thumbnails: item?.thumbnail })) || [];
                            if (result.data?.Shorts) result.data.Shorts.push(...shorts);
                        } else if (sanitized?.type === "Video") {
                            const video = { title: sanitized?.title?.text, videoId: sanitized?.videoId, thumbnails: sanitized?.thumbnails, description: sanitized?.description || "" };
                            if (result.data?.Videos) result.data.Videos.push(video);
                        }
                    }
                }
            }
        }
        switch (sort) {
            case "oldest":
                if (result.data?.Shorts && result.data.Shorts.length > 0) result.data.Shorts = result.data.Shorts.slice(0, 1);
                if (result.data?.Videos && result.data.Videos.length > 0) result.data.Videos = result.data.Videos.slice(0, 1);
                break;
            case "newest":
                if (result.data?.Shorts && result.data.Shorts.length > 0) result.data.Shorts = result.data.Shorts.slice(-1);
                if (result.data?.Videos && result.data.Videos.length > 0) result.data.Videos = result.data.Videos.slice(-1);
                break;
            case "old-to-new":
                if (result.data?.Shorts) result.data.Shorts.sort((a, b) => a.videoId.localeCompare(b.videoId));
                if (result.data?.Videos) result.data.Videos.sort((a, b) => a.videoId.localeCompare(b.videoId));
                break;
            case "new-to-old":
                if (result.data?.Shorts) result.data.Shorts.sort((a, b) => b.videoId.localeCompare(a.videoId));
                if (result.data?.Videos) result.data.Videos.sort((a, b) => b.videoId.localeCompare(a.videoId));
                break;
        }
        if (verbose) console.log(colors.green("@info:"), "Watch history fetched!");
        return result;
    } catch (error: any) {
        if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw new Error(`${colors.red("@error:")} ${error.message}`);
        else throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
