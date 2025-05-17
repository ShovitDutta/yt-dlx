"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// routes/launch.ts
var import_next = __toESM(require("next"));
var import_node_os = __toESM(require("os"));
var import_node_fs = __toESM(require("fs"));
var import_node_path = __toESM(require("path"));
var import_socket = require("socket.io");
var import_node_http = require("http");
console.clear();
var isProductionFlag = process.argv.includes("--production");
process.env.NODE_ENV = isProductionFlag ? "production" : process.env.NODE_ENV || "development";
var dev = process.env.NODE_ENV !== "production";
var hostname = process.env.HOSTNAME || "localhost";
var port = parseInt(process.env.PORT || "3000", 10);
var app = (0, import_next.default)({ dev, hostname, port, turbo: dev });
var handler = app.getRequestHandler();
function getNetworkAddress() {
  const interfaces = import_node_os.default.networkInterfaces();
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
    const packageJsonPath = import_node_path.default.resolve(process.cwd(), "package.json");
    const packageJson = JSON.parse(import_node_fs.default.readFileSync(packageJsonPath, "utf-8"));
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
var routesDir = import_node_path.default.join(__dirname, "routes");
function findSocketHandlerFiles(directory) {
  if (!import_node_fs.default.existsSync(directory)) {
    console.warn(`Socket routes directory not found at ${directory}. Skipping automatic route loading.`);
    return;
  }
  const entries = import_node_fs.default.readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = import_node_path.default.join(directory, entry.name);
    if (entry.isDirectory()) {
      findSocketHandlerFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      console.log(`Found potential socket handler file: ${fullPath}`);
      socketHandlerFiles.push(fullPath);
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
      const handlerModule = require(filePath);
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
  const httpServer = (0, import_node_http.createServer)(handler);
  const io = new import_socket.Server(httpServer);
  addIoRoutes(io);
  const nextVersion = getNextVersion();
  const networkAddress = getNetworkAddress();
  console.log(`
 \xA0${bright}\u25B2${reset} ${bold}Next.js${reset} ${nextVersion} ${dev ? "(Custom Server, Turbopack)" : "(Custom Server, Production)"}`);
  console.log(` \xA0${dim}-${reset} ${bold}Local:${reset} \xA0 \xA0 ${green}http://${hostname}:${port}${reset}`);
  if (networkAddress) {
    console.log(` \xA0${dim}-${reset} ${bold}Network:${reset} \xA0 ${green}http://${networkAddress}:${port}${reset}`);
  } else {
    console.log(` \xA0${dim}-${reset} ${bold}Network:${reset} \xA0 ${dim}unavailable${reset}`);
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
