import * as vitest from "vitest";
import dotenv from "dotenv";
import YouTubeDLX from "..";
import fs from "fs";
dotenv.config();
console.clear();

vitest.it("should extract video data and save to json", async () => {
    const query = "https://www.youtube.com/watch?v=fp7bbq813Jc";
    try {
        const result = await YouTubeDLX.Misc.Video.Extract({ query });
        fs.writeFileSync("quick.json", JSON.stringify(result, null, 2));
        vitest.expect(result).toHaveProperty("data");
    } catch (error) {
        console.error("Failed to extract video data", error);
        throw error;
    }
});
