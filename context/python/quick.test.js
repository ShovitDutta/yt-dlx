import path from "path";
import process from "process";
import { spawn } from "child_process";
import * as net from "net"; // Import net module

const executableName = process.platform === "win32" ? "yt-dlx.exe" : "yt-dlx.bin";
const executablePath = path.join(process.cwd(), executableName);
console.log(`Attempting to use executable: ${executablePath}`);
async function runner(args = [], { ignoreStdErr = false } = {}) {
    console.log(`\n--- Running command: ${executableName} ${args.join(" ")} ---`);
    let stdoutData = "";
    let stderrData = "";
    const child = spawn(executablePath, args);
    child.stdout.on("data", data => {
        stdoutData += data.toString();
        process.stdout.write(data);
    });
    child.stderr.on("data", data => {
        stderrData += data.toString();
        if (!ignoreStdErr) process.stderr.write(data);
    });
    return new Promise((resolve, reject) => {
        child.on("error", error => {
            console.error(`Failed to start subprocess: ${error.message}`);
            reject(error);
        });
        child.on("close", code => {
            if (code !== 0) {
                const error = new Error(`Command failed with exit code ${code}`);
                error.stdout = stdoutData;
                error.stderr = stderrData;
                reject(error);
            } else resolve({ stdout: stdoutData, stderr: stderrData });
        });
    });
}
async function main() {
    try {
        console.log("Test 1: Getting bundled paths info...");
        await runner([]);
    } catch (error) {
        console.error("Test 1 Failed:", error.message);
    }
    try {
        console.log("\nTest 2: Running bundled ytprobe");
        await runner(["--ytprobe", "--version"]);
    } catch (error) {
        console.error("Test 2 Failed:", error.message);
    }
    try {
        console.log("\nTest 3: Running bundled tor");
        await runner(["--tor", "--version"]);
    } catch (error) {
        console.error("Test 3 Failed:", error.message);
    }
    try {
        console.log("\nTest 3: Running bundled ffmpeg");
        await runner(["--ffmpeg", "-version"]);
    } catch (error) {
        console.error("Test 3 Failed:", error.message);
    }
    try {
        console.log("\nTest 3: Running bundled ffprobe");
        await runner(["--ffprobe", "-version"]);
    } catch (error) {
        console.error("Test 3 Failed:", error.message);
    }

    let torProcess = null;
    try {
        console.log("\nTest 4: Starting Tor with ControlPort and connecting...");
        const torArgs = ["--tor", "ControlPort", "9051"];
        torProcess = spawn(executablePath, torArgs);
        await new Promise((resolve, reject) => {
            torProcess.stdout.on("data", data => {
                const line = data.toString();
                process.stdout.write(line);
                if (line.includes("Bootstrapped 100% (done): Done")) resolve();
            });
            torProcess.stderr.on("data", data => {
                process.stderr.write(data.toString());
            });
            torProcess.on("error", err => {
                console.error("Tor process error:", err);
                reject(err);
            });
            torProcess.on("close", code => {
                if (code !== 0) reject(new Error(`Tor process exited with code ${code}`));
            });
        });
        console.log("Tor bootstrapped.");
        await new Promise((resolve, reject) => {
            const client = net.createConnection({ port: 9051, host: "127.0.0.1" }, () => {
                console.log("Successfully connected to Tor control port.");
                client.end();
                resolve();
            });
            client.on("error", err => {
                console.error("Tor control port connection error:", err.message);
                reject(err);
            });
        });
        console.log("Test 4 Completed: Tor ControlPort is accessible.");
    } catch (error) {
        console.error("Test 4 Failed:", error.message);
    } finally {
        if (torProcess) {
            console.log("Stopping Tor process...");
            torProcess.kill();
            console.log("Tor process stopped.");
        }
    }
}

main().catch(console.error);
