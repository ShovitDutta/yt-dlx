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
vitest.describe("subscriptions_feed", () => {
    const cookies = env.YouTubeDLX_COOKIES as string;
    if (!cookies) {
        console.warn("YouTubeDLX_COOKIES environment variable not set. Subscriptions feed tests requiring valid cookies will likely fail.");
    }
    const mockCookies = cookies || "dummy_cookies_for_tests";
    vitest.it("should handle basic subscriptions feed fetch", async () => {
        if (!cookies) {
            console.warn("Skipping basic fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await subscriptions_feed({ cookies: mockCookies });
        vitest.expect(result).toHaveProperty("status");
        vitest.expect(result.status).toBe("success");
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toHaveProperty("contents");
        vitest.expect(Array.isArray(result.data?.contents)).toBe(true);
    });
    vitest.it("should handle subscriptions feed fetch with verbose logging", async () => {
        if (!cookies) {
            console.warn("Skipping verbose fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await subscriptions_feed({ cookies: mockCookies, verbose: true });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should throw error for missing cookies (handled by explicit check)", async () => {
        await vitest.expect(subscriptions_feed({ cookies: "" })).rejects.toThrowError(/Cookies not provided!/);
    });
    vitest.it("should throw Zod error for missing cookies (handled by ZodSchema)", async () => {
        await vitest.expect(subscriptions_feed({} as any)).rejects.toThrowError(/cookies.*Required/);
    });
});
