import VideoLowest from "../../../routes/Video/Lowest";
import { describe, it, expect } from "vitest";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import dotenv from "dotenv";
console.clear();
dotenv.config();
describe("VideoLowest", () => {
    const query = "test query";
    it("should handle basic download", async () => {
        const result = await VideoLowest({ query });
        expect(result).toHaveProperty("outputPath");
    });
    it("should handle download with output and filter", async () => {
        const result = await VideoLowest({ query, output: "./custom_downloads", filter: "grayscale" });
        expect(result).toHaveProperty("outputPath");
    });
    it("should handle download with all options", async () => {
        const result = await VideoLowest({ query, output: "./full_downloads", useTor: false, verbose: true, filter: "invert", showProgress: true });
        expect(result).toHaveProperty("outputPath");
    });
    it("should fetch metadata only", async () => {
        const result = await VideoLowest({ query, metadata: true });
        expect(result).toHaveProperty("metadata");
    });
    it("should fetch metadata with Tor and verbose", async () => {
        const result = await VideoLowest({ query, metadata: true, useTor: false, verbose: true });
        expect(result).toHaveProperty("metadata");
    });
    it("should handle basic stream", async () => {
        const result = await VideoLowest({ query, stream: true });
        expect(result).toHaveProperty("stream");
        expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("basic_stream.mp4");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    it("should handle stream with filter", async () => {
        const result = await VideoLowest({ query, stream: true, filter: "flipHorizontal" });
        expect(result).toHaveProperty("stream");
        expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("filtered_stream.mp4");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable }).stream?.on("end", resolve);
        });
    });
    it("should handle stream with all options", async () => {
        const result = await VideoLowest({ query: "your search query or url", stream: true, useTor: false, verbose: true, filter: "rotate90", showProgress: true });
        expect(result).toHaveProperty("stream");
        expect((result as { stream: Readable }).stream).toBeInstanceOf(Readable);
        const outputStream = createWriteStream("full_stream.mp4");
        (result as { stream: Readable }).stream?.pipe(outputStream);
        await new Promise(resolve => {
            (result as { stream: Readable })?.stream?.on("end", resolve);
        });
    });
    it("should throw error for metadata with output", async () => {
        await expect(VideoLowest({ query, metadata: true, output: "./should_fail_dir" })).rejects.toThrowError(/metadata.*cannot be used with.*output/);
    });
    it("should throw error for stream with output", async () => {
        await expect(VideoLowest({ query, stream: true, output: "./should_fail_dir" })).rejects.toThrowError(/stream.*cannot be used with.*output/);
    });
    it("should throw Zod error for missing query", async () => {
        await expect(VideoLowest({} as any)).rejects.toThrowError(/query.*Required/);
    });
    it("should throw Zod error for invalid filter", async () => {
        await expect(VideoLowest({ query, filter: "nonexistentvideofilter" as any })).rejects.toThrowError(/filter.*invalid enum value/);
    });
});
