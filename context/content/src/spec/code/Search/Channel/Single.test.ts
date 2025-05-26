import channel_data from "../../../../routes/Search/Channel/Single";
import { Channel } from "youtubei";
import * as vitest from "vitest";
vitest.describe("channel_data", () => {
    const validChannelId = "UC-9-kyTW8ZkZNSB7LxqIENA";
    const validChannelLink = `https://www.youtube.com/channel/${validChannelId}`;
    vitest.it("should handle channel data fetch with a valid channel ID", async () => {
        try {
            const result = await channel_data({ ChannelLink: validChannelId });
            if (result) {
                vitest.expect(result).toBeInstanceOf(Channel);
                vitest.expect(result.id).toBe(validChannelId);
                vitest.expect(typeof result.name).toBe("string");
            }
        } catch (error) {
            console.warn('Channel data fetch failed for ID "' + validChannelId + '". This test requires a real, existing channel ID. ' + error);
            throw error;
        }
    });
    vitest.it("should handle channel data fetch with a valid channel link", async () => {
        try {
            const result = await channel_data({ ChannelLink: validChannelLink });
            if (result) {
                vitest.expect(result).toBeInstanceOf(Channel);
                vitest.expect(result.id).toBe(validChannelId);
                vitest.expect(typeof result.name).toBe("string");
            }
        } catch (error) {
            console.warn('Channel data fetch failed for link "' + validChannelLink + '". This test requires a real, existing channel link. ' + error);
            throw error;
        }
    });
});
