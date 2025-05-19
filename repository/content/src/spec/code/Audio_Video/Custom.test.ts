import AudioVideoCustom from "../../../routes/Audio_Video/Custom";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
vitest.describe("AudioVideoCustom", () => {
    const query = "https://www.youtube.com/watch?v=fp7bbq813Jc";
    vitest.it("should handle basic download with 144p", async () => {
        const result = await AudioVideoCustom({ query, resolution: "144p" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should handle download with output and filter with 720p60", async () => {
        const result = await AudioVideoCustom({ query, resolution: "720p60", output: "output", filter: "grayscale" });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should handle download with all options with 2160p60", async () => {
        const result = await AudioVideoCustom({
            query,
            useTor: false,
            verbose: true,
            filter: "invert",
            output: "output",
            showProgress: true,
            resolution: "2160p60",
        });
        vitest.expect(result).toHaveProperty("outputPath");
        if ("outputPath" in result) {
            vitest.expect(result.outputPath).toMatch(/\.mkv$/);
        }
    });
    vitest.it("should fetch metadata only with 144p", async () => {
        const result = await AudioVideoCustom({ query, resolution: "144p", metadata: true });
        vitest.expect(result).toHaveProperty("metadata");
        vitest.expect((result as { metadata: any }).metadata).toBeInstanceOf(Object);
        vitest.expect((result as { metadata: any }).metadata).toHaveProperty("filename");
    });
    vitest.it("should fetch metadata with Tor and verbose with 720p60", async () => {
        const result = await AudioVideoCustom({ query, resolution: "720p60", metadata: true, useTor: false, verbose: true });
        vitest.expect(result).toHaveProperty("metadata");
        vitest.expect((result as { metadata: any }).metadata).toHaveProperty("filename");
    });
    vitest.it("should handle basic stream with 2160p60", async () => {
        const result = await AudioVideoCustom({ query, resolution: "2160p60", stream: true });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect(result).toHaveProperty("filename");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        vitest.expect((result as { filename: string }).filename).toBeTypeOf("string");
        const outputStream = createWriteStream("basic_stream_avcustom.mkv");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with filter with 144p", async () => {
        const result = await AudioVideoCustom({ query, resolution: "144p", stream: true, filter: "flipHorizontal" });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect(result).toHaveProperty("filename");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        vitest.expect((result as { filename: string }).filename).toBeTypeOf("string");
        const outputStream = createWriteStream("filtered_stream_avcustom.mkv");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    vitest.it("should handle stream with all options with 720p60", async () => {
        const result = await AudioVideoCustom({
            query,
            stream: true,
            useTor: false,
            verbose: true,
            showProgress: true,
            resolution: "720p60",
            filter: "rotate270",
        });
        vitest.expect(result).toHaveProperty("stream");
        vitest.expect(result).toHaveProperty("filename");
        vitest.expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        vitest.expect((result as { filename: string }).filename).toBeTypeOf("string");
        const outputStream = createWriteStream("full_stream_avcustom.mkv");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable })?.stream?.on("end", resolve);
        });
    });
});
