import colors from "colors";
export default async function help(): Promise<string> {
    try {
        console.log(colors.green("@info: ") + "❣️ Thank you for using " + colors.green("yt-dlx.") + " Consider " + colors.green("🌟starring") + " the GitHub repo " + colors.green("https://github.com/yt-dlx\n"));
        return colors.bold.white(`@help: visit https://yt-dlx.vercel.app`);
    } catch (error) {
        throw new Error(colors.red("@error: ") + " An unexpected error occurred: " + (error instanceof Error ? error.message : String(error)));
    }
}
