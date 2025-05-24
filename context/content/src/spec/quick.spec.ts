import YouTubeDLX from "..";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
console.clear();
(async () => {
    const respEngine = await YouTubeDLX.Misc.Video.Extract({ Query: "https://www.youtube.com/watch?v=s49rbh8xXKI" });
    fs.writeFileSync("Engine.json", JSON.stringify(respEngine, null, 2));
    console.log("Completed quick test with YouTubeDLX!");
})().catch(console.error);
