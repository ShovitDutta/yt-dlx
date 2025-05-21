import VideoCustom from "../../../routes/Video/Custom";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
import { EngineOutput } from "../../../interfaces/EngineOutput";

vitest.describe("VideoCustom", () => {
    const query = "https://www.youtube.com/watch?v=fp7bbq813Jc";
    vitest.it("should handle basic download with 144p", async () => {
        const result = await VideoCustom({ query, resolution: "144p" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should handle download with output and filter with 720p60", async () => {
        const result = await VideoCustom({ query, resolution: "720p60", output: "output", filter: "grayscale" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should handle download with all options with 2160p60", async () => {
        const result = await VideoCustom({
            query,
            resolution: "2160p60",
            output: "output",
            useTor: false,
            verbose: true,
            filter: "flipHorizontal",
            showProgress: true,
        });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should fetch metadata only with 144p", async () => {
        const result = await VideoCustom({ query, resolution: "144p", MetaData: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });
    vitest.it("should fetch metadata with Tor and verbose with 720p60", async () => {
        const result = await VideoCustom({ query, resolution: "720p60", MetaData: true, useTor: false, verbose: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });
    vitest.it("should handle basic stream with 2160p60", async () => {
        const result = await VideoCustom({ query, resolution: "2160p60", stream: true });
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
    vitest.it("should handle stream with filter with 144p", async () => {
        const result = await VideoCustom({ query, resolution: "144p", stream: true, filter: "invert" });
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
    vitest.it("should handle stream with all options with 720p60", async () => {
        const result = await VideoCustom({ query, stream: true, useTor: false, verbose: true, filter: "rotate180", showProgress: true, resolution: "720p60" });
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
