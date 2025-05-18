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
        console.log("--- Running Basic Subscriptions Feed Example ---");
        const result = await YouTubeDLX.Account.SubscriptionsFeed({ cookies });
        console.log("Subscriptions Feed:", result);
    } catch (error) {
        console.error("Basic Subscriptions Feed Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Subscriptions Feed with Verbose Logging Example ---");
        const result = await YouTubeDLX.Account.SubscriptionsFeed({ cookies, verbose: true });
        console.log("Subscriptions Feed:", result);
    } catch (error) {
        console.error("Verbose Subscriptions Feed Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Missing Cookies Example ---");
        await YouTubeDLX.Account.SubscriptionsFeed({} as any);
        console.log("This should not be reached - Missing Cookies Example.");
    } catch (error) {
        console.error("Expected Error (Missing Cookies):", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Invalid Cookies Example ---");
        await YouTubeDLX.Account.SubscriptionsFeed({ cookies: "INVALID_OR_EXPIRED_COOKIES" });
        console.log("This should not be reached - Invalid Cookies Example.");
    } catch (error) {
        console.error("Expected Error (Client Initialization Failed):", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    console.log("\nAll Subscriptions Feed tests finished successfully.");
})();
