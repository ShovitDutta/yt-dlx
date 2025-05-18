console.clear();
import next from "next";
import os from "node:os";
import fs from "node:fs";
import colors from "colors";
import path from "node:path";
import YouTubeDLX from "yt-dlx";
import { Server, Socket, DisconnectReason } from "socket.io";
import { createServer, Server as HttpServer } from "node:http";
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const isProductionFlag: boolean = process.argv.includes("--production");
(process.env as any).NODE_ENV = isProductionFlag ? "production" : process.env.NODE_ENV || "development";
const dev: boolean = process.env.NODE_ENV !== "production";
const hostname: string = process.env.HOSTNAME || "localhost";
const port: number = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port, turbo: dev });
const handler = app.getRequestHandler();
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
function getNetworkAddress(): string | null {
    const interfaces: NodeJS.Dict<os.NetworkInterfaceInfo[]> = os.networkInterfaces();
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
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
function getNextVersion(): string {
    try {
        const packageJsonPath: string = path.resolve(process.cwd(), "package.json");
        const packageJson: { dependencies?: { next?: string } } = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
        return packageJson.dependencies?.next || "unknown";
    } catch (err) {
        return "unknown";
    }
}
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
app.prepare().then(() => {
    const httpServer: HttpServer = createServer(handler);
    const io: Server = new Server(httpServer);
    io.on("connection", (socket: Socket) => {
        console.log(colors.green(`Socket Connected: [ID: ${socket.id}, URL: ${socket.handshake.url}, Time: ${socket.handshake.time}, Host: ${socket.handshake.headers.host}]`));
        socket.on("message", (data: unknown) => console.log(`Received message from ${socket.id}:`, data));
        socket.on("disconnect", (reason: DisconnectReason) => console.log(`Socket disconnected: ${socket.id} (${reason})`));
        socket.on("yt-dlx-command", async (data: { command: string; options: any }) => {
            const { command, options } = data;
            const commandParts = command.split(".");
            if (YouTubeDLX[command as keyof typeof YouTubeDLX]) {
                const ytDlxFunction = commandParts.reduce((acc: any, part: string) => acc[part], YouTubeDLX);
                if (typeof ytDlxFunction === "function") {
                    try {
                        const resultEmitter = (ytDlxFunction as any)(options)
                            .on("data", (resultData: any) => socket.emit(`${command}-response`, { status: "success", data: resultData }))
                            .on("metadata", (resultData: any) => socket.emit(`${command}-response`, { status: "success", data: resultData }))
                            .on("error", (error: any) => socket.emit(`${command}-response`, { status: "error", message: error.message || error }));
                        if (resultEmitter.on) resultEmitter.on("progress", (progressData: any) => socket.emit(`${command}-progress`, { progress: progressData }));
                    } catch (error: any) {
                        socket.emit(`${command}-response`, { status: "error", message: error.message || error });
                    }
                } else socket.emit("yt-dlx-response", { command, status: "error", message: `Invalid yt-dlx command: ${command}` });
            } else socket.emit("yt-dlx-response", { command, status: "error", message: `Unknown yt-dlx command: ${command}` });
        });
    });
    console.log("Socket.IO routes initialized.");
    const nextVersion: string = getNextVersion();
    const networkAddress: string | null = getNetworkAddress();
    console.log(`\n  ${"▲"} ${colors.bold("Next.js")} ${nextVersion} ${dev ? colors.dim("(Custom Server, Turbopack)") : colors.dim("(Custom Server, Production)")}`);
    console.log(`  ${colors.dim("-")} ${colors.bold("Local:")}    ${colors.green(`http://${hostname}:${port}`)}`);
    if (networkAddress) console.log(`  ${colors.dim("-")} ${colors.bold("Network:")}  ${colors.green(`http://${networkAddress}:${port}`)}`);
    else console.log(`  ${colors.dim("-")} ${colors.bold("Network:")}  ${colors.dim("unavailable")}`);
    console.log("\n");
    httpServer
        .once("error", (err: Error) => {
            console.error(colors.red(`HTTP server error:`), err);
            process.exit(1);
        })
        .listen(port, () => {});
});
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
process.on("uncaughtException", (err: Error) => {
    console.error(colors.red("Uncaught Exception:"), err);
    process.exit(1);
});
process.on("unhandledRejection", (reason: {} | null | undefined, promise: Promise<any>) => {
    console.error(colors.red("Unhandled Rejection at:"), promise, "reason:", reason);
    process.exit(1);
});

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
