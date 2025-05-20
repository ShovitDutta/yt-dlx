import AudioCustom from "../../../routes/Audio/Custom";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
vitest.describe("AudioCustom", () => {
    const query = "https://www.youtube.com/watch?v=fp7bbq813Jc";
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
        const result = await AudioCustom({ query, resolution: "high", metadata: true });
        vitest.expect(result).toHaveProperty("metadata");
        vitest.expect((result as { metadata: any }).metadata).toBeInstanceOf(Object);
        vitest.expect((result as { metadata: any }).metadata).toHaveProperty("filename");
    });
    vitest.it("should handle basic stream with high resolution", async () => {
        const result = await AudioCustom({ query, resolution: "high", stream: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect(result).toHaveProperty("filename");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        if ("filename" in result) {
            vitest.expect(result.filename).toBeTypeOf("string");
        }
        const outputStream = createWriteStream("basic_stream_audiocustom.avi");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with filter with high resolution", async () => {
        const result = await AudioCustom({ query, resolution: "high", stream: true, filter: "vaporwave" });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect(result).toHaveProperty("filename");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        if ("filename" in result) {
            vitest.expect(result.filename).toBeTypeOf("string");
        }
        const outputStream = createWriteStream("filtered_stream_audiocustom.avi");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
});
