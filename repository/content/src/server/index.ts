import * as http from "http";
import YouTubeDLX from "../index";
import { WebSocketServer, WebSocket } from "ws";
const port = 8080;
const server = http.createServer();
const wss = new WebSocketServer({ server });
console.log(`WebSocket server starting on port ${port}`);
wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");
  ws.on("message", async (message: string) => {
    let request: any;
    try {
      request = JSON.parse(message);
      if (!request.action || !request.requestId) {
        ws.send(JSON.stringify({ requestId: request.requestId, status: "error", event: "error", payload: { message: "Invalid message format: missing action or requestId" } }));
        return;
      }
      const { action, params, requestId } = request;
      let routeFunction: any;
      const actionParts = action.split(".");
      let currentLevel: any = YouTubeDLX;
      for (const part of actionParts) {
        if (currentLevel && currentLevel[part]) {
          currentLevel = currentLevel[part];
        } else {
          routeFunction = undefined;
          break;
        }
      }
      routeFunction = currentLevel;
      if (typeof routeFunction !== "function") {
        ws.send(JSON.stringify({ requestId, status: "error", event: "error", payload: { message: `Unknown action: ${action}` } }));
        return;
      }
      try {
        const emitter = routeFunction(params || {});
        emitter.on("start", (data: any) => {
          ws.send(JSON.stringify({ requestId, status: "in_progress", event: "start", payload: data }));
        });
        emitter.on("progress", (data: any) => {
          ws.send(JSON.stringify({ requestId, status: "in_progress", event: "progress", payload: data }));
        });
        emitter.on("data", (data: any) => {
          ws.send(JSON.stringify({ requestId, status: "completed", event: "data", payload: data }));
        });
        emitter.on("end", (data: any) => {
          ws.send(JSON.stringify({ requestId, status: "completed", event: "end", payload: data }));
        });
        emitter.on("metadata", (data: any) => {
          ws.send(JSON.stringify({ requestId, status: "in_progress", event: "metadata", payload: data }));
        });
        emitter.on("stream", (data: any) => {
          ws.send(JSON.stringify({ requestId, status: "in_progress", event: "stream", payload: data }));
        });
        emitter.on("error", (error: any) => {
          ws.send(JSON.stringify({ requestId, status: "error", event: "error", payload: { message: error.message || error } }));
        });
      } catch (error: any) {
        ws.send(JSON.stringify({ requestId, status: "error", event: "error", payload: { message: error.message || error } }));
      }
    } catch (error: any) {
      ws.send(JSON.stringify({ requestId: request?.requestId, status: "error", event: "error", payload: { message: `Failed to parse message: ${error.message}` } }));
    }
  });
  ws.on("close", () => console.log("Client disconnected"));
  ws.on("error", (error: Error) => console.error(`WebSocket error: ${error}`));
});
server.listen(port, () => console.log(`WebSocket server is listening on port ${port}`));
