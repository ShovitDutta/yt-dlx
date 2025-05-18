import { createWriteStream } from "fs";
import * as vitest from "vitest";
vitest.describe("VideoCustom", () => {
    const query = "test query";
    vitest.it("should handle basic download", async () => {
        const result = await VideoCustom({ query, resolution: "720p" });
        vitest.expect(result).toHaveProperty("outputPath");
    });
    vitest.it("should handle download with output and filter", async () => {
        const result = await VideoCustom({ query, resolution: "1080p", output: "./custom_downloads", filter: "grayscale" });
        vitest.expect(result).toHaveProperty("outputPath");
    });
    vitest.it("should handle download with all options", async () => {
        const result = await VideoCustom({
            query: "your search query or url",
            resolution: "720p",
            output: "./full_downloads",
            useTor: false,
            verbose: true,
            filter: "flipHorizontal",
            showProgress: true,
        });
        vitest.expect(result).toHaveProperty("outputPath");
    });
    vitest.it("should fetch metadata only", async () => {
        const result = await VideoCustom({ query: "your search query or url", resolution: "720p", metadata: true });
        vitest.expect(result).toHaveProperty("metadata");
    });
    vitest.it("should fetch metadata with Tor and verbose", async () => {
        const result = await VideoCustom({ query: "your search query or url", resolution: "720p", metadata: true, useTor: false, verbose: true });
        vitest.expect(result).toHaveProperty("metadata");
    });
    vitest.it("should handle basic stream", async () => {
        const result = await VideoCustom({ query: "your search query or url", resolution: "480p", stream: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("basic_stream.mp4");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with filter", async () => {
        const result = await VideoCustom({ query: "your search query or url", resolution: "480p", stream: true, filter: "invert" });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("filtered_stream.mp4");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with all options", async () => {
        const result = await VideoCustom({ query: "your search query or url", resolution: "720p", stream: true, useTor: false, verbose: true, filter: "rotate180", showProgress: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("full_stream.mp4");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable })?.stream?.on("end", resolve);
        });
    });
    vitest.it("should throw error for metadata with output", async () => {
        await vitest
            .expect(VideoCustom({ query: "your search query or url", resolution: "720p", metadata: true, output: "./should_fail_dir" }))
            .rejects.toThrowError(/metadata.*cannot be used with.*output/);
    });
    vitest.it("should throw error for stream with output", async () => {
        await vitest
            .expect(VideoCustom({ query: "your search query or url", resolution: "720p", stream: true, output: "./should_fail_dir" }))
            .rejects.toThrowError(/stream.*cannot be used with.*output/);
    });
    vitest.it("should throw Zod error for missing query", async () => {
        await vitest.expect(VideoCustom({ resolution: "720p" } as any)).rejects.toThrowError(/query.*Required/);
    });
    vitest.it("should throw Zod error for missing resolution", async () => {
        await vitest.expect(VideoCustom({ query: "your search query or url" } as any)).rejects.toThrowError(/resolution.*Required/);
    });
    vitest.it("should throw Zod error for invalid filter", async () => {
        await vitest.expect(VideoCustom({ query: "your search query or url", resolution: "720p", filter: "nonexistentfilter" as any })).rejects.toThrowError(/filter.*invalid enum value/);
    });
    vitest.it("should throw Zod error for invalid resolution", async () => {
        await vitest.expect(VideoCustom({ query: "your search query or url", resolution: "500p" as any })).rejects.toThrowError(/resolution.*invalid enum value/);
    });
});
