// In routes/launch.ts
import next from "next";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
// No need for fileURLToPath or dirname from url/path in CJS
import { Server, Socket, DisconnectReason } from "socket.io";
import { createServer, Server as HttpServer } from "node:http";

// __dirname is available globally in CommonJS modules

console.clear();
const isProductionFlag: boolean = process.argv.includes("--production");
(process.env as any).NODE_ENV = isProductionFlag ? "production" : process.env.NODE_ENV || "development";
const dev: boolean = process.env.NODE_ENV !== "production";
const hostname: string = process.env.HOSTNAME || "localhost";
const port: number = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port, turbo: dev });
const handler = app.getRequestHandler();

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

function getNextVersion(): string {
    try {
        const packageJsonPath: string = path.resolve(process.cwd(), "package.json");
        interface PackageJson {
            dependencies?: { next?: string };
        }
        const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
        return packageJson.dependencies?.next || "unknown";
    } catch (err) {
        return "unknown";
    }
}

const bright: string = "\x1b[1m";
const green: string = "\x1b[32m";
const reset: string = "\x1b[0m";
const bold: string = "\x1b[1m";
const dim: string = "\x1b[2m";

const socketHandlerFiles: string[] = [];

// The directory containing the compiled route files (.js).
// With launch.ts in 'routes' compiling to 'out/launch.js',
// and other routes (like message.ts) compiling to 'out/routes/message.js',
// the directory containing the compiled *route handlers* is 'out/routes'.
// This directory is 'routes' relative to __dirname ('out') when launch.js runs.
const routesDir = path.join(__dirname, "routes");

function findSocketHandlerFiles(directory: string): void {
    if (!fs.existsSync(directory)) {
        console.warn(`Socket routes directory not found at ${directory}. Skipping automatic route loading.`);
        return;
    }

    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            findSocketHandlerFiles(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".js")) {
            // Look for .js files
            console.log(`Found potential socket handler file: ${fullPath}`);
            socketHandlerFiles.push(fullPath);
        }
    }
}

function applySocketHandlers(socket: Socket): void {
    // Removed async
    if (socketHandlerFiles.length === 0) {
        console.warn("No socket handler files were found to apply.");
        return;
    }

    for (const filePath of socketHandlerFiles) {
        try {
            const handlerModule = require(filePath); // Use require()

            // Check for default export or the module.exports itself
            const setupFunction = typeof handlerModule === "function" ? handlerModule : handlerModule.default;

            if (typeof setupFunction === "function") {
                setupFunction(socket);
            } else {
                console.warn(`File ${filePath} does not export a function as default or module.exports.`);
            }
        } catch (error) {
            console.error(`Error loading or applying socket handlers from ${filePath}:`, error);
        }
    }
}

function addIoRoutes(io: Server): void {
    findSocketHandlerFiles(routesDir);
    console.log(`Discovered ${socketHandlerFiles.length} potential socket handler files.`);

    io.on("connection", (socket: Socket) => {
        // Removed async
        console.log(green, "Socket Connected:", reset, socket.id);
        console.log(green, "Socket Handshake URL:", reset, socket.handshake.url);
        console.log(green, "Socket Handshake Time:", reset, socket.handshake.time);
        console.log(green, "Socket Handshake Host:", reset, socket.handshake.headers.host);

        applySocketHandlers(socket); // Call synchronously

        socket.on("disconnect", (reason: DisconnectReason) => console.log(`Socket disconnected: ${socket.id} (${reason})`));
    });

    console.log("Socket.IO connection handler established. Loading routes dynamically on connection.");
}

app.prepare().then(() => {
    const httpServer: HttpServer = createServer(handler as any);
    const io: Server = new Server(httpServer);

    addIoRoutes(io);

    const nextVersion: string = getNextVersion();
    const networkAddress: string | null = getNetworkAddress();

    console.log(`\n  ${bright}▲${reset} ${bold}Next.js${reset} ${nextVersion} ${dev ? "(Custom Server, Turbopack)" : "(Custom Server, Production)"}`);
    console.log(`  ${dim}-${reset} ${bold}Local:${reset}     ${green}http://${hostname}:${port}${reset}`);
    if (networkAddress) {
        console.log(`  ${dim}-${reset} ${bold}Network:${reset}   ${green}http://${networkAddress}:${port}${reset}`);
    } else {
        console.log(`  ${dim}-${reset} ${bold}Network:${reset}   ${dim}unavailable${reset}`);
    }
    console.log("\n");

    httpServer
        .once("error", (err: Error) => {
            console.error(`HTTP server error:`, err);
            process.exit(1);
        })
        .listen(port, () => {});
});

process.on("uncaughtException", (err: Error) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason: {} | null | undefined, promise: Promise<any>) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
