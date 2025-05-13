import colors from "colors";

export default function help(): Promise<string> {
  console.log(
    colors.green("@info:"),
    "❣️ Thank you for using",
    colors.green("yt-dlx."),
    "Consider",
    colors.green("🌟starring"),
    "the github repo",
    colors.green("https://github.com/yt-dlx\n"),
  );
  return Promise.resolve(colors.bold.white(`@help: visit https://yt-dlx-shovit.koyeb.app`));
}
