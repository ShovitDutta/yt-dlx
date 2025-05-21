import dotenv from "dotenv";
import YouTubeDLX from "..";
import fs from "fs";
dotenv.config();
console.clear();

(async () => {
    const result = await YouTubeDLX.Misc.Video.Extract({ query: "https://www.youtube.com/watch?v=fp7bbq813Jc" });
    fs.writeFileSync("quick.json", JSON.stringify(result, null, 2));

})