import { createWriteStream } from "fs";
import * as vitest from "vitest";
vitest.describe("VideoLowest", () => {
    const query = "test query";
    vitest.it("should handle basic download", async () => {
        const result = await VideoLowest({ query });
        vitest.expect(result).toHaveProperty("outputPath");
    });
    vitest.it("should handle download with output and filter", async () => {
        const result = await VideoLowest({ query, output: "./custom_downloads", filter: "grayscale" });
        vitest.expect(result).toHaveProperty("outputPath");
    });
    vitest.it("should handle download with all options", async () => {
        const result = await VideoLowest({ query, output: "./full_downloads", useTor: false, verbose: true, filter: "invert", showProgress: true });
        vitest.expect(result).toHaveProperty("outputPath");
    });
    vitest.it("should fetch metadata only", async () => {
        const result = await VideoLowest({ query, metadata: true });
        vitest.expect(result).toHaveProperty("metadata");
    });
    vitest.it("should fetch metadata with Tor and verbose", async () => {
        const result = await VideoLowest({ query, metadata: true, useTor: false, verbose: true });
        vitest.expect(result).toHaveProperty("metadata");
    });
    vitest.it("should handle basic stream", async () => {
        const result = await VideoLowest({ query, stream: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("basic_stream.mp4");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with filter", async () => {
        const result = await VideoLowest({ query, stream: true, filter: "flipHorizontal" });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("filtered_stream.mp4");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with all options", async () => {
        const result = await VideoLowest({ query: "your search query or url", stream: true, useTor: false, verbose: true, filter: "rotate90", showProgress: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("full_stream.mp4");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable })?.stream?.on("end", resolve);
        });
    });
    vitest.it("should throw error for metadata with output", async () => {
        await vitest.expect(VideoLowest({ query, metadata: true, output: "./should_fail_dir" })).rejects.toThrowError(/metadata.*cannot be used with.*output/);
    });
    vitest.it("should throw error for stream with output", async () => {
        await vitest.expect(VideoLowest({ query, stream: true, output: "./should_fail_dir" })).rejects.toThrowError(/stream.*cannot be used with.*output/);
    });
    vitest.it("should throw Zod error for missing query", async () => {
        await vitest.expect(VideoLowest({} as any)).rejects.toThrowError(/query.*Required/);
    });
    vitest.it("should throw Zod error for invalid filter", async () => {
        await vitest.expect(VideoLowest({ query, filter: "nonexistentvideofilter" as any })).rejects.toThrowError(/filter.*invalid enum value/);
    });
});
