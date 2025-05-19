// Suggestion: Add code coverage reporting to ensure that the tests cover a sufficient portion of the codebase. Consider configuring different test environments for different types of tests (e.g., unit tests, integration tests).
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
