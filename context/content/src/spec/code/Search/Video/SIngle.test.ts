import videoData from "../../../../routes/Search/Video/Single";
import * as vitest from "vitest";
vitest.describe("videoData", () => {
    const rawVideoId = "dQw4w9WgXcQ";
    const invalidVideoLink = "this is not a youtube link";
    const shortenedVideoLink = "https://youtu.be/dQw4w9WgXcQ";
    const validVideoLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const nonexistentVideoLink = "https://www.youtube.com/watch?v=nonexistentvideoid123";
    vitest.it("should handle basic video data fetch with standard link", async () => {
        try {
            const result = await videoData({ VideoLink: validVideoLink });
            vitest.expect(result).toHaveProperty("id");
            if (result) {
                vitest.expect(typeof result.id).toBe("string");
                vitest.expect(result).toHaveProperty("title");
                vitest.expect(typeof result.title).toBe("string");
                vitest.expect(result).toHaveProperty("duration");
                vitest.expect(typeof result.duration).toBe("number");
                vitest.expect(result).toHaveProperty("viewCount");
                vitest.expect(typeof result.viewCount).toBe("number");
                vitest.expect(result).toHaveProperty("channelid");
                vitest.expect(typeof result.channelid).toBe("string");
                vitest.expect(result).toHaveProperty("channelname");
                vitest.expect(typeof result.channelname).toBe("string");
            }
        } catch (error) {
            console.warn("Basic video data fetch failed for " + validVideoLink + ". This might require a real video link. " + error);
            throw error;
        }
    });
    vitest.it("should handle video data fetch with shortened link", async () => {
        try {
            const result = await videoData({ VideoLink: shortenedVideoLink });
            vitest.expect(result).toHaveProperty("id");
            if (result) {
                vitest.expect(typeof result.id).toBe("string");
                vitest.expect(result).toHaveProperty("title");
                vitest.expect(typeof result.title).toBe("string");
                vitest.expect(result).toHaveProperty("duration");
                vitest.expect(typeof result.duration).toBe("number");
            }
        } catch (error) {
            console.warn("Video data fetch failed for " + shortenedVideoLink + ". This might require a real video link. " + error);
            throw error;
        }
    });
    vitest.it("should handle video data fetch with raw video ID", async () => {
        try {
            const result = await videoData({ VideoLink: rawVideoId });
            vitest.expect(result).toHaveProperty("id");
            if (result) {
                vitest.expect(typeof result.id).toBe("string");
                vitest.expect(result).toHaveProperty("title");
                vitest.expect(typeof result.title).toBe("string");
                vitest.expect(result).toHaveProperty("duration");
                vitest.expect(typeof result.duration).toBe("number");
            }
        } catch (error) {
            console.warn("Video data fetch failed for " + rawVideoId + ". This might require a real video ID. " + error);
            throw error;
        }
    });
});
