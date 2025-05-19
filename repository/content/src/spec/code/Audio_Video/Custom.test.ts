import AudioVideoCustom from "../../../routes/Audio_Video/Custom";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
vitest.describe("AudioVideoCustom", () => {
    const resolution = "720p";
    const query = "Weeknd, Drive";
    vitest.it("should handle basic download", async () => {
        const result = await AudioVideoCustom({ query, resolution });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should handle download with output and filter", async () => {
        const result = await AudioVideoCustom({ query, resolution: "1080p", output: "output", filter: "grayscale" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should handle download with all options", async () => {
        const result = await AudioVideoCustom({
            query,
            useTor: false,
            verbose: true,
            filter: "invert",
            output: "output",
            showProgress: true,
            resolution: "1440p",
        });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should fetch metadata only", async () => {
        const result = await AudioVideoCustom({ query, resolution, metadata: true });
        vitest.expect(result).toHaveProperty("metadata");
        vitest.expect((result as { metadata: any }).metadata).toBeInstanceOf(Object);
        vitest.expect((result as { metadata: any }).metadata).toHaveProperty("filename");
    });
    vitest.it("should fetch metadata with Tor and verbose", async () => {
        const result = await AudioVideoCustom({ query, resolution, metadata: true, useTor: false, verbose: true });
        vitest.expect(result).toHaveProperty("metadata");
        vitest.expect((result as { metadata: any }).metadata).toHaveProperty("filename");
    });
    vitest.it("should handle basic stream", async () => {
        const result = await AudioVideoCustom({ query, resolution: "480p", stream: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("basic_stream_avcustom.mkv");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with filter", async () => {
        const result = await AudioVideoCustom({ query, resolution: "720p", stream: true, filter: "flipVertical" });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("filtered_stream_avcustom.mkv");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with all options", async () => {
        const result = await AudioVideoCustom({
            query,
            stream: true,
            useTor: false,
            verbose: true,
            showProgress: true,
            resolution: "1080p",
            filter: "rotate270",
        });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("full_stream_avcustom.mkv");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable })?.stream?.on("end", resolve);
        });
    });
});
