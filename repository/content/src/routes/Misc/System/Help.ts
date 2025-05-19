// Suggestion: Add JSDoc comments to the function, explaining its purpose and return value. Also, consider making the help message more dynamic by fetching it from a configuration file or an external source, allowing for easier updates. Remove the IIFE at the end of the file.
// Suggestion: Add JSDoc comments to the function, explaining its purpose and return value. Also, consider making the help message more dynamic by fetching it from a configuration file or an external source, allowing for easier updates.
import colors from "colors";
export default async function help(): Promise<string> {
    try {
        console.log(colors.green("@info:"), "❣️ Thank you for using", colors.green("yt-dlx."), "Consider", colors.green("🌟starring"), "the GitHub repo", colors.green("https://github.com/yt-dlx\n"));
        return colors.bold.white(`@help: visit https://yt-dlx-shovit.koyeb.app`);
    } catch (error: any) {
        const errorMessage = `${colors.red("@error:")} An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
}
(async () => {
    try {
        console.log("--- Running Help Example ---");
        const result = await help();
        console.log("Help URL:", result);
    } catch (error) {
        console.error("Help Error:", error instanceof Error ? error.message : error);
    }
    console.log("\n");
})();
