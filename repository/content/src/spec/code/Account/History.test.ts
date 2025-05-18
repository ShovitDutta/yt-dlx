import watch_history from "../../../routes/Account/History";
import { env } from "node:process";
import * as vitest from "vitest";
import dotenv from "dotenv";
dotenv.config();
vitest.describe("watch_history", () => {
    const cookies = env.YouTubeDLX_COOKIES as string;
    if (!cookies) {
        console.warn("YouTubeDLX_COOKIES environment variable not set. Watch history tests requiring valid cookies will likely fail.");
    }
    const mockCookies = cookies || "dummy_cookies_for_tests";
    vitest.it("should handle basic watch history fetch", async () => {
        if (!cookies) {
            console.warn("Skipping basic fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies });
        vitest.expect(result).toHaveProperty("status");
        vitest.expect(result.status).toBe("success");
        vitest.expect(result).toHaveProperty("data");
        vitest.expect(result.data).toHaveProperty("Shorts");
        vitest.expect(result.data).toHaveProperty("Videos");
        vitest.expect(Array.isArray(result.data?.Shorts)).toBe(true);
        vitest.expect(Array.isArray(result.data?.Videos)).toBe(true);
    });
    vitest.it("should handle watch history fetch with verbose logging", async () => {
        if (!cookies) {
            console.warn("Skipping verbose fetch test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, verbose: true });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle watch history sorted by oldest", async () => {
        if (!cookies) {
            console.warn("Skipping oldest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, sort: "oldest" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle watch history sorted by newest", async () => {
        if (!cookies) {
            console.warn("Skipping newest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, sort: "newest" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle watch history sorted old to new", async () => {
        if (!cookies) {
            console.warn("Skipping old-to-new sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, sort: "old-to-new" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle watch history sorted new to old", async () => {
        if (!cookies) {
            console.warn("Skipping new-to-old sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, sort: "new-to-old" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle watch history with verbose and oldest sort", async () => {
        if (!cookies) {
            console.warn("Skipping verbose and oldest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, verbose: true, sort: "oldest" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle watch history with verbose and newest sort", async () => {
        if (!cookies) {
            console.warn("Skipping verbose and newest sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, verbose: true, sort: "newest" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle watch history with verbose and old to new sort", async () => {
        if (!cookies) {
            console.warn("Skipping verbose and old-to-new sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, verbose: true, sort: "old-to-new" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should handle watch history with verbose and new to old sort", async () => {
        if (!cookies) {
            console.warn("Skipping verbose and new-to-old sort test due to missing YouTubeDLX_COOKIES.");
            return;
        }
        const result = await watch_history({ cookies: mockCookies, verbose: true, sort: "new-to-old" });
        vitest.expect(result.status).toBe("success");
        vitest.expect(result.data).toBeInstanceOf(Object);
    });
    vitest.it("should throw error for missing cookies (handled by explicit check)", async () => {
        await vitest.expect(watch_history({ cookies: "" })).rejects.toThrowError(/Cookies not provided!/);
    });
    vitest.it("should throw Zod error for missing cookies (handled by ZodSchema)", async () => {
        await vitest.expect(watch_history({} as any)).rejects.toThrowError(/cookies.*Required/);
    });
    vitest.it("should throw Zod error for invalid sort", async () => {
        await vitest.expect(watch_history({ cookies: mockCookies, sort: "invalid-sort" as any })).rejects.toThrowError(/sort.*invalid enum value/);
    });
});
