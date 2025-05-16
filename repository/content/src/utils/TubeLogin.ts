import * as fs from "fs";
import colors from "colors";
import * as path from "path";
import * as fsPromises from "fs/promises";
import { Innertube, UniversalCache } from "youtubei.js";

/**
 * Type definition for the Innertube instance.
 */
export type TubeType = Innertube;

/**
 * Holds the authenticated Innertube instance, or null if not logged in.
 */
export let Tube: TubeType | null = null;

/**
 * Logs in to YouTube using provided cookies and initializes the Innertube instance.
 * Uses async/await for asynchronous operations like file reading and Innertube creation.
 *
 * @param cookiesFilePathOrString The file path to a cookies file, or the cookies data as a string.
 * @returns A Promise that resolves with the authenticated Innertube instance.
 * @throws Will exit the process if authentication fails or the cookies file cannot be read.
 */
export default async function TubeLogin(cookiesFilePathOrString: string): Promise<TubeType> {
    let cookiesData: string;
    if (fs.existsSync(cookiesFilePathOrString)) {
        try {
            // Use async file reading
            cookiesData = await fsPromises.readFile(cookiesFilePathOrString, "utf8");
        } catch (error) {
            console.error(colors.red("@error:"), "Failed to read cookies file.");
            process.exit(1); // Consider throwing an error instead of exiting
        }
    } else {
        cookiesData = cookiesFilePathOrString;
    }

    try {
        // Innertube.create is already promise-based, await it.
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
        process.exit(1); // Consider throwing an error instead of exiting
    }
}
