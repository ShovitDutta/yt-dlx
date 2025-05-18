import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional() });
type UnseenNotificationsOptions = z.infer<typeof ZodSchema>;
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
import { describe, it, expect } from "vitest";
import { env } from "node:process";
import dotenv from "dotenv";
dotenv.config();
describe("unseen_notifications", () => {
    const cookies = env.YouTubeDLX_COOKIES as string;
    if (!cookies) {
        console.warn("YouTubeDLX_COOKIES environment variable not set. Unseen notifications tests requiring valid cookies will likely fail.");
    }
    const mockCookies = cookies || "dummy_cookies_for_tests";
    it("should handle basic unseen notifications fetch", async () => {
        if (!cookies) {
            console.warn("Skipping basic fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await unseen_notifications({ cookies: mockCookies });
        expect(result).toHaveProperty("status");
        expect(result.status).toBe("success");
        expect(result).toHaveProperty("data");
        expect(result.data).toHaveProperty("count");
        expect(typeof result.data?.count).toBe("number");
    });
    it("should handle unseen notifications fetch with verbose logging", async () => {
        if (!cookies) {
            console.warn("Skipping verbose fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await unseen_notifications({ cookies: mockCookies, verbose: true });
        expect(result.status).toBe("success");
        expect(result.data).toBeInstanceOf(Object);
        expect(typeof result.data?.count).toBe("number");
    });
    it("should throw error for missing cookies (handled by explicit check)", async () => {
        await expect(unseen_notifications({ cookies: "" })).rejects.toThrowError(/Cookies not provided!/);
    });
    it("should throw Zod error for missing cookies (handled by ZodSchema)", async () => {
        await expect(unseen_notifications({} as any)).rejects.toThrowError(/cookies.*Required/);
    });
});
