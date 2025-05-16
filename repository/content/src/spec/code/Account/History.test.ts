import { env } from "node:process";
import YouTubeDLX from "../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "WatchHistory: (1): Fetch watch history with only the cookies");
    YouTubeDLX.Account.History({ cookies: env.YouTubeDLX_COOKIES as string })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "WatchHistory: (2): Fetch watch history with cookies and verbose output enabled");
    YouTubeDLX.Account.History({ cookies: env.YouTubeDLX_COOKIES as string, verbose: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "WatchHistory: (3): Fetch watch history with cookies and sorting by 'oldest'");
    YouTubeDLX.Account.History({ cookies: env.YouTubeDLX_COOKIES as string, sort: "oldest" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "WatchHistory: (4): Fetch watch history with cookies and sorting by 'newest'");
    YouTubeDLX.Account.History({ cookies: env.YouTubeDLX_COOKIES as string, sort: "newest" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "WatchHistory: (5 Berth): Fetch watch history with cookies and sorting by 'old-to-new'");
    YouTubeDLX.Account.History({ cookies: env.YouTubeDLX_COOKIES as string, sort: "old-to-new" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "WatchHistory: (6): Fetch watch history with cookies and sorting by 'new-to-old'");
    YouTubeDLX.Account.History({ cookies: env.YouTubeDLX_COOKIES as string, sort: "new-to-old" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "WatchHistory: (7): Fetch watch history with all parameters");
    YouTubeDLX.Account.History({ cookies: env.YouTubeDLX_COOKIES as string, verbose: true, sort: "new-to-old" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
