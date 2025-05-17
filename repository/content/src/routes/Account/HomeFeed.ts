import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/sanitizeContentItem";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional(), sort: z.enum(["oldest", "newest", "old-to-new", "new-to-old"]).optional() });
type HomeFeedOptions = z.infer<typeof ZodSchema>;
export default async function home_feed(options: HomeFeedOptions): Promise<{ data: TubeResponse<{ Shorts: any[]; Videos: any[] }> }> {
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
        const result: TubeResponse<{ Shorts: any[]; Videos: any[] }> = { status: "success", data: { Shorts: [], Videos: [] } };
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
        console.log("--- Running Basic Home Feed Fetch ---");
        const result = await home_feed({ cookies });
        console.log("Home Feed:", result.data);
    } catch (error) {
        console.error("Basic Home Feed Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Home Feed with Verbose Logging ---");
        const result = await home_feed({ cookies, verbose: true });
        console.log("Home Feed (Verbose):", result.data);
    } catch (error) {
        console.error("Home Feed with Verbose Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Home Feed Sorted by Oldest ---");
        const result = await home_feed({ cookies, sort: "oldest" });
        console.log("Oldest Feed Items:", result.data);
    } catch (error) {
        console.error("Home Feed Sorted by Oldest Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Home Feed Sorted by Newest ---");
        const result = await home_feed({ cookies, sort: "newest" });
        console.log("Newest Feed Items:", result.data);
    } catch (error) {
        console.error("Home Feed Sorted by Newest Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Home Feed Sorted Old to New ---");
        const result = await home_feed({ cookies, sort: "old-to-new" });
        console.log("Home Feed (Old to New by ID):", result.data);
    } catch (error) {
        console.error("Home Feed Sorted Old to New Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Home Feed Sorted New to Old ---");
        const result = await home_feed({ cookies, sort: "new-to-old" });
        console.log("Home Feed (New to Old by ID):", result.data);
    } catch (error) {
        console.error("Home Feed Sorted New to Old Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Home Feed with Verbose and Oldest Sort ---");
        const result = await home_feed({ cookies, verbose: true, sort: "oldest" });
        console.log("Oldest Feed Items (Verbose):", result.data);
    } catch (error) {
        console.error("Home Feed with Verbose and Oldest Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Home Feed with Verbose and Newest Sort ---");
        const result = await home_feed({ cookies, verbose: true, sort: "newest" });
        console.log("Newest Feed Items (Verbose):", result.data);
    } catch (error) {
        console.error("Home Feed with Verbose and Newest Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Home Feed with Verbose and Old to New Sort ---");
        const result = await home_feed({ cookies, verbose: true, sort: "old-to-new" });
        console.log("Home Feed (Old to New by ID, Verbose):", result.data);
    } catch (error) {
        console.error("Home Feed with Verbose and Old to New Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Home Feed with Verbose and New to Old Sort ---");
        const result = await home_feed({ cookies, verbose: true, sort: "new-to-old" });
        console.log("Home Feed (New to Old by ID, Verbose):", result.data);
    } catch (error) {
        console.error("Home Feed with Verbose and New to Old Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Invalid Cookies Example ---");
        const result = await home_feed({ cookies: "" });
        console.log("This should not be reached - Invalid Cookies Example.");
    } catch (error) {
        console.error("Expected Error (Invalid Cookies):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Zod Validation Error Example (Missing Cookies) ---");
        await home_feed({} as any);
        console.log("This should not be reached - Zod Validation Error Example.");
    } catch (error) {
        console.error("Expected Zod Error (Missing Cookies):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Zod Validation Error Example (Invalid Sort) ---");
        await home_feed({ cookies, sort: "invalid-sort" as any });
        console.log("This should not be reached - Zod Validation Error Example.");
    } catch (error) {
        console.error("Expected Zod Error (Invalid Sort):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Invalid Cookies Example (Client Initialization Failure) ---");
        await home_feed({ cookies: "INVALID_OR_EXPIRED_COOKIES" });
        console.log("This should not be reached - Invalid Cookies Example.");
    } catch (error) {
        console.error("Expected Error (Client Initialization Failed):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
