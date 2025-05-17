console.clear();
import next from "next";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { Server } from "socket.io";
import { createServer } from "node:http";
const isProductionFlag = process.argv.includes("--production");
process.env.NODE_ENV = isProductionFlag ? "production" : process.env.NODE_ENV || "development";
const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port, turbo: dev });
const handler = app.getRequestHandler();
function getNetworkAddress() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        const interfaceInfo = interfaces[name];
        if (!interfaceInfo) continue;
        for (const { address, family, internal } of interfaceInfo) {
            if (family === "IPv4" && !internal) {
                return address;
            }
        }
    }
    return null;
}
function getNextVersion() {
    try {
        const packageJsonPath = path.resolve(process.cwd(), "package.json");
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
        return packageJson.dependencies.next || "unknown";
    } catch (err) {
        return "unknown";
    }
}
const bright = "\x1b[1m";
const green = "\x1b[32m";
const reset = "\x1b[0m";
const bold = "\x1b[1m";
const dim = "\x1b[2m";
function addIoRoutes(io) {
    io.on("connection", socket => {
        console.log(green, "Socket Connected:", reset, socket.id);
        console.log(green, "Socket Connected:", reset, socket.handshake.url);
        console.log(green, "Socket Connected:", reset, socket.handshake.time);
        console.log(green, "Socket Connected:", reset, socket.handshake.headers.host);
        socket.on("message", data => console.log(`Received message from ${socket.id}: ${data}`));
        socket.on("disconnect", () => console.log(`Socket disconnected: ${socket.id}`));
    });
    console.log("Socket.IO routes initialized.");
}
app.prepare().then(() => {
    const httpServer = createServer(handler);
    const io = new Server(httpServer);
    addIoRoutes(io);
    const nextVersion = getNextVersion();
    const networkAddress = getNetworkAddress();
    console.log(`\n  ${bright}▲${reset} ${bold}Next.js${reset} ${nextVersion} ${dev ? "(Custom Server, Turbopack)" : "(Custom Server, Production)"}`);
    console.log(`  ${dim}-${reset} ${bold}Local:${reset}     ${green}http://${hostname}:${port}${reset}`);
    if (networkAddress) console.log(`  ${dim}-${reset} ${bold}Network:${reset}   ${green}http://${networkAddress}:${port}${reset}`);
    else console.log(`  ${dim}-${reset} ${bold}Network:${reset}   ${dim}unavailable${reset}`);
    console.log("\n");
    httpServer
        .once("error", err => {
            console.error(`HTTP server error:`, err);
            process.exit(1);
        })
        .listen(port, () => {});
});
process.on("uncaughtException", err => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
