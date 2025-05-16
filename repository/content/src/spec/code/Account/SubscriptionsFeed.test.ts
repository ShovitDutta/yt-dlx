import { env } from "node:process";
import YouTubeDLX from "../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "SubscriptionsFeed: (1): Fetch subscriptions feed with only the cookies");
    YouTubeDLX.Account.SubscriptionsFeed({ cookies: env.YouTubeDLX_COOKIES as string })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "SubscriptionsFeed: (2): Fetch subscriptions feed with cookies and verbose output enabled");
    YouTubeDLX.Account.SubscriptionsFeed({ cookies: env.YouTubeDLX_COOKIES as string, verbose: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
