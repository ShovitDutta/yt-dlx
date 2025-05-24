import VideoCustom from "../../../routes/Video/Custom";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
import { EngineOutput } from "../../../interfaces/EngineOutput";

vitest.describe("VideoCustom", () => {
    const Query = "https://www.youtube.com/watch?v=quO40eBkdbs";
    vitest.it("should handle basic download with 144p", async () => {
        const result = await VideoCustom({ Query, Resolution: "144p" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should handle download with Output and Filter with 720p60", async () => {
        const result = await VideoCustom({ Query, Resolution: "720p60", Output: "Output", Filter: "grayscale" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should handle download with all options with 2160p60", async () => {
        const result = await VideoCustom({
            Query,
            Resolution: "2160p60",
            Output: "Output",
            UseTor: false,
            Verbose: true,
            Filter: "flipHorizontal",
            ShowProgress: true,
        });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should fetch metadata only with 144p", async () => {
        const result = await VideoCustom({ Query, Resolution: "144p", MetaData: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });
    vitest.it("should fetch metadata with Tor and Verbose with 720p60", async () => {
        const result = await VideoCustom({ Query, Resolution: "720p60", MetaData: true, UseTor: false, Verbose: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });
    vitest.it("should handle basic Stream with 2160p60", async () => {
        const result = await VideoCustom({ Query, Resolution: "2160p60", Stream: true });
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
    vitest.it("should handle Stream with Filter with 144p", async () => {
        const result = await VideoCustom({ Query, Resolution: "144p", Stream: true, Filter: "invert" });
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
    vitest.it("should handle Stream with all options with 720p60", async () => {
        const result = await VideoCustom({ Query, Stream: true, UseTor: false, Verbose: true, Filter: "rotate180", ShowProgress: true, Resolution: "720p60" });
        vitest.expect(result).toHaveProperty("Stream");
        vitest.expect(result).toHaveProperty("FileName");
        if (result && "Stream" in result && result.FileName) {
            vitest.expect((result as { Stream: Readable }).Stream).toBeInstanceOf(Readable);
            const outputStream = createWriteStream(result.FileName);
            (result as { Stream: Readable }).Stream?.pipe(outputStream);
            await new Promise(resolve => {
                (result as { Stream: Readable })?.Stream?.on("end", resolve);
            });
        }
    });
});
