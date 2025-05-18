import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["src/spec/code/**/*.test.ts"],
        fileParallelism: false,
        environment: "node",
        testTimeout: 60000,
    },
});
