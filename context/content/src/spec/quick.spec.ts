import { locator } from "../utils/Locator";
import { exec } from "child_process";
import YouTubeDLX from "..";
import dotenv from "dotenv";
import util from "util";
import fs from "fs";
dotenv.config();
console.clear();
const execPromise = util.promisify(exec);
(async () => {
    const respEngine = await YouTubeDLX.Misc.Video.Extract({ query: "https://www.youtube.com/watch?v=s49rbh8xXKI" });
    fs.writeFileSync("Engine.json", JSON.stringify(respEngine, null, 2));
    console.log("Completed quick test with YouTubeDLX!");
    const paths = await locator();
    const ytDlxPath = paths["yt-dlx"];
    const Original = await execPromise(`"${ytDlxPath}" --ytprobe --dump-single-json "https://www.youtube.com/watch?v=d56mG7DezGs"`);
    fs.writeFileSync("Original.json", Original.stdout);
    console.log("Original.json written successfully!");
})().catch(console.error);
