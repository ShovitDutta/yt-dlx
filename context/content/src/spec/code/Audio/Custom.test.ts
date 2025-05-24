import AudioCustom from "../../../routes/Audio/Custom";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import * as vitest from "vitest";
import { EngineOutput } from "../../../interfaces/EngineOutput";

vitest.describe("AudioCustom", () => {
    const Query = "https://www.youtube.com/watch?v=30LWjhZzg50";
    vitest.it("should handle basic download", async () => {
        const result = await AudioCustom({ Query });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.avi$/);
        }
    });

    vitest.it("should handle download with custom AudioFormatId", async () => {
        const result = await AudioCustom({ Query, AudioFormatId: "234" });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.avi$/);
        }
    });

    vitest.it("should handle download with custom AudioBitrate", async () => {
        const result = await AudioCustom({ Query, AudioBitrate: 195 });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.avi$/);
        }
    });

    vitest.it("should handle download with Output and Filter", async () => {
        const result = await AudioCustom({ Query, Output: "Output", Filter: "bassboost" });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.avi$/);
        }
    });

    vitest.it("should handle download with all options", async () => {
        const result = await AudioCustom({ Query, Output: "Output", UseTor: false, Verbose: true, Filter: "vaporwave", ShowProgress: true, AudioBitrate: 195 });
        vitest.expect(result).toHaveProperty("OutputPath");
        if ("OutputPath" in result) {
            vitest.expect(result.OutputPath).toMatch(/\.avi$/);
        }
    });

    vitest.it("should fetch metadata only", async () => {
        const result = await AudioCustom({ Query, MetaData: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toBeInstanceOf(Object);
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });

    vitest.it("should fetch metadata with Tor and Verbose", async () => {
        const result = await AudioCustom({ Query, MetaData: true, UseTor: false, Verbose: true });
        vitest.expect(result).toHaveProperty("MetaData");
        if (result && "MetaData" in result) {
            vitest.expect((result as { MetaData: EngineOutput }).MetaData).toHaveProperty("FileName");
        }
    });

    vitest.it("should handle basic Stream", async () => {
        const result = await AudioCustom({ Query, Stream: true });
        vitest.expect(result).toHaveProperty("Stream");
        vitest.expect(result).toHaveProperty("FileName");
        if (result && "Stream" in result && result.FileName) {
            vitest.expect((result as { Stream: Readable }).Stream).toBeInstanceOf(Readable);
            // Note: Piping to a dummy stream or consuming the stream might be necessary
            // to prevent resource leaks in actual test runs.
            const outputStream = createWriteStream(result.FileName);
            (result as { Stream: Readable }).Stream?.pipe(outputStream);
            await new Promise(resolve => {
                (result as { Stream: Readable }).Stream?.on("end", resolve);
            });
        }
    });

    vitest.it("should handle Stream with custom AudioFormatId and Filter", async () => {
        // Note: Replace "some_format_id" with a valid audio format ID for the test query
        const result = await AudioCustom({ Query, Stream: true, AudioFormatId: "251", Filter: "nightcore" });
        vitest.expect(result).toHaveProperty("Stream");
        vitest.expect(result).toHaveProperty("FileName");
        if (result && "Stream" in result && result.FileName) {
            vitest.expect((result as { Stream: Readable }).Stream).toBeInstanceOf(Readable);
            const outputStream = createWriteStream(result.FileName);
            (result as { Stream: Readable }).Stream?.pipe(outputStream);
            await new Promise(resolve => {
                (result as { Stream: Readable }).Stream?.on("end", resolve);
            });
        }
    });

    vitest.it("should handle Stream with all options", async () => {
        const result = await AudioCustom({ Query, Stream: true, UseTor: false, Verbose: true, Filter: "superspeed", ShowProgress: true, AudioBitrate: 64 });
        vitest.expect(result).toHaveProperty("Stream");
        vitest.expect(result).toHaveProperty("FileName");
        if (result && "Stream" in result) {
            vitest.expect((result as { Stream: Readable }).Stream).toBeInstanceOf(Readable);
        }
        if ("FileName" in result) {
            const outputStream = createWriteStream(result.FileName);
            (result as { Stream: Readable }).Stream?.pipe(outputStream);
            await new Promise(resolve => {
                (result as { Stream: Readable })?.Stream?.on("end", resolve);
            });
        }
    });
});
