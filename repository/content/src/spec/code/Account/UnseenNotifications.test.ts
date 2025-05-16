import { env } from "node:process";
import YouTubeDLX from "../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "UnseenNotifications: (1): Fetch unseen notifications count with only the cookies");
    YouTubeDLX.Account.UnseenNotifications({ cookies: env.YouTubeDLX_COOKIES as string })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "UnseenNotifications: (2): Fetch unseen notifications count with cookies and verbose output enabled");
    YouTubeDLX.Account.UnseenNotifications({ cookies: env.YouTubeDLX_COOKIES as string, verbose: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
