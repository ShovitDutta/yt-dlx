import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional() });
type UnseenNotificationsOptions = z.infer<typeof ZodSchema>;
/**
 * @shortdesc Fetches the count of unseen YouTube notifications for the user.
 *
 * @description This function retrieves the number of unseen notifications for a user using their authentication cookies.
 * It logs in to YouTube using the provided cookies and calls the client method to get the notification count.
 * It can optionally provide verbose logging to detail the fetching process.
 *
 * The function requires valid cookies for authentication to access the user's notification information.
 *
 * It supports the following configuration options:
 * - **Cookies:** The user's cookies as a string. This is a mandatory parameter required for authenticating the request.
 * - **Verbose:** An optional boolean value that, if true, enables detailed logging to the console, providing more information about the process of fetching the notification count. Defaults to `false`.
 *
 * The function returns a Promise that resolves with a `TubeResponse` object containing the status and the fetched unseen notification count.
 *
 * @param {object} options - An object containing the configuration options for fetching the unseen notifications count.
 * @param {string} options.cookies - The user's YouTube authentication cookies as a string. **Required**.
 * @param {boolean} [options.verbose=false] - Enable verbose logging during the fetch process.
 *
 * @returns {Promise<TubeResponse<{ count: number }>>} A Promise that resolves with a `TubeResponse` object. The object has a `status` property (e.g., "success") and a `data` property containing an object with a `count` property, which is the number of unseen notifications.
 *
 * @throws {Error}
 * - Throws a `ZodError` if the input options fail schema validation (e.g., missing `cookies`).
 * - Throws an `Error` with the message "@error: Cookies not provided!" if the `cookies` parameter is empty (redundant validation but present in code).
 * - Throws an `Error` with the message "@error: Could not initialize Tube client." if the `TubeLogin` process fails, likely due to invalid or expired cookies.
 * - Throws an `Error` with the message "@error: Failed to fetch unseen notifications count." if the internal client method `getUnseenNotificationsCount()` returns `undefined`.
 * - Throws a generic `Error` for any other unexpected issues during the process.
 *
 * @example
 * // 1. Running Basic Unseen Notifications Fetch Example
 * const cookies = "YOUR_COOKIES_HERE";
 * try {
 * const result = await unseen_notifications({ cookies });
 * console.log("Unseen Notifications Count:", result.data.count);
 * } catch (error) {
 * console.error("Basic Fetch Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 2. Running Unseen Notifications Fetch with Verbose Logging Example
 * const cookies = "YOUR_COOKIES_HERE";
 * try {
 * const result = await unseen_notifications({ cookies, verbose: true });
 * console.log("Unseen Notifications Count (Verbose):", result.data.count);
 * } catch (error) {
 * console.error("Verbose Fetch Error:", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 3. Running Error Example: Missing Cookies (explicit check will catch this)
 * try {
 * await unseen_notifications({ cookies: "" });
 * console.log("This should not be reached - Missing Cookies Example.");
 * } catch (error) {
 * console.error("Expected Error (Missing Cookies):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 4. Running Error Example: Missing Cookies (Zod validation will catch this)
 * try {
 * await unseen_notifications({} as any); // Simulating missing required parameter for Zod
 * console.log("This should not be reached - Zod Error Example.");
 * } catch (error) {
 * console.error("Expected Zod Error (Missing Cookies):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 5. Running Error Example: Client Initialization Failure (e.g., invalid cookies)
 * // This scenario depends on the internal TubeLogin logic failing.
 * try {
 * await unseen_notifications({ cookies: "INVALID_OR_EXPIRED_COOKIES" });
 * } catch (error) {
 * console.error("Expected Error (Client Initialization Failed):", error instanceof Error ? error.message : error);
 * }
 *
 * @example
 * // 6. Running Error Example: Failed to fetch count
 * // This scenario occurs if the internal client's getUnseenNotificationsCount() returns undefined after successful login.
 * // It's difficult to trigger predictably via simple input options.
 * // try {
 * //    // Use cookies for an account where fetching count fails after login
 * //    await unseen_notifications({ cookies: "COOKIES_WHERE_FETCH_FAILS" });
 * // } catch (error) {
 * //    console.error("Expected Error (Failed to Fetch Count):", error instanceof Error ? error.message : error);
 * // }
 */
export default async function unseen_notifications(options: UnseenNotificationsOptions): Promise<TubeResponse<{ count: number }>> {
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
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
import { env } from "node:process";
import * as vitest from "vitest";
import dotenv from "dotenv";
dotenv.config();
vitest.describe("unseen_notifications", () => {
    const cookies = env.YouTubeDLX_COOKIES as string;
    if (!cookies) {
        console.warn("YouTubeDLX_COOKIES environment variable not set. Unseen notifications tests requiring valid cookies will likely fail.");
    }
    const mockCookies = cookies || "dummy_cookies_for_tests";
    vitest.it("should handle basic unseen notifications fetch", async () => {
        if (!cookies) {
            console.warn("Skipping basic fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await unseen_notifications({ cookies: mockCookies });
        vitest.expect(result).toHaveProperty("status");
        vitest.expect(result.status).toBe("success");
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toHaveProperty("count");
        vitest.expect(typeof result.data?.count).toBe("number");
    });
    vitest.it("should handle unseen notifications fetch with verbose logging", async () => {
        if (!cookies) {
            console.warn("Skipping verbose fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await unseen_notifications({ cookies: mockCookies, verbose: true });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
        vitest.expect(typeof result.data?.count).toBe("number");
    });
    vitest.it("should throw error for missing cookies (handled by explicit check)", async () => {
        await vitest.expect(unseen_notifications({ cookies: "" })).rejects.toThrowError(/Cookies not provided!/);
    });
    vitest.it("should throw Zod error for missing cookies (handled by ZodSchema)", async () => {
        await vitest.expect(unseen_notifications({} as any)).rejects.toThrowError(/cookies.*Required/);
    });
});
