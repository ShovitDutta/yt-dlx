import colors from "colors";
import { z, ZodError } from "zod";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional() });
interface TubeResponse<T> {
    data?: T;
    message?: string;
    status: "success" | "error";
}
type UnseenNotificationsResultData = { count: number };
type UnseenNotificationsResult = TubeResponse<UnseenNotificationsResultData>;
/**
 * @shortdesc Fetches the count of unseen YouTube notifications for the user using async/await instead of events.
 * @description This function retrieves the number of unseen notifications for an authenticated user asynchronously
 * using their authentication cookies and async/await. It leverages the youtubei.js client's asynchronous methods
 * and can optionally provide verbose logging. It returns a Promise resolving with the fetched count data
 * or rejects with an error, replacing the EventEmitter pattern.
 *
 * @param options - An object containing the configuration options validated by ZodSchema.
 * @param options.cookies - The user's cookies as a string. **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging during the process.
 * @returns {Promise<UnseenNotificationsResult>} A Promise that resolves with a TubeResponse object. On success, the `status` is "success" and `data` contains the `count` of unseen notifications.
 * @throws {Error} Throws a formatted error if input validation fails (ZodError), if cookie initialization fails, if fetching the notification count fails, or in case of any other unexpected errors during the asynchronous process.
 */
export default async function unseen_notifications(options: z.infer<typeof ZodSchema>): Promise<UnseenNotificationsResult> {
    try {
        ZodSchema.parse(options);
        const { verbose, cookies } = options;
        if (verbose) console.log(colors.green("@info:"), "Fetching unseen notifications...");
        if (!cookies) throw new Error(`${colors.red("@error:")} cookies not provided!`);
        const client: TubeType = await TubeLogin(cookies);
        if (!client) throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        const count = await client.getUnseenNotificationsCount();
        if (count === undefined || count === null) throw new Error(`${colors.red("@error:")} Failed to fetch unseen notifications count.`);
        const result: UnseenNotificationsResult = { status: "success", data: { count: Number(count) || 0 } };
        if (verbose) console.log(colors.green("@info:"), "Unseen notifications fetched!");
        return result;
    } catch (error: any) {
        if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw new Error(`${colors.red("@error:")} ${error.message}`);
        else throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
