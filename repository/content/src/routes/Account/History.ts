import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
import sanitizeContentItem from "../../utils/sanitizeContentItem";
const ZodSchema = z.object({ cookies: z.string(), verbose: z.boolean().optional(), sort: z.enum(["oldest", "newest", "old-to-new", "new-to-old"]).optional() });
type WatchHistoryOptions = z.infer<typeof ZodSchema>;
export default async function watch_history(options: WatchHistoryOptions): Promise<{ data: TubeResponse<{ Shorts: any[]; Videos: any[] }> }> {
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
        const result: TubeResponse<{ Shorts: any[]; Videos: any[] }> = { status: "success", data: { Shorts: [], Videos: [] } };
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
        console.log("--- Running Basic Watch History Fetch ---");
        const result = await watch_history({ cookies });
        console.log("Watch History:", result.data);
    } catch (error) {
        console.error("Basic Watch History Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History with Verbose Logging ---");
        const result = await watch_history({ cookies, verbose: true });
        console.log("Watch History (Verbose):", result.data);
    } catch (error) {
        console.error("Watch History with Verbose Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History Sorted by Oldest ---");
        const result = await watch_history({ cookies, sort: "oldest" });
        console.log("Oldest Watched:", result.data);
    } catch (error) {
        console.error("Watch History Sorted by Oldest Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History Sorted by Newest ---");
        const result = await watch_history({ cookies, sort: "newest" });
        console.log("Newest Watched:", result.data);
    } catch (error) {
        console.error("Watch History Sorted by Newest Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History Sorted Old to New ---");
        const result = await watch_history({ cookies, sort: "old-to-new" });
        console.log("Watch History (Old to New):", result.data);
    } catch (error) {
        console.error("Watch History Sorted Old to New Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History Sorted New to Old ---");
        const result = await watch_history({ cookies, sort: "new-to-old" });
        console.log("Watch History (New to Old):", result.data);
    } catch (error) {
        console.error("Watch History Sorted New to Old Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History with Verbose and Oldest Sort ---");
        const result = await watch_history({ cookies, verbose: true, sort: "oldest" });
        console.log("Oldest Watched (Verbose):", result.data);
    } catch (error) {
        console.error("Watch History with Verbose and Oldest Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History with Verbose and Newest Sort ---");
        const result = await watch_history({ cookies, verbose: true, sort: "newest" });
        console.log("Newest Watched (Verbose):", result.data);
    } catch (error) {
        console.error("Watch History with Verbose and Newest Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History with Verbose and Old to New Sort ---");
        const result = await watch_history({ cookies, verbose: true, sort: "old-to-new" });
        console.log("Watch History (Old to New, Verbose):", result.data);
    } catch (error) {
        console.error("Watch History with Verbose and Old to New Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Watch History with Verbose and New to Old Sort ---");
        const result = await watch_history({ cookies, verbose: true, sort: "new-to-old" });
        console.log("Watch History (New to Old, Verbose):", result.data);
    } catch (error) {
        console.error("Watch History with Verbose and New to Old Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Invalid Cookies Example ---");
        const result = await watch_history({ cookies: "" });
        console.log("This should not be reached - Invalid Cookies Example.");
    } catch (error) {
        console.error("Expected Error (Invalid Cookies):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Zod Validation Error Example (Missing Cookies) ---");
        await watch_history({} as any);
        console.log("This should not be reached - Zod Validation Error Example.");
    } catch (error) {
        console.error("Expected Zod Error (Missing Cookies):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
    try {
        console.log("--- Running Zod Validation Error Example (Invalid Sort) ---");
        await watch_history({ cookies, sort: "invalid-sort" as any });
        console.log("This should not be reached - Zod Validation Error Example.");
    } catch (error) {
        console.error("Expected Zod Error (Invalid Sort):", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
