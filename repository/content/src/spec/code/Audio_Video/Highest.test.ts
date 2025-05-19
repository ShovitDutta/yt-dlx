import AudioVideoHighest from "../../../routes/Audio_Video/Highest";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
vitest.describe("AudioVideoHighest", () => {
    const query = "https://youtu.be/dQw4w9WgXcQ";
    vitest.it("should handle basic download", async () => {
        const result = await AudioVideoHighest({ query });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.avi$/);
        }
    });
    vitest.it("should handle download with output and filter", async () => {
        const result = await AudioVideoHighest({ query, output: "output", filter: "grayscale" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.avi$/);
        }
    });
    vitest.it("should handle download with all options", async () => {
        const result = await AudioVideoHighest({ query, output: "output", useTor: false, verbose: true, filter: "flipHorizontal", showProgress: true });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.avi$/);
        }
    });
    vitest.it("should fetch metadata only", async () => {
        const result = await AudioVideoHighest({ query, metadata: true });
        vitest.expect(result).toHaveProperty("metadata");
        vitest.expect((result as { metadata: any }).metadata).toBeInstanceOf(Object);
        vitest.expect((result as { metadata: any }).metadata).toHaveProperty("filename");
    });
    vitest.it("should fetch metadata with Tor and verbose", async () => {
        const result = await AudioVideoHighest({ query, metadata: true, useTor: false, verbose: true });
        vitest.expect(result).toHaveProperty("metadata");
        vitest.expect((result as { metadata: any }).metadata).toHaveProperty("filename");
    });
    vitest.it("should handle basic stream", async () => {
        const result = await AudioVideoHighest({ query, stream: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect(result).toHaveProperty("filename");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        if ("filename" in result) {
            vitest.expect(result.filename).toBeTypeOf("string");
        }
        const outputStream = createWriteStream("basic_stream_avhigh.avi");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with filter", async () => {
        const result = await AudioVideoHighest({ query, stream: true, filter: "rotate90" });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect(result).toHaveProperty("filename");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        if ("filename" in result) {
            vitest.expect(result.filename).toBeTypeOf("string");
        }
        const outputStream = createWriteStream("filtered_stream_avhigh.avi");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with all options", async () => {
        const result = await AudioVideoHighest({ query, stream: true, useTor: false, verbose: true, filter: "rotate270", showProgress: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect(result).toHaveProperty("filename");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        if ("filename" in result) {
            vitest.expect(result.filename).toBeTypeOf("string");
        }
        const outputStream = createWriteStream("full_stream_avhigh.avi");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable })?.stream?.on("end", resolve);
        });
    });
});
