import AudioVideoHighest from "../../../routes/Audio_Video/Highest";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
import { EngineOutput } from "../../../interfaces/EngineOutput";

vitest.describe("AudioVideoHighest", () => {
    const Query = "https://www.youtube.com/watch?v=quO40eBkdbs";
    vitest.it("should handle basic download", async () => {
        const result = await AudioVideoHighest({ Query });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should handle download with Output and Filter", async () => {
        const result = await AudioVideoHighest({ Query, Output: "Output", Filter: "grayscale" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should handle download with all options", async () => {
        const result = await AudioVideoHighest({ Query, Output: "Output", UseTor: false, Verbose: true, Filter: "flipHorizontal", ShowProgress: true });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should fetch metadata only", async () => {
        const result = await AudioVideoHighest({ Query, MetaData: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toBeInstanceOf(Object);
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });
    vitest.it("should fetch metadata with Tor and Verbose", async () => {
        const result = await AudioVideoHighest({ Query, MetaData: true, UseTor: false, Verbose: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });
    vitest.it("should handle basic Stream", async () => {
        const result = await AudioVideoHighest({ Query, Stream: true });
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
        const result = await AudioVideoHighest({ Query, Stream: true, Filter: "rotate90" });
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
        const result = await AudioVideoHighest({ Query, Stream: true, UseTor: false, Verbose: true, Filter: "rotate270", ShowProgress: true });
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
