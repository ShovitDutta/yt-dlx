import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["src/spec/code/**/*.test.ts"],
        fileParallelism: false,
        testTimeout: 1800000,
        reporters: "verbose",
        environment: "node",
        bail: 1,
    },
});
