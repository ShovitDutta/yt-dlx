import VideoLowest from "../../../routes/Video/Lowest";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
import { EngineOutput } from "../../../interfaces/EngineOutput";

vitest.describe("VideoLowest", () => {
    const query = "https://youtu.be/dQw4w9WgXcQ";
    vitest.it("should handle basic download", async () => {
        const result = await VideoLowest({ query });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should handle download with output and filter", async () => {
        const result = await VideoLowest({ query, output: "output", filter: "grayscale" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should handle download with all options", async () => {
        const result = await VideoLowest({ query, output: "output", useTor: false, verbose: true, filter: "invert", ShowProgress: true });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should fetch metadata only", async () => {
        const result = await VideoLowest({ query, MetaData: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });
    vitest.it("should fetch metadata with Tor and verbose", async () => {
        const result = await VideoLowest({ query, MetaData: true, useTor: false, verbose: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });
    vitest.it("should handle basic stream", async () => {
        const result = await VideoLowest({ query, stream: true });
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
        const result = await VideoLowest({ query, stream: true, filter: "flipHorizontal" });
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
        const result = await VideoLowest({ query, stream: true, useTor: false, verbose: true, filter: "rotate90", ShowProgress: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect(result).toHaveProperty("FileName");
        if (result && "stream" in result && result.FileName) {
            const outputStream = createWriteStream(result.FileName);
            (result as { stream: Readable }).stream?.pipe(outputStream);
            await new Promise(resolve => {
                (result as { stream: Readable })?.stream?.on("end", resolve);
            });
        }
    });
});
