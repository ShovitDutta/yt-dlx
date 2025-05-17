import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional() });
/**
 * @shortdesc Fetches the count of unseen YouTube notifications for the user.
 *
 * @description This function retrieves the number of unseen notifications for a user using their authentication cookies.
 * It requires valid YouTube cookies for authentication to access the user's notification information.
 * The function initializes a Tube client using the provided cookies and then fetches the unseen notification count.
 * It can optionally provide verbose logging to detail the fetching process.
 *
 * The function supports the following configuration options:
 * - **Cookies:** The user's YouTube cookies as a string. This is a mandatory parameter required for authenticating the request.
 * - **Verbose:** An optional boolean value that, if true, enables detailed logging to the console, providing more information about the process of fetching the notification count. Defaults to `false`.
 *
 * The function returns a Promise that resolves with an object containing the status and the fetched count if successful.
 *
 * @param {object} options - An object containing the configuration options.
 * @param {string} options.cookies - The user's YouTube cookies as a string. **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging.
 *
 * @returns {Promise<{ data: TubeResponse<{ count: number }> }>} A Promise that resolves with an object. The object has a `data` property containing a `TubeResponse` object. The `TubeResponse`'s `data` property is an object with a `count` property representing the number of unseen notifications as a number.
 * The `TubeResponse` also includes a `status` field indicating the outcome ('success' or 'error' implicitly handled by throwing).
 *
 * @throws {Error}
 * - Throws an `Error` if the `cookies` parameter is not provided or is empty.
 * - Throws a `ZodError` if the input options fail schema validation (e.g., `cookies` is not a string).
 * - Throws an `Error` if the internal Tube client fails to initialize using the provided cookies (e.g., invalid or expired cookies).
 * - Throws an `Error` if fetching the unseen notifications count from the client fails (e.g., the count is undefined).
 * - Throws a generic `Error` for any other unexpected issues during the process.
 *
 * @example
 * // 1. Running Basic Unseen Notifications Fetch
 * const cookies = "YOUR_COOKIES_HERE"; // Replace with your actual cookies
 * try {
 * const result = await unseen_notifications({ cookies });
 * console.log("Unseen Notifications Count:", result.data?.data?.count);
 * } catch (error) {
 * console.error("Basic Unseen Notifications Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Unseen Notifications with Verbose Logging
 * const cookies = "YOUR_COOKIES_HERE"; // Replace with your actual cookies
 * try {
 * const result = await unseen_notifications({ cookies, verbose: true });
 * console.log("Unseen Notifications Count (Verbose):", result.data?.data?.count);
 * } catch (error) {
 * console.error("Unseen Notifications with Verbose Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Missing Cookies Error Example (will throw Error)
 * try {
 * await unseen_notifications({} as any); // Simulates missing cookies
 * console.log("This should not be reached - Missing Cookies Error.");
 * } catch (error) {
 * console.error("Expected Error (Missing Cookies):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Invalid Cookies Error Example (will typically throw Error due to client initialization failure)
 * // This scenario depends on the internal TubeLogin logic failing with invalid cookies.
 * try {
 * await unseen_notifications({ cookies: "INVALID_OR_EXPIRED_COOKIES" });
 * console.log("This should not be reached - Invalid Cookies Error.");
 * } catch (error) {
 * console.error("Expected Error (Client Initialization Failed):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Example of Fetch Failure after Client Initialization
 * // This is an internal error scenario, difficult to trigger predictably.
 * // It occurs if the client initializes but getUnseenNotificationsCount() returns undefined.
 * // try {
 * //    await unseen_notifications({ cookies: "VALID_COOKIES_BUT_FETCH_FAILS" });
 * // } catch (error) {
 * //    console.error("Expected Error (Failed to fetch count):", error instanceof Error ? error.message : error);
 * // }
 */
export default async function unseen_notifications(options: z.infer<typeof ZodSchema>): Promise<{ data: TubeResponse<{ count: number }> }> {
    try {
        ZodSchema.parse(options);
        const { verbose, cookies } = options;
        if (verbose) console.log(colors.green("@info:"), "Fetching unseen notifications...");
        if (!cookies) {
            throw new Error(`${colors.red("@error:")} Cookies not provided!`);
        }
        const client: TubeType = await TubeLogin(cookies);
        if (!client) {
            throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        }
        const count = await client.getUnseenNotificationsCount();
        if (count === undefined) {
            throw new Error(`${colors.red("@error:")} Failed to fetch unseen notifications count.`);
        }
        const result: TubeResponse<{ count: number }> = { status: "success", data: { count: Number(count) || 0 } };
        if (verbose) console.log(colors.green("@info:"), "Unseen notifications fetched!");
        return { data: result };
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
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
(async () => {
    const cookies = "YOUR_COOKIES_HERE";
    try {
        console.log("--- Running Basic Unseen Notifications Fetch ---");
        const result = await unseen_notifications({ cookies });
        console.log("Unseen Notifications Count:", result.data?.data?.count);
    } catch (error) {
        console.error("Basic Unseen Notifications Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Unseen Notifications with Verbose Logging ---");
        const result = await unseen_notifications({ cookies, verbose: true });
        console.log("Unseen Notifications Count (Verbose):", result.data?.data?.count);
    } catch (error) {
        console.error("Unseen Notifications with Verbose Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Missing Cookies Error ---");
        await unseen_notifications({} as any);
        console.log("This should not be reached - Missing Cookies Error.");
    } catch (error) {
        console.error("Expected Error (Missing Cookies):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Invalid Cookies Error ---");
        await unseen_notifications({ cookies: "INVALID_OR_EXPIRED_COOKIES" });
        console.log("This should not be reached - Invalid Cookies Error.");
    } catch (error) {
        console.error("Expected Error (Client Initialization Failed):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
