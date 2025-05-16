import { env } from "node:process";
import YouTubeDLX from "../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
function fetchHomeFeed(options: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const stream = YouTubeDLX.Account.HomeFeed(options);
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
        { label: "3", options: { cookies, sort: "oldest" } },
        { label: "4", options: { cookies, sort: "newest" } },
        { label: "5", options: { cookies, sort: "old-to-new" } },
        { label: "6", options: { cookies, sort: "new-to-old" } },
        { label: "7", options: { cookies, verbose: true, sort: "new-to-old" } },
    ];
    for (const testCase of testCases) {
        try {
            console.log(colors.bold.blue("@info"), `HomeFeed: (${testCase.label}): Fetch home feed`);
            await fetchHomeFeed(testCase.options);
        } catch (error) {
            console.error(colors.red("@error:"), `Test case (${testCase.label}) failed:`, error);
        }
    }
})();
