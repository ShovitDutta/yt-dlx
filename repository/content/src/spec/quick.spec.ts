import YouTubeDLX from "..";
import dotenv from "dotenv";
import colors from "colors";
import { locator } from "../utils/locator";
dotenv.config();
console.clear();
(async () => {
    const paths = await locator();
})();
