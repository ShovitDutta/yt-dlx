import VideoHighest from "../../../routes/Video/Highest";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
vitest.describe("VideoHighest", () => {
    const query = "test query";
    vitest.it("should handle basic download", async () => {
        const result = await VideoHighest({ query });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mp4$/);
        }
    });
    vitest.it("should handle download with output and filter", async () => {
        const result = await VideoHighest({ query, output: "./custom_downloads_vhigh", filter: "grayscale" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mp4$/);
        }
    });
    vitest.it("should handle download with all options", async () => {
        const result = await VideoHighest({ query, output: "./full_downloads_vhigh", useTor: false, verbose: true, filter: "invert", showProgress: true });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mp4$/);
        }
    });
    vitest.it("should fetch metadata only", async () => {
        const result = await VideoHighest({ query, metadata: true });
        vitest.expect(result).toHaveProperty("metadata");
        vitest.expect((result as { metadata: object }).metadata).toBeInstanceOf(Object);
    });
    vitest.it("should fetch metadata with Tor and verbose", async () => {
        const result = await VideoHighest({ query, metadata: true, useTor: false, verbose: true });
        vitest.expect(result).toHaveProperty("metadata");
    });
    vitest.it("should handle basic stream", async () => {
        const result = await VideoHighest({ query, stream: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("basic_stream_vhigh.mp4");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with filter", async () => {
        const result = await VideoHighest({ query, stream: true, filter: "rotate90" });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("filtered_stream_vhigh.mp4");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with all options", async () => {
        const result = await VideoHighest({ query: "your search query or url", stream: true, useTor: false, verbose: true, filter: "rotate180", showProgress: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("full_stream_vhigh.mp4");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable })?.stream?.on("end", resolve);
        });
    });
    vitest.it("should throw error for metadata with output", async () => {
        await vitest.expect(VideoHighest({ query: "test query", metadata: true, output: "./should_fail_dir" })).rejects.toThrowError(/metadata.*cannot be used with.*output/);
    });
    vitest.it("should throw error for stream with output", async () => {
        await vitest.expect(VideoHighest({ query: "test query", stream: true, output: "./should_fail_dir" })).rejects.toThrowError(/stream.*cannot be used with.*output/);
    });
    vitest.it("should throw Zod error for missing query", async () => {
        await vitest.expect(VideoHighest({} as any)).rejects.toThrowError(/query.*Required/);
    });
    vitest.it("should throw Zod error for invalid filter", async () => {
        await vitest.expect(VideoHighest({ query: "test query", filter: "nonexistentfilter" as any })).rejects.toThrowError(/filter.*invalid enum value/);
    });
});
