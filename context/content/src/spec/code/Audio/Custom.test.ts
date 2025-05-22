import AudioCustom from "../../../routes/Audio/Custom";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
import { EngineOutput } from "../../../interfaces/EngineOutput";

vitest.describe("AudioCustom", () => {
    const query = "https://www.youtube.com/watch?v=quO40eBkdbs";
    vitest.it("should handle basic download with high resolution", async () => {
        const result = await AudioCustom({ query, resolution: "high" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.avi$/);
        }
    });
    vitest.it("should handle download with output and filter with medium resolution", async () => {
        const result = await AudioCustom({ query, output: "output", filter: "bassboost", resolution: "medium" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.avi$/);
        }
    });
    vitest.it("should handle download with all options with low resolution", async () => {
        const result = await AudioCustom({ query, resolution: "low", output: "output", useTor: false, verbose: true, filter: "echo", showProgress: true });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.avi$/);
        }
    });
    vitest.it("should fetch metadata only with high resolution", async () => {
        const result = await AudioCustom({ query, resolution: "high", MetaData: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toBeInstanceOf(Object);
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });
    vitest.it("should handle basic stream with high resolution", async () => {
        const result = await AudioCustom({ query, resolution: "high", stream: true });
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
    vitest.it("should handle stream with filter with high resolution", async () => {
        const result = await AudioCustom({ query, resolution: "high", stream: true, filter: "vaporwave" });
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
});
