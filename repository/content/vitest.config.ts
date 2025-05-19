import { defineConfig } from "vitest/config";
export default defineConfig({
    test: {
        reporters: [["verbose", { summary: true }], "dot"],
        include: ["src/spec/code/**/*.test.ts"],
        fileParallelism: false,
        testTimeout: 1800000,
        environment: "node",
        bail: 1,
    },
});
