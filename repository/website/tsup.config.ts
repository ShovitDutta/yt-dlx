import { defineConfig } from "tsup";
export default defineConfig({
    entry: ["routes/launch.ts", "routes/**/*.ts"],
    splitting: false,
    format: ["esm"],
    outDir: "out",
    clean: false,
});
