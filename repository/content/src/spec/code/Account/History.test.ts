import { env } from "node:process";
import YouTubeDLX from "../../..";
import dotenv from "dotenv";
import colors from "colors";

dotenv.config();
console.clear();

(async () => {
    const cookies = env.YouTubeDLX_COOKIES as string;

    if (!cookies) {
        console.error(colors.red("Error: YouTubeDLX_COOKIES environment variable is not set. Please set it in your .env file or environment."));
        process.exit(1);
    }

    try {
        console.log("--- Running Basic Watch History Fetch ---");
        const result = await YouTubeDLX.Account.History({ cookies });
        console.log("Watch History:", result.data);
    } catch (error) {
        console.error("Basic Watch History Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Watch History with Verbose Logging ---");
        const result = await YouTubeDLX.Account.History({ cookies, verbose: true });
        console.log("Watch History (Verbose):", result.data);
    } catch (error) {
        console.error("Watch History with Verbose Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Watch History Sorted by Oldest ---");
        const result = await YouTubeDLX.Account.History({ cookies, sort: "oldest" });
        console.log("Oldest Watched:", result.data);
    } catch (error) {
        console.error("Watch History Sorted by Oldest Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Watch History Sorted by Newest ---");
        const result = await YouTubeDLX.Account.History({ cookies, sort: "newest" });
        console.log("Newest Watched:", result.data);
    } catch (error) {
        console.error("Watch History Sorted by Newest Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Watch History Sorted Old to New ---");
        const result = await YouTubeDLX.Account.History({ cookies, sort: "old-to-new" });
        console.log("Watch History (Old to New):", result.data);
    } catch (error) {
        console.error("Watch History Sorted Old to New Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Watch History Sorted New to Old ---");
        const result = await YouTubeDLX.Account.History({ cookies, sort: "new-to-old" });
        console.log("Watch History (New to Old):", result.data);
    } catch (error) {
        console.error("Watch History Sorted New to Old Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Watch History with Verbose and Oldest Sort ---");
        const result = await YouTubeDLX.Account.History({ cookies, verbose: true, sort: "oldest" });
        console.log("Oldest Watched (Verbose):", result.data);
    } catch (error) {
        console.error("Watch History with Verbose and Oldest Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Watch History with Verbose and Newest Sort ---");
        const result = await YouTubeDLX.Account.History({ cookies, verbose: true, sort: "newest" });
        console.log("Newest Watched (Verbose):", result.data);
    } catch (error) {
        console.error("Watch History with Verbose and Newest Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Watch History with Verbose and Old to New Sort ---");
        const result = await YouTubeDLX.Account.History({ cookies, verbose: true, sort: "old-to-new" });
        console.log("Watch History (Old to New, Verbose):", result.data);
    } catch (error) {
        console.error("Watch History with Verbose and Old to New Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Watch History with Verbose and New to Old Sort ---");
        const result = await YouTubeDLX.Account.History({ cookies, verbose: true, sort: "new-to-old" });
        console.log("Watch History (New to Old, Verbose):", result.data);
    } catch (error) {
        console.error("Watch History with Verbose and New to Old Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Invalid Cookies Example ---");
        const result = await YouTubeDLX.Account.History({ cookies: "" });
        console.log("This should not be reached - Invalid Cookies Example.");
    } catch (error) {
        console.error("Expected Error (Invalid Cookies):", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Zod Validation Error Example (Missing Cookies) ---");
        await YouTubeDLX.Account.History({} as any);
        console.log("This should not be reached - Zod Validation Error Example.");
    } catch (error) {
        console.error("Expected Zod Error (Missing Cookies):", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Zod Validation Error Example (Invalid Sort) ---");
        await YouTubeDLX.Account.History({ cookies, sort: "invalid-sort" as any });
        console.log("This should not be reached - Zod Validation Error Example.");
    } catch (error) {
        console.error("Expected Zod Error (Invalid Sort):", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    console.log("\nAll History tests finished successfully.");
})();
