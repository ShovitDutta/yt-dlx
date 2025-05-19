import VideoLowest from "../../../routes/Video/Lowest";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
vitest.describe("VideoLowest", () => {
    const query = "https://youtu.be/dQw4w9WgXcQ";
    vitest.it("should handle basic download", async () => {
        const result = await VideoLowest({ query });
        vitest.expect(result).toHaveProperty("outputPath");
    });
    vitest.it("should handle download with output and filter", async () => {
        const result = await VideoLowest({ query, output: "output", filter: "grayscale" });
        vitest.expect(result).toHaveProperty("outputPath");
    });
    vitest.it("should handle download with all options", async () => {
        const result = await VideoLowest({ query, output: "output", useTor: false, verbose: true, filter: "invert", showProgress: true });
        vitest.expect(result).toHaveProperty("outputPath");
    });
    vitest.it("should fetch metadata only", async () => {
        const result = await VideoLowest({ query, metadata: true });
        vitest.expect(result).toHaveProperty("metadata");
        vitest.expect((result as { metadata: any }).metadata).toHaveProperty("filename");
    });
    vitest.it("should fetch metadata with Tor and verbose", async () => {
        const result = await VideoLowest({ query, metadata: true, useTor: false, verbose: true });
        vitest.expect(result).toHaveProperty("metadata");
        vitest.expect((result as { metadata: any }).metadata).toHaveProperty("filename");
    });
    vitest.it("should handle basic stream", async () => {
        const result = await VideoLowest({ query, stream: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect(result).toHaveProperty("filename");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        if ("filename" in result) {
            vitest.expect(result.filename).toBeTypeOf("string");
        }
        const outputStream = createWriteStream("basic_stream.mp4");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with filter", async () => {
        const result = await VideoLowest({ query, stream: true, filter: "flipHorizontal" });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect(result).toHaveProperty("filename");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        if ("filename" in result) {
            vitest.expect(result.filename).toBeTypeOf("string");
        }
        const outputStream = createWriteStream("filtered_stream.mp4");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with all options", async () => {
        const result = await VideoLowest({ query, stream: true, useTor: false, verbose: true, filter: "rotate90", showProgress: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect(result).toHaveProperty("filename");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        if ("filename" in result) {
            vitest.expect(result.filename).toBeTypeOf("string");
        }
        const outputStream = createWriteStream("full_stream.mp4");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable })?.stream?.on("end", resolve);
        });
    });
});
