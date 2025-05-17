var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

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
var socketHandlerFiles = [];
var routesDir = path.join(process.cwd(), "routes");
function findSocketHandlerFiles(directory) {
  if (!fs.existsSync(directory)) {
    console.warn(`Socket routes directory not found: ${directory}. Skipping automatic route loading.`);
    return;
  }
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) findSocketHandlerFiles(fullPath);
    else if (entry.isFile()) {
      const isHandlerFile = entry.name.endsWith(".js") || dev && entry.name.endsWith(".ts");
      if (isHandlerFile) {
        console.log(`Found potential socket handler file: ${fullPath}`);
        socketHandlerFiles.push(fullPath);
      }
    }
  }
}
function applySocketHandlers(socket) {
  if (socketHandlerFiles.length === 0) {
    console.warn("No socket handler files were found to apply.");
    return;
  }
  for (const filePath of socketHandlerFiles) {
    try {
      const handlerModule = __require(filePath);
      const setupFunction = typeof handlerModule === "function" ? handlerModule : handlerModule.default;
      if (typeof setupFunction === "function") setupFunction(socket);
      else console.warn(`File ${filePath} does not export a default function.`);
    } catch (error) {
      console.error(`Error loading or applying socket handlers from ${filePath}:`, error);
    }
  }
}
function addIoRoutes(io) {
  findSocketHandlerFiles(routesDir);
  console.log(`Discovered ${socketHandlerFiles.length} potential socket handler files.`);
  io.on("connection", (socket) => {
    console.log(green, "Socket Connected:", reset, socket.id);
    console.log(green, "Socket Handshake URL:", reset, socket.handshake.url);
    console.log(green, "Socket Handshake Time:", reset, socket.handshake.time);
    console.log(green, "Socket Handshake Host:", reset, socket.handshake.headers.host);
    applySocketHandlers(socket);
    socket.on("disconnect", (reason) => console.log(`Socket disconnected: ${socket.id} (${reason})`));
  });
  console.log("Socket.IO connection handler established. Loading routes dynamically on connection.");
}
app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);
  addIoRoutes(io);
  const nextVersion = getNextVersion();
  const networkAddress = getNetworkAddress();
  console.log(`
 \xA0${bright}\u25B2${reset} ${bold}Next.js${reset} ${nextVersion} ${dev ? "(Custom Server, Turbopack)" : "(Custom Server, Production)"}`);
  console.log(` \xA0${dim}-${reset} ${bold}Local:${reset} \xA0 \xA0 ${green}http://${hostname}:${port}${reset}`);
  if (networkAddress) console.log(` \xA0${dim}-${reset} ${bold}Network:${reset} \xA0 ${green}http://${networkAddress}:${port}${reset}`);
  else console.log(` \xA0${dim}-${reset} ${bold}Network:${reset} \xA0 ${dim}unavailable${reset}`);
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
