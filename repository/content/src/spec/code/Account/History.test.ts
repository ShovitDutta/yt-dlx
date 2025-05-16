import { env } from "node:process";
import YouTubeDLX from "../../..";
import dotenv from "dotenv";
import colors from "colors";
dotenv.config();
console.clear();
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
(async () => {
    if (!env.YouTubeDLX_COOKIES) {
        console.error(colors.red("Error: YouTubeDLX_COOKIES environment variable is not set. Please set it in your .env file or environment."));
        process.exit(1);
    }
    const cookies = env.YouTubeDLX_COOKIES as string;
    try {
        console.log(colors.bold.blue("@info"), "WatchHistory: (1): Fetch watch history with only the cookies");
        YouTubeDLX.Account.History({ cookies })
            .on("data", data => console.log(colors.italic.green("@data:"), data))
            .on("error", error => console.error(colors.italic.red("@error:"), error));
        console.log(colors.bold.blue("@info"), "Waiting 10 seconds before next operation...");
        await sleep(10000);

        console.log(colors.bold.blue("@info"), "WatchHistory: (2): Fetch watch history with cookies and verbose output enabled");
        YouTubeDLX.Account.History({ cookies, verbose: true })
            .on("data", data => console.log(colors.italic.green("@data:"), data))
            .on("error", error => console.error(colors.italic.red("@error:"), error));
        console.log(colors.bold.blue("@info"), "Waiting 10 seconds before next operation...");
        await sleep(10000);

        console.log(colors.bold.blue("@info"), "WatchHistory: (3): Fetch watch history with cookies and sorting by 'oldest'");
        YouTubeDLX.Account.History({ cookies, sort: "oldest" })
            .on("data", data => console.log(colors.italic.green("@data:"), data))
            .on("error", error => console.error(colors.italic.red("@error:"), error));
        console.log(colors.bold.blue("@info"), "Waiting 10 seconds before next operation...");
        await sleep(10000);

        console.log(colors.bold.blue("@info"), "WatchHistory: (4): Fetch watch history with cookies and sorting by 'newest'");
        YouTubeDLX.Account.History({ cookies, sort: "newest" })
            .on("data", data => console.log(colors.italic.green("@data:"), data))
            .on("error", error => console.error(colors.italic.red("@error:"), error));
        console.log(colors.bold.blue("@info"), "Waiting 10 seconds before next operation...");
        await sleep(10000);

        console.log(colors.bold.blue("@info"), "WatchHistory: (5 Berth): Fetch watch history with cookies and sorting by 'old-to-new'");
        YouTubeDLX.Account.History({ cookies, sort: "old-to-new" })
            .on("data", data => console.log(colors.italic.green("@data:"), data))
            .on("error", error => console.error(colors.italic.red("@error:"), error));
        console.log(colors.bold.blue("@info"), "Waiting 10 seconds before next operation...");
        await sleep(10000);

        console.log(colors.bold.blue("@info"), "WatchHistory: (6): Fetch watch history with cookies and sorting by 'new-to-old'");
        YouTubeDLX.Account.History({ cookies, sort: "new-to-old" })
            .on("data", data => console.log(colors.italic.green("@data:"), data))
            .on("error", error => console.error(colors.italic.red("@error:"), error));
        console.log(colors.bold.blue("@info"), "Waiting 10 seconds before next operation...");
        await sleep(10000);

        console.log(colors.bold.blue("@info"), "WatchHistory: (7): Fetch watch history with all parameters");
        YouTubeDLX.Account.History({ cookies, verbose: true, sort: "new-to-old" })
            .on("data", data => console.log(colors.italic.green("@data:"), data))
            .on("error", error => console.error(colors.italic.red("@error:"), error));
    } catch (error) {
        console.error(colors.italic.red("@error:"), "A synchronous error occurred:", error);
        process.exit(1);
    }
})();
