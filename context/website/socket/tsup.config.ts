import { defineConfig } from "tsup";
export default defineConfig({
    entry: ["launch.ts"],
    splitting: false,
    format: ["cjs"],
    clean: false,
    outDir: ".",
});
