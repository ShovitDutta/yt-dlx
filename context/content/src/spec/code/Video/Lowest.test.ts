import VideoLowest from "../../../routes/Video/Lowest";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
import { EngineOutput } from "../../../interfaces/EngineOutput";

vitest.describe("VideoLowest", () => {
    const Query = "https://www.youtube.com/watch?v=30LWjhZzg50";
    vitest.it("should handle basic download", async () => {
        const result = await VideoLowest({ Query });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) vitest.expect(result.OutputPath).toMatch(/\.mkv$/);
    });
    vitest.it("should handle download with Output and Filter", async () => {
        const result = await VideoLowest({ Query, Output: "Output", Filter: "grayscale" });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should handle download with all options", async () => {
        const result = await VideoLowest({ Query, Output: "Output", UseTor: false, Verbose: true, Filter: "invert", ShowProgress: true });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should fetch metadata only", async () => {
        const result = await VideoLowest({ Query, MetaData: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });
    vitest.it("should fetch metadata with Tor and Verbose", async () => {
        const result = await VideoLowest({ Query, MetaData: true, UseTor: false, Verbose: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });
    vitest.it("should handle basic Stream", async () => {
        const result = await VideoLowest({ Query, Stream: true });
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
    vitest.it("should handle Stream with Filter", async () => {
        const result = await VideoLowest({ Query, Stream: true, Filter: "flipHorizontal" });
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
        const result = await VideoLowest({ Query, Stream: true, UseTor: false, Verbose: true, Filter: "rotate90", ShowProgress: true });
        vitest.expect(result).toHaveProperty("Stream");
        vitest.expect(result).toHaveProperty("FileName");
        if (result && "Stream" in result && result.FileName) {
            const outputStream = createWriteStream(result.FileName);
            (result as { Stream: Readable }).Stream?.pipe(outputStream);
            await new Promise(resolve => {
                (result as { Stream: Readable })?.Stream?.on("end", resolve);
            });
        }
    });
});
