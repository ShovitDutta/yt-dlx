import colors from "colors";
import { z, ZodError } from "zod";
import { Client } from "youtubei";
import YouTubeID from "../../../utils/YouTubeId";
const ZodSchema = z.object({ videoLink: z.string().min(2) });
export interface SingleVideoType {
    id: string;
    title: string;
    thumbnails: string[];
    uploadDate: string;
    description: string;
    duration: number;
    isLive: boolean;
    viewCount: number;
    channelid: string;
    channelname: string;
    tags: string;
    likeCount: number;
}
async function singleVideo({ videoId }: { videoId: string }): Promise<SingleVideoType> {
    try {
        const youtube = new Client();
        const singleVideoData: any = await youtube.getVideo(videoId);
        if (!singleVideoData) {
            throw new Error(`${colors.red("@error:")} Unable to fetch video data.`);
        }
        return {
            id: singleVideoData.id,
            title: singleVideoData.title,
            thumbnails: singleVideoData.thumbnails,
            uploadDate: singleVideoData.uploadDate,
            description: singleVideoData.description,
            duration: singleVideoData.duration,
            isLive: singleVideoData.isLiveContent,
            viewCount: singleVideoData.viewCount,
            channelid: singleVideoData.channel?.id,
            channelname: singleVideoData.channel?.name,
            tags: singleVideoData.tags,
            likeCount: singleVideoData.likeCount,
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
}
type VideoDataOptions = z.infer<typeof ZodSchema>;
export default async function videoData({ videoLink }: VideoDataOptions): Promise<SingleVideoType> {
    try {
        ZodSchema.parse({ videoLink });
        const vId = await YouTubeID(videoLink);
        if (!vId) {
            throw new Error(`${colors.red("@error:")} Incorrect video link provided.`);
        }
        const metaData = await singleVideo({ videoId: vId });
        return metaData;
    } catch (error: any) {
        if (error instanceof ZodError) {
            const errorMessage = `${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        } else if (error instanceof Error) {
            console.error(error.message);
            throw error;
        } else {
            const unexpectedError = `${colors.red("@error:")} An unexpected error occurred: ${String(error)}`;
            console.error(unexpectedError);
            throw new Error(unexpectedError);
        }
    } finally {
        console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
import * as vitest from "vitest";
vitest.describe("videoData", () => {
    const rawVideoId = "dQw4w9WgXcQ";
    const invalidVideoLink = "this is not a youtube link";
    const shortenedVideoLink = "https://youtu.be/dQw4w9WgXcQ";
    const validVideoLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const nonexistentVideoLink = "https://www.youtube.com/watch?v=nonexistentvideoid123";
    vitest.it("should handle basic video data fetch with standard link", async () => {
        try {
            const result = await videoData({ videoLink: validVideoLink });
            vitest.expect(result).toHaveProperty("id");
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
        } catch (error) {
            console.warn(`Basic video data fetch failed for ${validVideoLink}. This might require a real video link.`, error);
            throw error;
        }
    });
    vitest.it("should handle video data fetch with shortened link", async () => {
        try {
            const result = await videoData({ videoLink: shortenedVideoLink });
            vitest.expect(result).toHaveProperty("id");
            vitest.expect(typeof result.id).toBe("string");
            vitest.expect(result).toHaveProperty("title");
            vitest.expect(typeof result.title).toBe("string");
            vitest.expect(result).toHaveProperty("duration");
            vitest.expect(typeof result.duration).toBe("number");
        } catch (error) {
            console.warn(`Video data fetch failed for ${shortenedVideoLink}. This might require a real video link.`, error);
            throw error;
        }
    });
    vitest.it("should handle video data fetch with raw video ID", async () => {
        try {
            const result = await videoData({ videoLink: rawVideoId });
            vitest.expect(result).toHaveProperty("id");
            vitest.expect(typeof result.id).toBe("string");
            vitest.expect(result).toHaveProperty("title");
            vitest.expect(typeof result.title).toBe("string");
            vitest.expect(result).toHaveProperty("duration");
            vitest.expect(typeof result.duration).toBe("number");
        } catch (error) {
            console.warn(`Video data fetch failed for ${rawVideoId}. This might require a real video ID.`, error);
            throw error;
        }
    });
    vitest.it("should throw Zod error for missing videoLink", async () => {
        await vitest.expect(videoData({} as any)).rejects.toThrowError(/videoLink.*Required/);
    });
    vitest.it("should throw error for invalid videoLink format", async () => {
        await vitest.expect(videoData({ videoLink: invalidVideoLink })).rejects.toThrowError(/Incorrect video link provided./);
    });
    vitest.it("should throw error for a nonexistent video", async () => {
        try {
            await videoData({ videoLink: nonexistentVideoLink });
        } catch (error: any) {
            if (error instanceof Error) {
                vitest.expect(error.message).toMatch(/Unable to fetch video data./);
                return;
            }
            throw error;
        }
        throw new Error("Function did not throw expected error for a nonexistent video.");
    });
});
