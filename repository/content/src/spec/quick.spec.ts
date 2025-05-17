import YouTubeDLX from "..";
import dotenv from "dotenv";
import colors from "colors";
dotenv.config();
console.clear();
YouTubeDLX.Video.Highest({ query: "Dil Darbadar", stream: true, metadata: true })
    .on("data", data => console.log(colors.italic.green("@data:"), data))
    .on("error", error => console.error(colors.italic.red("@error:"), error));
