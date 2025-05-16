import YouTubeDLX from "../../../../";
import dotenv from "dotenv";
import colors from "colors";
console.clear();
dotenv.config();
(async () => {
    console.log(colors.bold.blue("@info"), "Help: (1): Display help message and get the help URL");
    const HelpData = await YouTubeDLX.Misc.System.Help();
    console.log(colors.italic.green("@data:"), HelpData);
})();
