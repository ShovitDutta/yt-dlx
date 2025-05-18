import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["src/spec/code/**/*.test.ts"],
        fileParallelism: false,
        reporters: "verbose",
        environment: "node",
        testTimeout: 60000,
        bail: 1,
    },
});
