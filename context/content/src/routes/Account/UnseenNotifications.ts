import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
const ZodSchema = z.object({ Cookies: z.string(), Verbose: z.boolean().optional() });
type UnseenNotificationsOptions = z.infer<typeof ZodSchema>;
/**
 * @summary Fetches the count of unseen YouTube notifications for a given account.
 *
 * This function retrieves the number of unseen notifications for a YouTube account using the provided cookies.
 * It initializes a Tube client and then calls the `getUnseenNotificationsCount` method to get the count.
 * The `Verbose` option provides additional logging information.
 *
 * @param options - An object containing the options for fetching unseen notifications.
 * @param options.Cookies - A string containing the YouTube cookies required for authentication. This is a mandatory parameter.
 * @param options.Verbose - An optional boolean that, when set to `true`, enables verbose logging, displaying informational messages during execution. Defaults to `false`.
 *
 * @returns A Promise that resolves to a `TubeResponse` object.
 * If successful, the `status` will be "success" and `data` will contain an object with:
 * - `count`: A number representing the total count of unseen notifications. Defaults to 0 if the count is not available.
 *
 * @throws {Error}
 * - If `Cookies` are not provided: `Error: @error: Cookies not provided!`
 * - If the Tube client cannot be initialized: `Error: @error: Could not initialize Tube client.`
 * - If fetching the unseen notifications count fails: `Error: @error: Failed to fetch unseen notifications count.`
 * - If argument validation fails due to invalid `options` (e.g., incorrect type or missing required fields): `Error: @error: Argument validation failed: [path]: [message]`
 * - For any other unexpected errors: `Error: @error: An unexpected error occurred: [error_message]`
 */
export default async function Account_UnseenNotifications(options: UnseenNotificationsOptions): Promise<TubeResponse<{ count: number }>> {
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
