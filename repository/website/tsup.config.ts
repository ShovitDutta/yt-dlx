import { defineConfig } from "tsup";
export default defineConfig({
    entry: ["launch.ts"],
    format: ["esm"],
    outDir: ".",
    clean: false,
    splitting: false,
});
