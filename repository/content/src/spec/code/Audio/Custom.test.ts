import AudioCustom from "../../../routes/Audio/Custom";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
vitest.describe("AudioCustom", () => {
    const query = "test query";
    vitest.it("should handle basic download", async () => {
        const result = await AudioCustom({ query, resolution: "high" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.avi$/);
        }
    });
    vitest.it("should handle download with output and filter", async () => {
        const result = await AudioCustom({ query, output: "./custom_downloads_audiocustom", filter: "bassboost", resolution: "medium" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.avi$/);
        }
    });
    vitest.it("should handle download with all options", async () => {
        const result = await AudioCustom({ query, resolution: "low", output: "./full_downloads_audiocustom", useTor: false, verbose: true, filter: "echo", showProgress: true });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.avi$/);
        }
    });
    vitest.it("should fetch metadata only", async () => {
        const result = await AudioCustom({ query, resolution: "high", metadata: true });
        vitest.expect(result).toHaveProperty("metadata");
        vitest.expect((result as { metadata: object }).metadata).toBeInstanceOf(Object);
    });
    vitest.it("should handle basic stream", async () => {
        const result = await AudioCustom({ query, resolution: "low", stream: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("basic_stream_audiocustom.avi");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with filter", async () => {
        const result = await AudioCustom({ query, resolution: "medium", stream: true, filter: "vaporwave" });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("filtered_stream_audiocustom.avi");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should throw error for metadata with output", async () => {
        await vitest.expect(AudioCustom({ query: "test query", resolution: "high", metadata: true, output: "./should_fail_dir" })).rejects.toThrowError(/metadata.*cannot be used with.*output/);
    });
    vitest.it("should throw error for stream with output", async () => {
        await vitest.expect(AudioCustom({ query: "test query", resolution: "high", stream: true, output: "./should_fail_dir" })).rejects.toThrowError(/stream.*cannot be used with.*output/);
    });
    vitest.it("should throw Zod error for missing query", async () => {
        await vitest.expect(AudioCustom({ resolution: "high" } as any)).rejects.toThrowError(/query.*Required/);
    });
    vitest.it("should throw Zod error for missing resolution", async () => {
        await vitest.expect(AudioCustom({ query: "test query" } as any)).rejects.toThrowError(/resolution.*Required/);
    });
    vitest.it("should throw Zod error for invalid filter", async () => {
        await vitest.expect(AudioCustom({ query: "test query", resolution: "high", filter: "nonexistentfilter" as any })).rejects.toThrowError(/filter.*invalid enum value/);
    });
    vitest.it("should throw Zod error for invalid resolution", async () => {
        await vitest.expect(AudioCustom({ query: "test query", resolution: "superhigh" as any })).rejects.toThrowError(/resolution.*invalid enum value/);
    });
});
