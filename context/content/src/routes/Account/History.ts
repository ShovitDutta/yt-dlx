import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/SanitizeContentItem";
const ZodSchema = z.object({ Cookies: z.string(), Verbose: z.boolean().optional(), Sort: z.enum(["oldest", "newest", "old-to-new", "new-to-old"]).optional() });
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
interface Short {
    title: string;
    videoId: string;
    thumbnails: {
        url: string;
        width: number;
        height: number;
    }[];
}
interface Video {
    title: string;
    videoId: string;
    thumbnails: {
        url: string;
        width: number;
        height: number;
    }[];
    description: string;
}
export default async function watch_history(options: WatchHistoryOptions & { Verbose?: boolean }): Promise<TubeResponse<{ Shorts: Short[]; Videos: Video[] }>> {
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
            case "old-to-new":
                if (result.data?.Shorts)
                    result.data.Shorts.sort((a, b) => {
                        if (!a?.videoId || !b?.videoId) return 0;
                        return a.videoId.localeCompare(b.videoId);
                    });
                if (result.data?.Videos)
                    result.data.Videos.sort((a, b) => {
                        if (!a?.videoId || !b?.videoId) return 0;
                        return a.videoId.localeCompare(b.videoId);
                    });
                break;
            case "new-to-old":
                if (result.data?.Shorts)
                    result.data.Shorts.sort((a, b) => {
                        if (!a?.videoId || !b?.videoId) return 0;
                        return b.videoId.localeCompare(a.videoId);
                    });
                if (result.data?.Videos)
                    result.data.Videos.sort((a, b) => {
                        if (!a?.videoId || !b?.videoId) return 0;
                        return b.videoId.localeCompare(a.videoId);
                    });
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
