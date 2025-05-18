import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        include: ["spec/**/*.test.ts"],
        globals: true,
        // resolve: {
        //   alias: {
        //     '@/': new URL('./src/', import.meta.url).pathname,
        //   },
        // },

        // Optional: Add setup files if you have global setup/teardown logic.
        // setupFiles: ['./spec/setup.ts'],

        // Optional: Configure test coverage collection.
        // coverage: {
        //   provider: 'v8', // or 'istanbul'
        //   reporter: ['text', 'html'],
        //   include: ['src/**/*.ts'], // Specify which files to include in coverage reports
        //   exclude: ['src/**/*.d.ts'], // Specify files to exclude
        // },

        // You can add other configuration options here based on your project's needs.
        // Refer to the Vitest documentation for a full list of options: https://vitest.dev/config/
    },
});
