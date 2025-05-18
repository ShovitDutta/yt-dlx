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
            { format: `[${binaryName}] [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} Bytes`, hideCursor: true, clearOnComplete: true, stopOnComplete: true },
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
        binaries = [
            {
                name: "yt-dlx.bin",
                url: "https://drive.usercontent.google.com/download?id=10kWUAtOYuwhiJ5Z3b2xZhlC_czV9xiZL&export=download&authuser=0&confirm=t&uuid=ed3c70b8-9dc3-4c36-bbf5-3eba5289d4a3&at=ALoNOgmuBdgFRFinTTjaSNrOMTQN%3A1747580993720",
            },
            {
                name: "ffmpeg.bin",
                url: "https://drive.usercontent.google.com/download?id=1aO6tg0ST9c17f3EdowbN-gbxLBbiWOn3&export=download&authuser=0&confirm=t&uuid=5135d2db-7ebe-4ec0-9d8f-4d0d6a75d69b&at=ALoNOgkQt9iBnUXbCcb0GWKin9Qb%3A1747581145889",
            },
            {
                name: "ffprobe.bin",
                url: "https://drive.usercontent.google.com/download?id=1RtNTfpYYOQVPcfN-9Msg-fU6Fb7INzwG&export=download&authuser=0&confirm=t&uuid=60ec914e-fae2-4d38-a96f-1cc0b08a9f65&at=ALoNOgnuEcZ6EDPnN91KkxG2qk2z%3A1747581297710",
            },
        ];
    } else if (process.platform === "win32") {
        binaries = [
            {
                name: "yt-dlx.exe",
                url: "https://drive.usercontent.google.com/download?id=1Em3oWflxGABtlz9hgwNbDAFJvHqWQXsm&export=download&authuser=0&confirm=t&uuid=3340d173-8450-48d9-a13a-ade628485068&at=ALoNOgkBIM8UFggX1uI9peUhxiyP%3A1747581054680",
            },
            {
                name: "ffmpeg.exe",
                url: "https://drive.usercontent.google.com/download?id=1soMstx1pqp8-eW0Q-2zHzOefnVb0sXKN&export=download&authuser=0&confirm=t&uuid=bd230a5e-b6cc-4a11-b96a-bad43e5aca78&at=ALoNOgkxB0P9cKDmDBRa11pKt4XM%3A1747581438761",
            },
            { name: "ffprobe.exe", url: "" },
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
        if (!isFullyDownloaded) await binDL(binary.url, filepath, binary.name);
    }
};
main();
