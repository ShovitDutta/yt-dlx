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
    // const respEngine = await YouTubeDLX.Misc.Video.Extract({ query: "https://www.youtube.com/watch?v=s49rbh8xXKI" });
    // fs.writeFileSync("Engine.json", JSON.stringify(respEngine, null, 2));
    // console.log("Completed quick test with YouTubeDLX!");
    const paths = await locator();
    const ytDlxPath = paths["yt-dlx"];

    const response_HDR = await execPromise(`"${ytDlxPath}" --ytprobe --dump-single-json "https://www.youtube.com/watch?v=s49rbh8xXKI"`);
    fs.writeFileSync("json/response_HDR.json", response_HDR.stdout);
    console.log("json/response_HDR.json written successfully!");

    const response_Chapter = await execPromise(`"${ytDlxPath}" --ytprobe --dump-single-json "http://www.youtube.com/watch?v=WvPOshC74Og"`);
    fs.writeFileSync("json/response_Chapter.json", response_Chapter.stdout);
    console.log("json/response_Chapter.json written successfully!");

    const response_Subtitle = await execPromise(`"${ytDlxPath}" --ytprobe --dump-single-json "http://www.youtube.com/watch?v=tgeyH3ADN5w"`);
    fs.writeFileSync("json/response_Subtitle.json", response_Subtitle.stdout);
    console.log("json/response_Subtitle.json written successfully!");

    const response_Caption = await execPromise(`"${ytDlxPath}" --ytprobe --dump-single-json "http://www.youtube.com/watch?v=BaaePKNyod0"`);
    fs.writeFileSync("json/response_Caption.json", response_Caption.stdout);
    console.log("json/response_Caption.json written successfully!");
})().catch(console.error);
