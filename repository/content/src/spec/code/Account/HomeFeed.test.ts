import { env } from "node:process";
import YouTubeDLX from "../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "HomeFeed: (1): Fetch home feed with only the cookies");
    YouTubeDLX.Account.HomeFeed({ cookies: env.YouTubeDLX_COOKIES as string })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "HomeFeed: (2): Fetch home feed with cookies and verbose output enabled");
    YouTubeDLX.Account.HomeFeed({ cookies: env.YouTubeDLX_COOKIES as string, verbose: true })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "HomeFeed: (3): Fetch home feed with cookies and sorting by 'oldest'");
    YouTubeDLX.Account.HomeFeed({ cookies: env.YouTubeDLX_COOKIES as string, sort: "oldest" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "HomeFeed: (4): Fetch home feed with cookies and sorting by 'newest'");
    YouTubeDLX.Account.HomeFeed({ cookies: env.YouTubeDLX_COOKIES as string, sort: "newest" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "HomeFeed: (5): Fetch home feed with cookies and sorting by 'old-to-new'");
    YouTubeDLX.Account.HomeFeed({ cookies: env.YouTubeDLX_COOKIES as string, sort: "old-to-new" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "HomeFeed: (6): Fetch home feed with cookies and sorting by 'new-to-old'");
    YouTubeDLX.Account.HomeFeed({ cookies: env.YouTubeDLX_COOKIES as string, sort: "new-to-old" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
    console.log(colors.bold.blue("@info"), "HomeFeed: (7): Fetch home feed with all parameters");
    YouTubeDLX.Account.HomeFeed({ cookies: env.YouTubeDLX_COOKIES as string, verbose: true, sort: "new-to-old" })
        .on("data", data => console.log(colors.italic.green("@data:"), data))
        .on("error", error => console.error(colors.italic.red("@error:"), error));
})();
