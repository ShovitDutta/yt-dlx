import extract from "../src/routes/Misc/Video/Extract";
import fs from "fs";
import dotenv from "dotenv";
import * as vitest from "vitest";
dotenv.config();
console.clear();

vitest.it("should extract video data and save to json", async () => {
    const query = "https://www.youtube.com/watch?v=fp7bbq813Jc";
    try {
        const result = await extract({ query });
        fs.writeFileSync("quick.json", JSON.stringify(result, null, 2));
        vitest.expect(result).toHaveProperty("data");
    } catch (error) {
        console.error("Failed to extract video data", error);
        throw error;
    }
});
