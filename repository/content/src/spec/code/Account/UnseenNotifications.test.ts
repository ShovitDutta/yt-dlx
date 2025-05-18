import unseen_notifications from "../../../routes/Account/UnseenNotifications";
import { env } from "node:process";
import * as vitest from "vitest";
import dotenv from "dotenv";
dotenv.config();
vitest.describe("unseen_notifications", () => {
    const cookies = env.YouTubeDLX_COOKIES as string;
    if (!cookies) {
        console.warn("YouTubeDLX_COOKIES environment variable not set. Unseen notifications tests requiring valid cookies will likely fail.");
    }
    const mockCookies = cookies || "dummy_cookies_for_tests";
    vitest.it("should handle basic unseen notifications fetch", async () => {
        if (!cookies) {
            console.warn("Skipping basic fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await unseen_notifications({ cookies: mockCookies });
        vitest.expect(result).toHaveProperty("status");
        vitest.expect(result.status).toBe("success");
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toHaveProperty("count");
        vitest.expect(typeof result.data?.count).toBe("number");
    });
    vitest.it("should handle unseen notifications fetch with verbose logging", async () => {
        if (!cookies) {
            console.warn("Skipping verbose fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await unseen_notifications({ cookies: mockCookies, verbose: true });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
        vitest.expect(typeof result.data?.count).toBe("number");
    });
    vitest.it("should throw error for missing cookies (handled by explicit check)", async () => {
        await vitest.expect(unseen_notifications({ cookies: "" })).rejects.toThrowError(/Cookies not provided!/);
    });
    vitest.it("should throw Zod error for missing cookies (handled by ZodSchema)", async () => {
        await vitest.expect(unseen_notifications({} as any)).rejects.toThrowError(/cookies.*Required/);
    });
});
