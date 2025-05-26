import help from "../../../../routes/Misc/System/Help";
import * as vitest from "vitest";

vitest.describe("Help", () => {
    vitest.it("should return a help message", async () => {
        const result = await help();
        vitest.expect(result).toBeTypeOf("string");
        vitest.expect(result).toContain("https://yt-dlx.vercel.app");
    });
});
