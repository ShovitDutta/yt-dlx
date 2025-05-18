import AudioHighest from "../../../routes/Audio/Highest";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
vitest.describe("AudioHighest", () => {
    const query = "test query";
    vitest.it("should handle basic download", async () => {
        const result = await AudioHighest({ query });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.avi$/);
        }
    });
    vitest.it("should handle download with output and filter", async () => {
        const result = await AudioHighest({ query, output: "./custom_downloads_audiohigh", filter: "bassboost" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.avi$/);
        }
    });
    vitest.it("should handle download with all options", async () => {
        const result = await AudioHighest({ query, output: "./full_downloads_audiohigh", useTor: false, verbose: true, filter: "vaporwave", showProgress: true });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.avi$/);
        }
    });
    vitest.it("should fetch metadata only", async () => {
        const result = await AudioHighest({ query, metadata: true });
        vitest.expect(result).toHaveProperty("metadata");
        vitest.expect((result as { metadata: object }).metadata).toBeInstanceOf(Object);
    });
    vitest.it("should fetch metadata with Tor and verbose", async () => {
        const result = await AudioHighest({ query, metadata: true, useTor: false, verbose: true });
        vitest.expect(result).toHaveProperty("metadata");
    });
    vitest.it("should handle basic stream", async () => {
        const result = await AudioHighest({ query, stream: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("basic_stream_audiohigh.avi");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with filter", async () => {
        const result = await AudioHighest({ query, stream: true, filter: "nightcore" });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("filtered_stream_audiohigh.avi");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with all options", async () => {
        const result = await AudioHighest({ query: "your search query or url", stream: true, useTor: false, verbose: true, filter: "superspeed", showProgress: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("full_stream_audiohigh.avi");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable })?.stream?.on("end", resolve);
        });
    });
    vitest.it("should throw error for metadata with output", async () => {
        await vitest.expect(AudioHighest({ query: "test query", metadata: true, output: "./should_fail_dir" })).rejects.toThrowError(/metadata.*cannot be used with.*output/);
    });
    vitest.it("should throw error for stream with output", async () => {
        await vitest.expect(AudioHighest({ query: "test query", stream: true, output: "./should_fail_dir" })).rejects.toThrowError(/stream.*cannot be used with.*output/);
    });
    vitest.it("should throw Zod error for missing query", async () => {
        await vitest.expect(AudioHighest({} as any)).rejects.toThrowError(/query.*Required/);
    });
    vitest.it("should throw Zod error for invalid filter", async () => {
        await vitest.expect(AudioHighest({ query: "test query", filter: "nonexistentfilter" as any })).rejects.toThrowError(/filter.*invalid enum value/);
    });
});
