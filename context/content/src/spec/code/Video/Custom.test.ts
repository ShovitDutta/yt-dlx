import VideoCustom from "../../../routes/Video/Custom";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
import { EngineOutput } from "../../../interfaces/EngineOutput";

vitest.describe("VideoCustom", () => {
    const Query = "https://www.youtube.com/watch?v=30LWjhZzg50"; // Replace with a suitable test query

    vitest.it("should handle basic download", async () => {
        const result = await VideoCustom({ Query });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.mkv$/);
        }
    });

    vitest.it("should handle download with custom VideoFormatId", async () => {
        // Note: Replace "some_format_id" with a valid video format ID for the test query
        const result = await VideoCustom({ Query, VideoFormatId: "137" });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.mkv$/);
        }
    });

    vitest.it("should handle download with custom VideoResolution", async () => {
        // Note: Replace "1080p" with a suitable resolution for the test query
        const result = await VideoCustom({ Query, VideoResolution: "1080p" });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.mkv$/);
        }
    });

    vitest.it("should handle download with custom VideoFPS", async () => {
        // Note: Replace 60 with a suitable FPS for the test query
        const result = await VideoCustom({ Query, VideoFPS: 60 });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.mkv$/);
        }
    });

    vitest.it("should handle download with Output and Filter", async () => {
        const result = await VideoCustom({ Query, Output: "Output", Filter: "grayscale" });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.mkv$/);
        }
    });

    vitest.it("should handle download with all options", async () => {
        const result = await VideoCustom({ Query, Output: "Output", UseTor: false, Verbose: true, Filter: "rotate90", ShowProgress: true, VideoResolution: "720p" });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.mkv$/);
        }
    });

    vitest.it("should fetch metadata only", async () => {
        const result = await VideoCustom({ Query, MetaData: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toBeInstanceOf(Object);
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });

    vitest.it("should fetch metadata with Tor and Verbose", async () => {
        const result = await VideoCustom({ Query, MetaData: true, UseTor: false, Verbose: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });

    vitest.it("should handle basic Stream", async () => {
        const result = await VideoCustom({ Query, Stream: true });
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

    vitest.it("should handle Stream with custom VideoResolution and Filter", async () => {
        // Note: Replace "720p" with a suitable resolution for the test query
        const result = await VideoCustom({ Query, Stream: true, VideoResolution: "720p", Filter: "flipHorizontal" });
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
        const result = await VideoCustom({ Query, Stream: true, UseTor: false, Verbose: true, Filter: "flipVertical", ShowProgress: true, VideoFPS: 30 });
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
