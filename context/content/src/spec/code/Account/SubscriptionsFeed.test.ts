import subscriptions_feed from "../../../routes/Account/SubscriptionsFeed";
import { env } from "node:process";
import * as vitest from "vitest";
import dotenv from "dotenv";
dotenv.config();
vitest.describe("subscriptions_feed", () => {
    const Cookies = env.YouTubeDLX_COOKIES as string;
    if (!Cookies) console.warn("YouTubeDLX_COOKIES environment variable not set. Subscriptions feed tests requiring valid cookies will likely fail.");
    const mockCookies = Cookies || "dummy_cookies_for_tests";
    vitest.it("should handle basic subscriptions feed fetch", async () => {
        if (!Cookies) {
            console.warn("Skipping basic fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await subscriptions_feed({ Cookies: mockCookies });
        vitest.expect(result).toHaveProperty("status");
        vitest.expect(result.status).toBe("success");
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toHaveProperty("contents");
        vitest.expect(Array.isArray(result.data?.contents)).toBe(true);
        if (result.data) vitest.expect(result.data.contents.length).toBeGreaterThanOrEqual(0);
    });
    vitest.it("should handle subscriptions feed fetch with Verbose logging", async () => {
        if (!Cookies) {
            console.warn("Skipping Verbose fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await subscriptions_feed({ Cookies: mockCookies, Verbose: true });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
});
