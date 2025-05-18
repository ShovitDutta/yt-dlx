import axios from "axios";
import colors from "colors";
import { join } from "path";
import cliProgress from "cli-progress";
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from "fs";
const outputDir = join(process.cwd(), "package");
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
const binDL = async (url, filepath, binaryName, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const progressBar = new cliProgress.SingleBar(
            { format: `[${binaryName}] [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} Bytes`, clearOnComplete: true, stopOnComplete: true, hideCursor: true },
            cliProgress.Presets.shades_classic,
        );
        try {
            let existingSize = 0;
            if (existsSync(filepath)) {
                try {
                    unlinkSync(filepath);
                } catch (err) {
                    console.error(`${colors.red("@error:")} Could not remove existing file for ${binaryName}: ${err.message}`);
                }
            }
            const response = await axios({ url, method: "GET", responseType: "stream" });
            if (response.status !== 200) {
                if (response.status === 416) {
                    console.log(`[${binaryName}]: Already fully downloaded.`);
                    progressBar.stop();
                    return;
                }
                throw new Error("@error: Server responded with status " + response.status + ": " + response.statusText);
            }
            const tSize = parseInt(response.headers["content-length"], 10) + existingSize;
            const writer = createWriteStream(filepath);
            let dSize = existingSize;
            progressBar.start(tSize, dSize);
            response.data.on("data", chunk => {
                dSize += chunk.length;
                progressBar.update(dSize);
            });
            response.data.on("end", () => {
                progressBar.update(tSize);
                progressBar.stop();
            });
            response.data.pipe(writer);
            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", err => {
                    console.error(`\n${colors.red("@error:")} Write stream error for ${binaryName}: ${err.message}`);
                    unlinkSync(filepath);
                    reject(err);
                });
            });
            if (dSize !== tSize) throw new Error(`@error: Download incomplete. Expected ${tSize} bytes, got ${dSize} bytes.`);
            console.log(`[${binaryName}]: Download successful.`);
            return;
        } catch (error) {
            progressBar.stop();
            console.error(`${colors.red("@error:")} ${binaryName}: ${error.message}`);
            if (attempt === retries) {
                console.error(`${colors.red("@error:")} Failed to download ${binaryName} after ${retries} attempts.`);
                throw error;
            }
            console.log(`[${binaryName}]: Retrying... Attempt ${attempt + 1}/${retries}`);
        }
    }
};
const main = async () => {
    var binaries = [];
    if (process.platform === "linux") {
        binaries = [{ name: "yt-dlx.bin", url: "" }];
    } else if (process.platform === "win32") {
        binaries = [
            {
                name: "yt-dlx.exe",
                url: "https://drive.usercontent.google.com/download?id=1Em3oWflxGABtlz9hgwNbDAFJvHqWQXsm&export=download&authuser=0&confirm=t&uuid=0f7d0449-8815-4bdd-894b-90d1f9046b5b&at=ALoNOgksLoVOeuadn5vKFG0HD6bn%3A1747544764031",
            },
        ];
    } else {
        console.error(`${colors.red("@error:")} Unsupported platform! Please use Linux or Windows.`);
        process.exit(1);
    }
    for (const binary of binaries) {
        const filepath = join(outputDir, binary.name);
        let isFullyDownloaded = false;
        if (existsSync(filepath)) {
            try {
                console.log(`[${binary.name}]: Found existing file. Skipping download.`);
                isFullyDownloaded = true;
            } catch (err) {
                console.warn(`[${binary.name}]: Could not check existing file: ${err.message}. Attempting redownload.`);
                unlinkSync(filepath);
            }
        }
        if (!isFullyDownloaded) {
            try {
                await binDL(binary.url, filepath, binary.name);
            } catch (error) {}
        }
    }
};
main();
