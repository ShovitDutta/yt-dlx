import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/SanitizeContentItem";
const ZodSchema = z.object({ Cookies: z.string(), Verbose: z.boolean().optional() });
type subscriptions_feedOptions = z.infer<typeof ZodSchema>;
interface Content {
    type: string;
    title: string;
    videoId: string;
    authorId: string;
    authorUrl: string;
    viewCount: string;
    authorName: string;
    description: string;
    authorBadges: {
        text: string;
    }[];
    shortViewCount: string;
    thumbnails: {
        url: string;
        width: number;
        height: number;
    }[];
    authorThumbnails: {
        url: string;
        width: number;
        height: number;
    }[];
}
/**
 * @shortdesc Fetches and processes the YouTube subscriptions feed for a given account.
 *
 * @description This function retrieves the personalized subscriptions feed content for a YouTube account using the provided cookies.
 * It initializes a Tube client, fetches the feed, and then sanitizes and structures the content.
 * The `Verbose` option provides additional logging information.
 *
 * @param options - An object containing the options for fetching the subscriptions feed.
 * @param options.Cookies - A string containing the YouTube cookies required for authentication. This is a mandatory parameter.
 * @param options.Verbose - An optional boolean that, when set to `true`, enables verbose logging, displaying informational messages during execution. Defaults to `false`.
 *
 * @returns A Promise that resolves to a `TubeResponse` object.
 * If successful, the `status` will be "success" and `data` will contain an object with:
 * - `contents`: An array of `Content` objects, each representing a video from the subscriptions feed, containing details like `type`, `title`, `videoId`, `authorId`, `authorUrl`, `viewCount`, `authorName`, `description`, `authorBadges`, `shortViewCount`, `thumbnails`, and `authorThumbnails`.
 *
 * @throws {Error}
 * - If `Cookies` are not provided: `Error: @error: Cookies not provided!`
 * - If the Tube client cannot be initialized: `Error: @error: Could not initialize Tube client.`
 * - If fetching the subscriptions feed fails: `Error: @error: Failed to fetch subscriptions feed.`
 * - If argument validation fails due to invalid `options` (e.g., incorrect type or missing required fields): `Error: @error: Argument validation failed: [path]: [message]`
 * - For any other unexpected errors: `Error: @error: An unexpected error occurred: [error_message]`
 */
export default async function Account_SubscriptionsFeed({ Cookies, Verbose = false }: subscriptions_feedOptions): Promise<TubeResponse<{ contents: Content[] }>> {
    try {
        ZodSchema.parse({ Cookies, Verbose });
        if (Verbose) console.log(colors.green("@info:"), "Fetching subscriptions feed...");
        if (!Cookies) throw new Error(`${colors.red("@error:")} Cookies not provided!`);
        const client: TubeType = await TubeLogin(Cookies);
        if (!client) throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        const feed = await client.getSubscriptionsFeed();
        if (!feed) throw new Error(`${colors.red("@error:")} Failed to fetch subscriptions feed.`);
        const contents =
            (feed as any).contents?.map((item: any) => {
                const sanitized = sanitizeContentItem(item);
                return {
                    type: sanitized?.type || "",
                    title: sanitized?.title?.text || "",
                    videoId: sanitized?.videoId || "",
                    thumbnails: sanitized?.thumbnails?.[0]?.Highest?.url || [],
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
        return result;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw error;
        else throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
