import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
const ZodSchema = z.object({ Cookies: z.string(), Verbose: z.boolean().optional() });
type UnseenNotificationsOptions = z.infer<typeof ZodSchema>;
/**
 * @shortdesc Fetches the count of unseen notifications for a YouTube user.
 *
 * @description This function retrieves the number of unread or unseen notifications
 * for a YouTube account by authenticating with provided cookies.
 *
 * Authentication is handled by an internal `TubeLogin` utility, which requires valid
 * YouTube authentication cookies to successfully query notification status.
 *
 * The function returns an object containing the count of unseen notifications.
 *
 * @param {object} options - The configuration options for fetching unseen notifications.
 * @param {string} options.Cookies - Your YouTube authentication cookies. These are required for authentication.
 * @param {boolean} [options.Verbose=false] - If true, enables verbose logging throughout the process.
 *
 * @returns {Promise<TubeResponse<{ count: number }>>} A Promise that resolves to a `TubeResponse` object.
 * - On success (`status: "success"`), the `data` property contains an object with a `count` property, which is the number of unseen notifications.
 * - On failure (`status: "error"`), an error message will be available.
 *
 * @throws {Error}
 * - Throws an `Error` if `Cookies` are not provided.
 * - Throws an `Error` if the internal Tube client fails to initialize (e.g., due to invalid cookies).
 * - Throws an `Error` if fetching the unseen notifications count from YouTube fails or returns an undefined count.
 * - Throws a `ZodError` if the provided options do not conform to the expected schema.
 * - Throws a generic `Error` for any other unexpected issues during execution.
 *
 * @example
 * // 1. Fetching the count of unseen notifications
 * // Replace 'YOUR_YOUTUBE_COOKIES_STRING' with your actual YouTube authentication cookies.
 * // You can typically obtain these from your browser's developer tools when logged into YouTube.
 * try {
 * const myCookies = "YOUR_YOUTUBE_COOKIES_STRING";
 * const notifications = await unseen_notifications({ Cookies: myCookies });
 * console.log("Unseen Notifications Count:", notifications.data?.count);
 * } catch (error) {
 * console.error("Error fetching unseen notifications:", error);
 * }
 *
 * @example
 * // 2. Fetching the count of unseen notifications with verbose logging
 * // Replace 'YOUR_YOUTUBE_COOKIES_STRING' with your actual YouTube cookies.
 * try {
 * const myCookies = "YOUR_YOUTUBE_COOKIES_STRING";
 * const notifications = await unseen_notifications({ Cookies: myCookies, Verbose: true });
 * console.log("Unseen Notifications Count (Verbose):", notifications.data?.count);
 * } catch (error) {
 * console.error("Error fetching unseen notifications with verbose logging:", error);
 * }
 */
export default async function unseen_notifications(options: UnseenNotificationsOptions): Promise<TubeResponse<{ count: number }>> {
    let Verbose = false;
    try {
        ZodSchema.parse(options);
        const { Verbose: parsedVerbose, Cookies } = options;
        Verbose = parsedVerbose ?? false;
        if (Verbose) console.log(colors.green("@info:"), "Fetching unseen notifications...");
        if (!Cookies) throw new Error(`${colors.red("@error:")} Cookies not provided!`);
        const client: TubeType = await TubeLogin(Cookies);
        if (!client) throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        const count = await client.getUnseenNotificationsCount();
        if (count === undefined) throw new Error(`${colors.red("@error:")} Failed to fetch unseen notifications count.`);
        const result: TubeResponse<{ count: number }> = { status: "success", data: { count: Number(count) || 0 } };
        return result;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw error;
        else throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
