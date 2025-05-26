import watch_history from "../../../routes/Account/History";
import { env } from "node:process";
import * as vitest from "vitest";
import dotenv from "dotenv";
dotenv.config();
vitest.describe("watch_history", () => {
    const Cookies = env.YouTubeDLX_COOKIES as string;
    if (!Cookies) console.warn("YouTubeDLX_COOKIES environment variable not set. Watch history tests requiring valid cookies will likely fail.");
    const mockCookies = Cookies || "dummy_cookies_for_tests";
    vitest.it("should handle basic watch history fetch", async () => {
        if (!Cookies) {
            console.warn("Skipping basic fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ Cookies: mockCookies });
        vitest.expect(result).toHaveProperty("status");
        vitest.expect(result.status).toBe("success");
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toHaveProperty("Shorts");
        vitest.expect(result.data).toHaveProperty("Videos");
        vitest.expect(Array.isArray(result.data?.Shorts)).toBe(true);
        vitest.expect(Array.isArray(result.data?.Videos)).toBe(true);
        if (result.data) {
            vitest.expect(result.data.Shorts.length).toBeGreaterThanOrEqual(0);
            vitest.expect(result.data.Videos.length).toBeGreaterThanOrEqual(0);
        }
    });
    vitest.it("should handle watch history fetch with Verbose logging", async () => {
        if (!Cookies) {
            console.warn("Skipping Verbose fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ Cookies: mockCookies, Verbose: true });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle watch history sorted by oldest", async () => {
        if (!Cookies) {
            console.warn("Skipping oldest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ Cookies: mockCookies, Sort: "oldest" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle watch history sorted by newest", async () => {
        if (!Cookies) {
            console.warn("Skipping newest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ Cookies: mockCookies, Sort: "newest" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle watch history with Verbose and oldest sort", async () => {
        if (!Cookies) {
            console.warn("Skipping Verbose and oldest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ Cookies: mockCookies, Verbose: true, Sort: "oldest" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle watch history with Verbose and newest sort", async () => {
        if (!Cookies) {
            console.warn("Skipping Verbose and newest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ Cookies: mockCookies, Verbose: true, Sort: "newest" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
});
