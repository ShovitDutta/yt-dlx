import extract from "../routes/Misc/Video/Extract";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
console.clear();

async function quickSpec() {
    const query = "https://www.youtube.com/watch?v=fp7bbq813Jc";
    try {
        const result = await extract({ query });
        fs.writeFileSync("quick.json", JSON.stringify(result, null, 2));
        console.log("Extracted data and saved to quick.json");
    } catch (error) {
        console.error("Failed to extract video data", error);
    }
}

quickSpec();
