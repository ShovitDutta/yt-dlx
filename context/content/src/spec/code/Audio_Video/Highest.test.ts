import AudioVideoHighest from "../../../routes/Audio_Video/Highest";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
import { EngineOutput } from "../../../interfaces/EngineOutput";

vitest.describe("AudioVideoHighest", () => {
    const query = "https://www.youtube.com/watch?v=quO40eBkdbs";
    vitest.it("should handle basic download", async () => {
        const result = await AudioVideoHighest({ query });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should handle download with output and filter", async () => {
        const result = await AudioVideoHighest({ query, output: "output", filter: "grayscale" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should handle download with all options", async () => {
        const result = await AudioVideoHighest({ query, output: "output", useTor: false, verbose: true, filter: "flipHorizontal", showProgress: true });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should fetch metadata only", async () => {
        const result = await AudioVideoHighest({ query, MetaData: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toBeInstanceOf(Object);
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });
    vitest.it("should fetch metadata with Tor and verbose", async () => {
        const result = await AudioVideoHighest({ query, MetaData: true, useTor: false, verbose: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });
    vitest.it("should handle basic stream", async () => {
        const result = await AudioVideoHighest({ query, stream: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect(result).toHaveProperty("FileName");
        if (result && "stream" in result && result.FileName) {
            vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
            const outputStream = createWriteStream(result.FileName);
            (result as { stream: Readable }).stream?.pipe(outputStream);
            await new Promise(resolve => {
                (result as { stream: Readable }).stream?.on("end", resolve);
            });
        }
    });
    vitest.it("should handle stream with filter", async () => {
        const result = await AudioVideoHighest({ query, stream: true, filter: "rotate90" });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect(result).toHaveProperty("FileName");
        if (result && "stream" in result && result.FileName) {
            vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
            const outputStream = createWriteStream(result.FileName);
            (result as { stream: Readable }).stream?.pipe(outputStream);
            await new Promise(resolve => {
                (result as { stream: Readable }).stream?.on("end", resolve);
            });
        }
    });
    vitest.it("should handle stream with all options", async () => {
        const result = await AudioVideoHighest({ query, stream: true, useTor: false, verbose: true, filter: "rotate270", showProgress: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect(result).toHaveProperty("FileName");
        if (result && "stream" in result && result.FileName) {
            vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
            const outputStream = createWriteStream(result.FileName);
            (result as { stream: Readable }).stream?.pipe(outputStream);
            await new Promise(resolve => {
                (result as { stream: Readable })?.stream?.on("end", resolve);
            });
        }
    });
});
