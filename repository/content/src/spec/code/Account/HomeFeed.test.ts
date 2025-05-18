import { env } from "node:process";
import YouTubeDLX from "../../../";
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
        console.log("--- Running Basic Home Feed Fetch ---");
        const result = await YouTubeDLX.Account.HomeFeed({ cookies });
        console.log("Home Feed:", result.data);
    } catch (error) {
        console.error("Basic Home Feed Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Home Feed with Verbose Logging ---");
        const result = await YouTubeDLX.Account.HomeFeed({ cookies, verbose: true });
        console.log("Home Feed (Verbose):", result.data);
    } catch (error) {
        console.error("Home Feed with Verbose Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Home Feed Sorted by Oldest ---");
        const result = await YouTubeDLX.Account.HomeFeed({ cookies, sort: "oldest" });
        console.log("Oldest Feed Items:", result.data);
    } catch (error) {
        console.error("Home Feed Sorted by Oldest Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Home Feed Sorted by Newest ---");
        const result = await YouTubeDLX.Account.HomeFeed({ cookies, sort: "newest" });
        console.log("Newest Feed Items:", result.data);
    } catch (error) {
        console.error("Home Feed Sorted by Newest Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Home Feed Sorted Old to New ---");
        const result = await YouTubeDLX.Account.HomeFeed({ cookies, sort: "old-to-new" });
        console.log("Home Feed (Old to New by ID):", result.data);
    } catch (error) {
        console.error("Home Feed Sorted Old to New Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Home Feed Sorted New to Old ---");
        const result = await YouTubeDLX.Account.HomeFeed({ cookies, sort: "new-to-old" });
        console.log("Home Feed (New to Old by ID):", result.data);
    } catch (error) {
        console.error("Home Feed Sorted New to Old Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Home Feed with Verbose and Oldest Sort ---");
        const result = await YouTubeDLX.Account.HomeFeed({ cookies, verbose: true, sort: "oldest" });
        console.log("Oldest Feed Items (Verbose):", result.data);
    } catch (error) {
        console.error("Home Feed with Verbose and Oldest Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Home Feed with Verbose and Newest Sort ---");
        const result = await YouTubeDLX.Account.HomeFeed({ cookies, verbose: true, sort: "newest" });
        console.log("Newest Feed Items (Verbose):", result.data);
    } catch (error) {
        console.error("Home Feed with Verbose and Newest Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Home Feed with Verbose and Old to New Sort ---");
        const result = await YouTubeDLX.Account.HomeFeed({ cookies, verbose: true, sort: "old-to-new" });
        console.log("Home Feed (Old to New by ID, Verbose):", result.data);
    } catch (error) {
        console.error("Home Feed with Verbose and Old to New Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Home Feed with Verbose and New to Old Sort ---");
        const result = await YouTubeDLX.Account.HomeFeed({ cookies, verbose: true, sort: "new-to-old" });
        console.log("Home Feed (New to Old by ID, Verbose):", result.data);
    } catch (error) {
        console.error("Home Feed with Verbose and New to Old Sort Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Invalid Cookies Example ---");
        const result = await YouTubeDLX.Account.HomeFeed({ cookies: "" });
        console.log("This should not be reached - Invalid Cookies Example.");
    } catch (error) {
        console.error("Expected Error (Invalid Cookies):", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Zod Validation Error Example (Missing Cookies) ---");
        await YouTubeDLX.Account.HomeFeed({} as any);
        console.log("This should not be reached - Zod Validation Error Example.");
    } catch (error) {
        console.error("Expected Zod Error (Missing Cookies):", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Zod Validation Error Example (Invalid Sort) ---");
        await YouTubeDLX.Account.HomeFeed({ cookies, sort: "invalid-sort" as any });
        console.log("This should not be reached - Zod Validation Error Example.");
    } catch (error) {
        console.error("Expected Zod Error (Invalid Sort):", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Invalid Cookies Example (Client Initialization Failure) ---");
        await YouTubeDLX.Account.HomeFeed({ cookies: "INVALID_OR_EXPIRED_COOKIES" });
        console.log("This should not be reached - Invalid Cookies Example.");
    } catch (error) {
        console.error("Expected Error (Client Initialization Failed):", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    console.log("\nAll Home Feed tests finished successfully.");
})();
