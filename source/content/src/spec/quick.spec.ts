import dotenv from "dotenv";
import colors from "colors";
import YouTubeDLX from "..";
dotenv.config();
console.clear();
YouTubeDLX.Video.Highest({ query: "Dil Darbadar" })
  .on("data", data => console.log(colors.italic.green("@data:"), data))
  .on("error", error => console.error(colors.italic.red("@error:"), error));
