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

// launch.ts
var import_next = __toESM(require("next"));
var import_node_os = __toESM(require("os"));
var import_node_fs = __toESM(require("fs"));
var import_colors = __toESM(require("colors"));
var import_node_path = __toESM(require("path"));
var import_yt_dlx = __toESM(require("yt-dlx"));
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
app.prepare().then(() => {
  const httpServer = (0, import_node_http.createServer)(handler);
  const io = new import_socket.Server(httpServer);
  io.on("connection", (socket) => {
    console.log(import_colors.default.green(`Socket Connected: [ID: ${socket.id}, URL: ${socket.handshake.url}, Time: ${socket.handshake.time}, Host: ${socket.handshake.headers.host}]`));
    socket.on("message", (data) => console.log(`Received message from ${socket.id}:`, data));
    socket.on("disconnect", (reason) => console.log(`Socket disconnected: ${socket.id} (${reason})`));
    socket.on("yt-dlx-command", async (data) => {
      const { command, options } = data;
      const commandParts = command.split(".");
      if (import_yt_dlx.default[command]) {
        const ytDlxFunction = commandParts.reduce((acc, part) => acc[part], import_yt_dlx.default);
        if (typeof ytDlxFunction === "function") {
          try {
            const resultEmitter = ytDlxFunction(options).on("data", (resultData) => socket.emit(`${command}-response`, { status: "success", data: resultData })).on("metadata", (resultData) => socket.emit(`${command}-response`, { status: "success", data: resultData })).on("error", (error) => socket.emit(`${command}-response`, { status: "error", message: error.message || error }));
            if (resultEmitter.on) resultEmitter.on("progress", (progressData) => socket.emit(`${command}-progress`, { progress: progressData }));
          } catch (error) {
            socket.emit(`${command}-response`, { status: "error", message: error.message || error });
          }
        } else socket.emit("yt-dlx-response", { command, status: "error", message: `Invalid yt-dlx command: ${command}` });
      } else socket.emit("yt-dlx-response", { command, status: "error", message: `Unknown yt-dlx command: ${command}` });
    });
  });
  console.log("Socket.IO routes initialized.");
  const nextVersion = getNextVersion();
  const networkAddress = getNetworkAddress();
  console.log(`
 \xA0${"\u25B2"} ${import_colors.default.bold("Next.js")} ${nextVersion} ${dev ? import_colors.default.dim("(Custom Server, Turbopack)") : import_colors.default.dim("(Custom Server, Production)")}`);
  console.log(` \xA0${import_colors.default.dim("-")} ${import_colors.default.bold("Local:")} \xA0 \xA0${import_colors.default.green(`http://${hostname}:${port}`)}`);
  if (networkAddress) console.log(` \xA0${import_colors.default.dim("-")} ${import_colors.default.bold("Network:")} \xA0${import_colors.default.green(`http://${networkAddress}:${port}`)}`);
  else console.log(` \xA0${import_colors.default.dim("-")} ${import_colors.default.bold("Network:")} \xA0${import_colors.default.dim("unavailable")}`);
  console.log("\n");
  httpServer.once("error", (err) => {
    console.error(import_colors.default.red(`HTTP server error:`), err);
    process.exit(1);
  }).listen(port, () => {
  });
});
process.on("uncaughtException", (err) => {
  console.error(import_colors.default.red("Uncaught Exception:"), err);
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error(import_colors.default.red("Unhandled Rejection at:"), promise, "reason:", reason);
  process.exit(1);
});
