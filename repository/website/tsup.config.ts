// tsup.config.ts
import { defineConfig } from "tsup";
export default defineConfig({
    entry: ["launch.ts"],
    format: ["cjs"],
    outDir: ".",
    clean: false,
    splitting: false,
});
