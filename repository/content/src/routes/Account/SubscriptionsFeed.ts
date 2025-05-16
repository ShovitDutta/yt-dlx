import colors from "colors";
import { z, ZodError } from "zod";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/sanitizeContentItem";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional() });
interface TubeResponse<T> {
    data?: T;
    message?: string;
    status: "success" | "error";
}
type SubscriptionsFeedResultData = { contents: any[] };
type SubscriptionsFeedResult = TubeResponse<SubscriptionsFeedResultData>;
/**
 * @shortdesc Fetches the user's YouTube subscriptions feed using async/await instead of events.
 * @description This function retrieves the latest content from the channels a user is subscribed to asynchronously
 * using their authentication cookies and async/await. It processes the feed items and can optionally provide verbose logging.
 * It returns a Promise resolving with the fetched data or rejects with an error, replacing the EventEmitter pattern.
 *
 * @param options - An object containing the configuration options validated by ZodSchema.
 * @param options.cookies - The user's cookies as a string. **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging during the process.
 * @returns {Promise<SubscriptionsFeedResult>} A Promise that resolves with a TubeResponse object. On success, the `status` is "success" and `data` contains an array of content items from the feed.
 * @throws {Error} Throws a formatted error if input validation fails (ZodError), if cookie initialization fails, if fetching the subscriptions feed from the platform fails, or in case of any other unexpected errors.
 */
export default async function subscriptions_feed(options: z.infer<typeof ZodSchema>): Promise<SubscriptionsFeedResult> {
    try {
        ZodSchema.parse(options);
        const { verbose, cookies } = options;
        if (verbose) console.log(colors.green("@info:"), "Fetching subscriptions feed...");
        if (!cookies) throw new Error(`${colors.red("@error:")} cookies not provided!`);
        const client: TubeType = await TubeLogin(cookies);
        if (!client) throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        const feed = await client.getSubscriptionsFeed();
        if (!feed) throw new Error(`${colors.red("@error:")} Failed to fetch subscriptions feed.`);
        const contentItems = (feed as any).contents;
        let sanitizedContents: any[] = [];
        if (contentItems && Array.isArray(contentItems)) {
            const sanitizationPromises = contentItems.map(item => sanitizeContentItem(item));
            sanitizedContents = await Promise.all(sanitizationPromises);
        }
        const result: SubscriptionsFeedResult = { status: "success", data: { contents: sanitizedContents } };
        if (verbose) console.log(colors.green("@info:"), "Subscriptions feed fetched!");
        return result;
    } catch (error: any) {
        if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw new Error(`${colors.red("@error:")} ${error.message}`);
        else throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
