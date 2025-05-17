// tsup.config.ts
import { defineConfig } from "tsup";
export default defineConfig({
    entry: ["routes/launch.ts", "routes/**/*.ts"],
    splitting: false,
    format: ["cjs"],
    outDir: ".",
    clean: false,
});
