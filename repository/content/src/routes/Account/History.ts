import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/sanitizeContentItem";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional(), sort: z.enum(["oldest", "newest", "old-to-new", "new-to-old"]).optional() });
type WatchHistoryOptions = z.infer<typeof ZodSchema>;
interface Short {
    title: string;
    videoId: string;
    thumbnails: any;
}
interface Video {
    title: string;
    videoId: string;
    thumbnails: any;
    description: string;
}
export default async function watch_history(options: WatchHistoryOptions): Promise<TubeResponse<{ Shorts: Short[]; Videos: Video[] }>> {
    try {
        ZodSchema.parse(options);
        const { verbose, cookies, sort } = options;
        if (verbose) console.log(colors.green("@info:"), "Starting watch history fetch...");
        if (!cookies) {
            throw new Error(`${colors.red("@error:")} Cookies not provided!`);
        }
        const client: TubeType = await TubeLogin(cookies);
        if (!client) {
            throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        }
        const history = await client.getHistory();
        if (!history) {
            throw new Error(`${colors.red("@error:")} Failed to fetch watch history.`);
        }
        const result: TubeResponse<{ Shorts: Short[]; Videos: Video[] }> = { status: "success", data: { Shorts: [], Videos: [] } };
        history.sections?.forEach(section => {
            section.contents?.forEach(content => {
                const sanitized = sanitizeContentItem(content);
                if (sanitized?.type === "ReelShelf") {
                    const shorts = sanitized.items?.map((item: any) => ({ title: item?.accessibility_text, videoId: item?.on_tap_endpoint?.payload?.videoId, thumbnails: item?.thumbnail })) || [];
                    if (result.data?.Shorts) result.data.Shorts.push(...shorts);
                } else if (sanitized?.type === "Video") {
                    const video = { title: sanitized?.title?.text, videoId: sanitized?.videoId, thumbnails: sanitized?.thumbnails, description: sanitized?.description || "" };
                    if (result.data?.Videos) result.data.Videos.push(video);
                }
            });
        });
        switch (sort) {
            case "oldest":
                if (result.data?.Shorts && result.data.Shorts.length > 0) result.data.Shorts.splice(0, result.data.Shorts.length - 1);
                if (result.data?.Videos && result.data.Videos.length > 0) result.data.Videos.splice(0, result.data.Videos.length - 1);
                break;
            case "newest":
                if (result.data?.Shorts && result.data.Shorts.length > 1) result.data.Shorts.splice(1);
                if (result.data?.Videos && result.data.Videos.length > 1) result.data.Videos.splice(1);
                break;
            case "old-to-new":
                if (result.data?.Shorts)
                    result.data.Shorts.sort((a, b) => {
                        if (!a.videoId || !b.videoId) return 0;
                        return a.videoId.localeCompare(b.videoId);
                    });
                if (result.data?.Videos) result.data.Videos.sort((a, b) => a.videoId.localeCompare(b.videoId));
                break;
            case "new-to-old":
                if (result.data?.Shorts)
                    result.data.Shorts.sort((a, b) => {
                        if (!a.videoId || !b.videoId) return 0;
                        return b.videoId.localeCompare(a.videoId);
                    });
                if (result.data?.Videos) result.data.Videos.sort((a, b) => b.videoId.localeCompare(a.videoId));
                break;
        }
        if (verbose) console.log(colors.green("@info:"), "Watch history fetched successfully!");
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
describe("watch_history", () => {
    const cookies = env.YouTubeDLX_COOKIES as string;
    if (!cookies) {
        console.warn("YouTubeDLX_COOKIES environment variable not set. Watch history tests requiring valid cookies will likely fail.");
    }
    const mockCookies = cookies || "dummy_cookies_for_tests";
    it("should handle basic watch history fetch", async () => {
        if (!cookies) {
            console.warn("Skipping basic fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies });
        expect(result).toHaveProperty("status");
        expect(result.status).toBe("success");
        expect(result).toHaveProperty("data");
        expect(result.data).toHaveProperty("Shorts");
        expect(result.data).toHaveProperty("Videos");
        expect(Array.isArray(result.data?.Shorts)).toBe(true);
        expect(Array.isArray(result.data?.Videos)).toBe(true);
    });
    it("should handle watch history fetch with verbose logging", async () => {
        if (!cookies) {
            console.warn("Skipping verbose fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, verbose: true });
        expect(result.status).toBe("success");
        expect(result.data).toBeInstanceOf(Object);
    });
    it("should handle watch history sorted by oldest", async () => {
        if (!cookies) {
            console.warn("Skipping oldest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, sort: "oldest" });
        expect(result.status).toBe("success");
        expect(result.data).toBeInstanceOf(Object);
    });
    it("should handle watch history sorted by newest", async () => {
        if (!cookies) {
            console.warn("Skipping newest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, sort: "newest" });
        expect(result.status).toBe("success");
        expect(result.data).toBeInstanceOf(Object);
    });
    it("should handle watch history sorted old to new", async () => {
        if (!cookies) {
            console.warn("Skipping old-to-new sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, sort: "old-to-new" });
        expect(result.status).toBe("success");
        expect(result.data).toBeInstanceOf(Object);
    });
    it("should handle watch history sorted new to old", async () => {
        if (!cookies) {
            console.warn("Skipping new-to-old sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, sort: "new-to-old" });
        expect(result.status).toBe("success");
        expect(result.data).toBeInstanceOf(Object);
    });
    it("should handle watch history with verbose and oldest sort", async () => {
        if (!cookies) {
            console.warn("Skipping verbose and oldest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, verbose: true, sort: "oldest" });
        expect(result.status).toBe("success");
        expect(result.data).toBeInstanceOf(Object);
    });
    it("should handle watch history with verbose and newest sort", async () => {
        if (!cookies) {
            console.warn("Skipping verbose and newest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, verbose: true, sort: "newest" });
        expect(result.status).toBe("success");
        expect(result.data).toBeInstanceOf(Object);
    });
    it("should handle watch history with verbose and old to new sort", async () => {
        if (!cookies) {
            console.warn("Skipping verbose and old-to-new sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, verbose: true, sort: "old-to-new" });
        expect(result.status).toBe("success");
        expect(result.data).toBeInstanceOf(Object);
    });
    it("should handle watch history with verbose and new to old sort", async () => {
        if (!cookies) {
            console.warn("Skipping verbose and new-to-old sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, verbose: true, sort: "new-to-old" });
        expect(result.status).toBe("success");
        expect(result.data).toBeInstanceOf(Object);
    });
    it("should throw error for missing cookies (handled by explicit check)", async () => {
        await expect(watch_history({ cookies: "" })).rejects.toThrowError(/Cookies not provided!/);
    });
    it("should throw Zod error for missing cookies (handled by ZodSchema)", async () => {
        await expect(watch_history({} as any)).rejects.toThrowError(/cookies.*Required/);
    });
    it("should throw Zod error for invalid sort", async () => {
        await expect(watch_history({ cookies: mockCookies, sort: "invalid-sort" as any })).rejects.toThrowError(/sort.*invalid enum value/);
    });
});
