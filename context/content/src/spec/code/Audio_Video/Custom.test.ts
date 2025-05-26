import AudioVideoCustom from "../../../routes/Audio_Video/Custom";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
import { EngineOutput } from "../../../interfaces/EngineOutput";

vitest.describe("AudioVideoCustom", () => {
    const Query = "https://www.youtube.com/watch?v=30LWjhZzg50"; // Replace with a suitable test query

    vitest.it("should handle basic download", async () => {
        const result = await AudioVideoCustom({ Query, AudioLanguage: "Default," });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.mkv$/);
        }
    });

    vitest.it("should handle download with custom AudioFormatId and VideoFormatId", async () => {
        const result = await AudioVideoCustom({ Query, AudioFormatId: "234", VideoFormatId: "137" });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.mkv$/);
        }
    });

    vitest.it("should handle download with custom AudioBitrate and VideoResolution", async () => {
        const result = await AudioVideoCustom({ Query, AudioBitrate: 195, VideoResolution: "1280x720" });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.mkv$/);
        }
    });

    vitest.it("should handle download with custom VideoFPS and AudioLanguage", async () => {
        const result = await AudioVideoCustom({ Query, VideoFPS: 30, AudioLanguage: "English" });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.mkv$/);
        }
    });

    vitest.it("should handle download with Output and Filter", async () => {
        const result = await AudioVideoCustom({ Query, Output: "Output", Filter: "grayscale" });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.mkv$/);
        }
    });

    vitest.it("should handle download with all options", async () => {
        const result = await AudioVideoCustom({ Query, Output: "Output", UseTor: false, Verbose: true, Filter: "rotate90", ShowProgress: true, AudioBitrate: 195, VideoResolution: "854x480" });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.mkv$/);
        }
    });

    vitest.it("should fetch metadata only", async () => {
        const result = await AudioVideoCustom({ Query, MetaData: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toBeInstanceOf(Object);
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });

    vitest.it("should fetch metadata with Tor and Verbose", async () => {
        const result = await AudioVideoCustom({ Query, MetaData: true, UseTor: false, Verbose: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });

    vitest.it("should handle basic Stream", async () => {
        const result = await AudioVideoCustom({ Query, Stream: true });
        vitest.expect(result).toHaveProperty("Stream");
        vitest.expect(result).toHaveProperty("FileName");
        if (result && "Stream" in result && result.FileName) {
            vitest.expect((result as { Stream: Readable }).Stream).toBeInstanceOf(Readable);
            const outputStream = createWriteStream(result.FileName);
            (result as { Stream: Readable }).Stream?.pipe(outputStream);
            await new Promise(resolve => {
                (result as { Stream: Readable }).Stream?.on("end", resolve);
            });
        }
    });

    vitest.it("should handle Stream with custom AudioFormatId, VideoResolution, and Filter", async () => {
        // Note: Replace with valid format ID and resolution for the test query
        const result = await AudioVideoCustom({ Query, Stream: true, AudioFormatId: "251", VideoResolution: "720p", Filter: "flipHorizontal" });
        vitest.expect(result).toHaveProperty("Stream");
        vitest.expect(result).toHaveProperty("FileName");
        if (result && "Stream" in result && result.FileName) {
            vitest.expect((result as { Stream: Readable }).Stream).toBeInstanceOf(Readable);
            const outputStream = createWriteStream(result.FileName);
            (result as { Stream: Readable }).Stream?.pipe(outputStream);
            await new Promise(resolve => {
                (result as { Stream: Readable }).Stream?.on("end", resolve);
            });
        }
    });

    vitest.it("should handle Stream with all options", async () => {
        const result = await AudioVideoCustom({ Query, Stream: true, UseTor: false, Verbose: true, Filter: "flipVertical", ShowProgress: true, AudioBitrate: 64, VideoFPS: 30 });
        vitest.expect(result).toHaveProperty("Stream");
        vitest.expect(result).toHaveProperty("FileName");
        if (result && "Stream" in result) {
            vitest.expect((result as { Stream: Readable }).Stream).toBeInstanceOf(Readable);
        }
        if ("FileName" in result) {
            const outputStream = createWriteStream(result.FileName);
            (result as { Stream: Readable }).Stream?.pipe(outputStream);
            await new Promise(resolve => {
                (result as { Stream: Readable })?.Stream?.on("end", resolve);
            });
        }
    });
});
