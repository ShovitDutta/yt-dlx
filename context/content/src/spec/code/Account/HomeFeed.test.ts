import home_feed from "../../../routes/Account/HomeFeed";
import { env } from "node:process";
import * as vitest from "vitest";
import dotenv from "dotenv";
dotenv.config();
vitest.describe("home_feed", () => {
    const Cookies = env.YouTubeDLX_COOKIES as string;
    if (!Cookies) console.warn("YouTubeDLX_COOKIES environment variable not set. Home feed tests requiring valid cookies will likely fail.");
    const mockCookies = Cookies || "dummy_cookies_for_tests";
    vitest.it("should handle basic home feed fetch", async () => {
        if (!Cookies) {
            console.warn("Skipping basic fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ Cookies: mockCookies });
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
    vitest.it("should handle home feed fetch with Verbose logging", async () => {
        if (!Cookies) {
            console.warn("Skipping Verbose fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ Cookies: mockCookies, Verbose: true });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle home feed sorted by oldest", async () => {
        if (!Cookies) {
            console.warn("Skipping oldest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ Cookies: mockCookies, Sort: "oldest" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle home feed sorted by newest", async () => {
        if (!Cookies) {
            console.warn("Skipping newest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ Cookies: mockCookies, Sort: "newest" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle home feed sorted old to new", async () => {
        if (!Cookies) {
            console.warn("Skipping old-to-new sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ Cookies: mockCookies, Sort: "old-to-new" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle home feed sorted new to old", async () => {
        if (!Cookies) {
            console.warn("Skipping new-to-old sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ Cookies: mockCookies, Sort: "new-to-old" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle home feed with Verbose and oldest sort", async () => {
        if (!Cookies) {
            console.warn("Skipping Verbose and oldest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ Cookies: mockCookies, Verbose: true, Sort: "oldest" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle home feed with Verbose and newest sort", async () => {
        if (!Cookies) {
            console.warn("Skipping Verbose and newest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ Cookies: mockCookies, Verbose: true, Sort: "newest" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle home feed with Verbose and old to new sort", async () => {
        if (!Cookies) {
            console.warn("Skipping Verbose and old-to-new sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ Cookies: mockCookies, Verbose: true, Sort: "old-to-new" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle home feed with Verbose and new to old sort", async () => {
        if (!Cookies) {
            console.warn("Skipping Verbose and new-to-old sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await home_feed({ Cookies: mockCookies, Verbose: true, Sort: "new-to-old" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
});
