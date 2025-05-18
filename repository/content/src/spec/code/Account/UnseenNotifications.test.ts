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
        console.log("--- Running Basic Unseen Notifications Fetch ---");
        const result = await YouTubeDLX.Account.UnseenNotifications({ cookies });
        console.log("Unseen Notifications Count:", result.data?.count);
    } catch (error) {
        console.error("Basic Unseen Notifications Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Unseen Notifications with Verbose Logging ---");
        const result = await YouTubeDLX.Account.UnseenNotifications({ cookies, verbose: true });
        console.log("Unseen Notifications Count (Verbose):", result.data?.count);
    } catch (error) {
        console.error("Unseen Notifications with Verbose Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Missing Cookies Error ---");
        await YouTubeDLX.Account.UnseenNotifications({} as any);
        console.log("This should not be reached - Missing Cookies Error.");
    } catch (error) {
        console.error("Expected Error (Missing Cookies):", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    try {
        console.log("--- Running Invalid Cookies Error ---");
        await YouTubeDLX.Account.UnseenNotifications({ cookies: "INVALID_OR_EXPIRED_COOKIES" });
        console.log("This should not be reached - Invalid Cookies Error.");
    } catch (error) {
        console.error("Expected Error (Client Initialization Failed):", error instanceof Error ? error.message : error);
    }
    console.log("\n");

    console.log("\nAll Unseen Notifications tests finished successfully.");
})();
