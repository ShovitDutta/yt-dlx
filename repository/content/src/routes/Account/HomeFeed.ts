import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/sanitizeContentItem";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional(), sort: z.enum(["oldest", "newest", "old-to-new", "new-to-old"]).optional() });
type HomeFeedOptions = z.infer<typeof ZodSchema>;
interface Short {
    title: string;
    videoId: string;
    thumbnails: any[];
}
interface Video {
    type: string;
    title: string;
    videoId: string;
    description: string;
    thumbnails: any[];
    authorId: string;
    authorName: string;
    authorThumbnails: any[];
    authorBadges: any[];
    authorUrl: string;
    viewCount: string;
    shortViewCount: string;
}
export default async function home_feed(options: HomeFeedOptions): Promise<TubeResponse<{ Shorts: Short[]; Videos: Video[] }>> {
    try {
        ZodSchema.parse(options);
        const { verbose, cookies, sort } = options;
        if (verbose) console.log(colors.green("@info:"), "Fetching home feed...");
        if (!cookies) {
            throw new Error(`${colors.red("@error:")} Cookies not provided!`);
        }
        const client: TubeType = await TubeLogin(cookies);
        if (!client) {
            throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        }
        const homeFeed = await client.getHomeFeed();
        if (!homeFeed) {
            throw new Error(`${colors.red("@error:")} Failed to fetch home feed.`);
        }
        const result: TubeResponse<{ Shorts: Short[]; Videos: Video[] }> = { status: "success", data: { Shorts: [], Videos: [] } };
        homeFeed.contents?.contents?.forEach((section: any) => {
            if (section?.type === "RichItem" && section?.content?.type === "Video") {
                const sanitized = sanitizeContentItem(section);
                if (sanitized?.content) {
                    result.data?.Videos.push({
                        type: sanitized.content.type || "",
                        title: sanitized.content.title?.text || "",
                        videoId: sanitized.content.video_id || "",
                        description: sanitized.content.description_snippet?.text || "",
                        thumbnails: sanitized.content.thumbnails || [],
                        authorId: sanitized.content.author?.id || "",
                        authorName: sanitized.content.author?.name || "",
                        authorThumbnails: sanitized.content.author.thumbnails || [],
                        authorBadges: sanitized.content.author.badges || [],
                        authorUrl: sanitized.content.author.url || "",
                        viewCount: sanitized.content.view_count?.text || "",
                        shortViewCount: sanitized.content.short_view_count?.text || "",
                    });
                }
            } else if (section?.type === "RichSection" && section?.content?.type === "RichShelf") {
                section.content.contents?.forEach((item: any) => {
                    if (item?.content?.type === "ShortsLockupView") {
                        const short = { title: item.content.accessibility_text || "", videoId: item.content.on_tap_endpoint?.payload?.videoId, thumbnails: item.content.thumbnail || [] };
                        result.data?.Shorts.push(short);
                    }
                });
            }
        });
        switch (sort) {
            case "oldest":
                if (result.data?.Shorts) result.data.Shorts.splice(0, result.data.Shorts.length - 1);
                if (result.data?.Videos) result.data.Videos.splice(0, result.data.Videos.length - 1);
                break;
            case "newest":
                if (result.data?.Shorts) result.data.Shorts.splice(1);
                if (result.data?.Videos) result.data.Videos.splice(1);
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
        if (verbose) console.log(colors.green("@info:"), "Home feed fetched!");
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
vitest.describe("home_feed", () => {
    const cookies = env.YouTubeDLX_COOKIES as string;
    if (!cookies) {
        console.warn("YouTubeDLX_COOKIES environment variable not set. Home feed tests requiring valid cookies will likely fail.");
    }
    const mockCookies = cookies || "dummy_cookies_for_tests";
    vitest.it("should handle basic home feed fetch", async () => {
        if (!cookies) {
            console.warn("Skipping basic fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ cookies: mockCookies });
        vitest.expect(result).toHaveProperty("status");
        vitest.expect(result.status).toBe("success");
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toHaveProperty("Shorts");
        vitest.expect(result.data).toHaveProperty("Videos");
        vitest.expect(Array.isArray(result.data?.Shorts)).toBe(true);
        vitest.expect(Array.isArray(result.data?.Videos)).toBe(true);
    });
    vitest.it("should handle home feed fetch with verbose logging", async () => {
        if (!cookies) {
            console.warn("Skipping verbose fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ cookies: mockCookies, verbose: true });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle home feed sorted by oldest", async () => {
        if (!cookies) {
            console.warn("Skipping oldest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ cookies: mockCookies, sort: "oldest" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle home feed sorted by newest", async () => {
        if (!cookies) {
            console.warn("Skipping newest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ cookies: mockCookies, sort: "newest" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle home feed sorted old to new", async () => {
        if (!cookies) {
            console.warn("Skipping old-to-new sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ cookies: mockCookies, sort: "old-to-new" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle home feed sorted new to old", async () => {
        if (!cookies) {
            console.warn("Skipping new-to-old sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ cookies: mockCookies, sort: "new-to-old" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle home feed with verbose and oldest sort", async () => {
        if (!cookies) {
            console.warn("Skipping verbose and oldest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ cookies: mockCookies, verbose: true, sort: "oldest" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle home feed with verbose and newest sort", async () => {
        if (!cookies) {
            console.warn("Skipping verbose and newest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ cookies: mockCookies, verbose: true, sort: "newest" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle home feed with verbose and old to new sort", async () => {
        if (!cookies) {
            console.warn("Skipping verbose and old-to-new sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ cookies: mockCookies, verbose: true, sort: "old-to-new" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle home feed with verbose and new to old sort", async () => {
        if (!cookies) {
            console.warn("Skipping verbose and new-to-old sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ cookies: mockCookies, verbose: true, sort: "new-to-old" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should throw error for missing cookies (handled by explicit check)", async () => {
        await vitest.expect(home_feed({ cookies: "" })).rejects.toThrowError(/Cookies not provided!/);
    });
    vitest.it("should throw Zod error for missing cookies (handled by ZodSchema)", async () => {
        await vitest.expect(home_feed({} as any)).rejects.toThrowError(/cookies.*Required/);
    });
    vitest.it("should throw Zod error for invalid sort", async () => {
        await vitest.expect(home_feed({ cookies: mockCookies, sort: "invalid-sort" as any })).rejects.toThrowError(/sort.*invalid enum value/);
    });
});
