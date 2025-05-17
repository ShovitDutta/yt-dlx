// launch.ts
import next from "next";
import os from "os";
import fs from "fs";
import path from "path";
import { Server } from "socket.io";
import { createServer } from "http";
console.clear();
var isProductionFlag = process.argv.includes("--production");
process.env.NODE_ENV = isProductionFlag ? "production" : process.env.NODE_ENV || "development";
var dev = process.env.NODE_ENV !== "production";
var hostname = process.env.HOSTNAME || "localhost";
var port = parseInt(process.env.PORT || "3000", 10);
var app = next({ dev, hostname, port, turbo: dev });
var handler = app.getRequestHandler();
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
  var _a;
  try {
    const packageJsonPath = path.resolve(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    return ((_a = packageJson.dependencies) == null ? void 0 : _a.next) || "unknown";
  } catch (err) {
    return "unknown";
  }
}
var bright = "\x1B[1m";
var green = "\x1B[32m";
var reset = "\x1B[0m";
var bold = "\x1B[1m";
var dim = "\x1B[2m";
function addIoRoutes(io) {
  io.on("connection", (socket) => {
    console.log(green, "Socket Connected:", reset, socket.id);
    console.log(green, "Socket Handshake URL:", reset, socket.handshake.url);
    console.log(green, "Socket Handshake Time:", reset, socket.handshake.time);
    console.log(green, "Socket Handshake Host:", reset, socket.handshake.headers.host);
    socket.on("message", (data) => console.log(`Received message from ${socket.id}:`, data));
    socket.on("disconnect", (reason) => console.log(`Socket disconnected: ${socket.id} (${reason})`));
  });
  console.log("Socket.IO routes initialized.");
}
app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);
  addIoRoutes(io);
  const nextVersion = getNextVersion();
  const networkAddress = getNetworkAddress();
  console.log(`
  ${bright}\u25B2${reset} ${bold}Next.js${reset} ${nextVersion} ${dev ? "(Custom Server, Turbopack)" : "(Custom Server, Production)"}`);
  console.log(`  ${dim}-${reset} ${bold}Local:${reset}     ${green}http://${hostname}:${port}${reset}`);
  if (networkAddress) {
    console.log(`  ${dim}-${reset} ${bold}Network:${reset}   ${green}http://${networkAddress}:${port}${reset}`);
  } else {
    console.log(`  ${dim}-${reset} ${bold}Network:${reset}   ${dim}unavailable${reset}`);
  }
  console.log("\n");
  httpServer.once("error", (err) => {
    console.error(`HTTP server error:`, err);
    process.exit(1);
  }).listen(port, () => {
  });
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
