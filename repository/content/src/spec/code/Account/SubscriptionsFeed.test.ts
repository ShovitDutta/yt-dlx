import { env } from "node:process";
import YouTubeDLX from "../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
function fetchSubscriptionsFeed(options: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const stream = YouTubeDLX.Account.SubscriptionsFeed(options);
        stream
            .on("data", data => {
                console.log(colors.italic.green("@data:"), data);
            })
            .on("error", error => {
                console.error(colors.italic.red("@error:"), error);
                reject(error);
            })
            .on("end", () => {
                resolve();
            });
    });
}
(async () => {
    if (!env.YouTubeDLX_COOKIES) {
        console.error(colors.red("Error: YouTubeDLX_COOKIES environment variable is not set. Please set it in your .env file or environment."));
        process.exit(1);
    }
    const cookies = env.YouTubeDLX_COOKIES as string;
    const testCases = [
        { label: "1", options: { cookies } },
        { label: "2", options: { cookies, verbose: true } },
    ];
    for (const testCase of testCases) {
        try {
            console.log(colors.bold.blue("@info"), `SubscriptionsFeed: (${testCase.label}): Fetch subscriptions feed`);
            await fetchSubscriptionsFeed(testCase.options);
        } catch (error) {
            console.error(colors.red("@error:"), `Test case (${testCase.label}) failed:`, error);
        }
    }
})();
