import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/sanitizeContentItem";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional() });
type subscriptions_feedOptions = z.infer<typeof ZodSchema>;
interface Content {
    type: string;
    title: string;
    videoId: string;
    thumbnails: any[];
    description: string;
    authorId: string;
    authorName: string;
    authorThumbnails: any[];
    authorBadges: any[];
    authorUrl: string;
    viewCount: string;
    shortViewCount: string;
}
export default async function subscriptions_feed({ cookies, verbose }: subscriptions_feedOptions): Promise<TubeResponse<{ contents: Content[] }>> {
    try {
        ZodSchema.parse({ cookies, verbose });
        if (verbose) console.log(colors.green("@info:"), "Fetching subscriptions feed...");
        if (!cookies) {
            throw new Error(`${colors.red("@error:")} Cookies not provided!`);
        }
        const client: TubeType = await TubeLogin(cookies);
        if (!client) {
            throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        }
        const feed = await client.getSubscriptionsFeed();
        if (!feed) {
            throw new Error(`${colors.red("@error:")} Failed to fetch subscriptions feed.`);
        }
        const contents =
            (feed as any).contents?.map((item: any) => {
                const sanitized = sanitizeContentItem(item);
                return {
                    type: sanitized?.type || "",
                    title: sanitized?.title?.text || "",
                    videoId: sanitized?.videoId || "",
                    thumbnails: sanitized?.thumbnails || [],
                    description: sanitized?.description?.text || "",
                    authorId: sanitized?.author?.id || "",
                    authorName: sanitized?.author?.name || "",
                    authorThumbnails: sanitized?.author?.thumbnails || [],
                    authorBadges: sanitized?.author?.badges || [],
                    authorUrl: sanitized?.author?.url || "",
                    viewCount: sanitized?.view_count?.text || "",
                    shortViewCount: sanitized?.short_view_count?.text || "",
                };
            }) || [];
        const result: TubeResponse<{ contents: Content[] }> = { status: "success", data: { contents } };
        if (verbose) console.log(colors.green("@info:"), "Subscriptions feed fetched!");
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
        return result;
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
    }
}
