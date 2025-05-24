import * as fs from "fs";
import * as path from "path";
import colors from "colors";
import { Innertube, UniversalCache } from "youtubei.js";
export type TubeType = Innertube;
export let Tube: TubeType | null = null;
export default async function TubeLogin(cookiesFilePathOrString: string): Promise<TubeType> {
    let cookiesData: string;
    if (fs.existsSync(cookiesFilePathOrString)) {
        try {
            cookiesData = fs.readFileSync(cookiesFilePathOrString, "utf8");
        } catch (error) {
            console.error(colors.red("@error:") + "Failed to read cookies file.");
            process.exit(1);
        }
    } else cookiesData = cookiesFilePathOrString;
    try {
        Tube = await Innertube.create({
            user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            cache: new UniversalCache(true, path.join(process.cwd(), "YouTubeDLX")),
            cookie: cookiesData,
        });
        console.log(colors.green("@info:"), "Connected to YouTube...");
        return Tube;
    } catch (err) {
        console.error(colors.red("@error:"), "Failed to authenticate. The cookies appear to be corrupt or invalid.");
        console.error(colors.red("@error:"), "Try using valid YouTube cookies.");
        process.exit(1);
    }
}
