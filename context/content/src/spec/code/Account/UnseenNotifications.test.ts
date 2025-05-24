import unseen_notifications from "../../../routes/Account/UnseenNotifications";
import { env } from "node:process";
import * as vitest from "vitest";
import dotenv from "dotenv";
dotenv.config();
vitest.describe("unseen_notifications", () => {
    const Cookies = env.YouTubeDLX_COOKIES as string;
    if (!Cookies) console.warn("YouTubeDLX_COOKIES environment variable not set. Unseen notifications tests requiring valid cookies will likely fail.");
    const mockCookies = Cookies || "dummy_cookies_for_tests";
    vitest.it("should handle basic unseen notifications fetch", async () => {
        if (!Cookies) {
            console.warn("Skipping basic fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await unseen_notifications({ Cookies: mockCookies });
        vitest.expect(result).toHaveProperty("status");
        vitest.expect(result.status).toBe("success");
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toHaveProperty("count");
        if (result.data) {
            vitest.expect(typeof result.data?.count).toBe("number");
            vitest.expect(result.data.count).toBeGreaterThanOrEqual(0);
        }
    });
    vitest.it("should handle unseen notifications fetch with Verbose logging", async () => {
        if (!Cookies) {
            console.warn("Skipping Verbose fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await unseen_notifications({ Cookies: mockCookies, Verbose: true });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
        if (result.data) {
            vitest.expect(typeof result.data?.count).toBe("number");
            vitest.expect(result.data.count).toBeGreaterThanOrEqual(0);
        }
    });
});
