import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/SanitizeContentItem";
const ZodSchema = z.object({ Cookies: z.string(), Verbose: z.boolean().optional(), Sort: z.enum(["oldest", "newest", "old-to-new", "new-to-old"]).optional() });
type HomeFeedOptions = z.infer<typeof ZodSchema>;
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
    type: string;
    title: string;
    videoId: string;
    description: string;
    thumbnails: {
        url: string;
        width: number;
        height: number;
    }[];
    authorId: string;
    authorName: string;
    authorThumbnails: {
        url: string;
        width: number;
        height: number;
    }[];
    authorBadges: {
        text: string;
    }[];
    authorUrl: string;
    viewCount: string;
    shortViewCount: string;
}
export default async function home_feed(options: HomeFeedOptions): Promise<TubeResponse<{ Shorts: Short[]; Videos: Video[] }>> {
    let Verbose = false;
    try {
        ZodSchema.parse(options);
        const { Verbose: parsedVerbose, Cookies, Sort } = options;
        Verbose = parsedVerbose ?? false;
        if (!Cookies) throw new Error(`${colors.red("@error:")} Cookies not provided!`);
        const client: TubeType = await TubeLogin(Cookies);
        if (!client) throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        const homeFeed = await client.getHomeFeed();
        if (!homeFeed) throw new Error(`${colors.red("@error:")} Failed to fetch home feed.`);
        const result: TubeResponse<{ Shorts: Short[]; Videos: Video[] }> = { status: "success", data: { Shorts: [], Videos: [] } };
        homeFeed.contents?.contents?.forEach((section: any) => {
            if (section?.type === "RichItem" && section?.content?.type === "Video") {
                const sanitized = sanitizeContentItem(section);
                if (sanitized?.content) {
                    result.data?.Videos.push({
                        type: sanitized.content.type || "",
                        title: sanitized.content.title?.text || "",
                        videoId: sanitized.content.video_id || "",
                        description: sanitized.content.description_snippet?.text || "",
                        thumbnails: sanitized.content.thumbnails?.[0]?.Highest?.url || [],
                        authorId: sanitized.content.author?.id || "",
                        authorName: sanitized.content.author?.name || "",
                        authorThumbnails: sanitized.content.author.thumbnails || [],
                        authorBadges: sanitized.content.author.badges || [],
                        authorUrl: sanitized.content.author.url || "",
                        viewCount: sanitized.content.view_count?.text || "",
                        shortViewCount: sanitized.content.short_view_count?.text || "",
                    });
                }
            } else if (section?.type === "RichSection" && section?.content?.type === "RichShelf") {
                section.content.contents?.forEach((item: any) => {
                    if (item?.content?.type === "ShortsLockupView") {
                        const short = {
                            title: item.content.accessibility_text || "",
                            videoId: item.content.on_tap_endpoint?.payload?.videoId,
                            thumbnails: item.content.thumbnail?.Highest?.url || null,
                        };
                        result.data?.Shorts.push(short);
                    }
                });
            }
        });
        switch (Sort) {
            case "oldest":
                if (result.data?.Shorts) result.data.Shorts.splice(0, result.data.Shorts.length - 1);
                if (result.data?.Videos) result.data.Videos.splice(0, result.data.Videos.length - 1);
                break;
            case "newest":
                if (result.data?.Shorts) result.data.Shorts.splice(1);
                if (result.data?.Videos) result.data.Videos.splice(1);
                break;
            case "old-to-new":
                if (result.data?.Shorts)
                    result.data.Shorts.sort((a, b) => {
                        if (!a.videoId || !b.videoId) return 0;
                        return a.videoId.localeCompare(b.videoId);
                    });
                if (result.data?.Videos) result.data.Videos.sort((a, b) => a.videoId.localeCompare(b.videoId));
                break;
            case "new-to-old":
                if (result.data?.Shorts)
                    result.data.Shorts.sort((a, b) => {
                        if (!a.videoId || !b.videoId) return 0;
                        return b.videoId.localeCompare(a.videoId);
                    });
                if (result.data?.Videos) result.data.Videos.sort((a, b) => b.videoId.localeCompare(a.videoId));
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
