import { WebSocketService } from "./pool";
import http from "http";
// export function setupWebSocket(server: http.Server) {
//   const wss = new WebSocketServer({ server });

//   wss.on("connection", (ws) => {
//     console.log("🟢 Client connected");

//     ws.on("message", (data) => {
//       handleMessage(ws, data.toString());
//     });

//     ws.on("close", () => {
//       console.log("🔴 Client disconnected");
//     });

//     ws.send(
//       JSON.stringify({
//         event: "connected",
//         message: "Welcome to Crypto Wallet WS",
//       })
//     );
//   });
// }

let wsService: WebSocketService;

export const initWebSocket = (server: http.Server) => {
  wsService = new WebSocketService(server);
};

export const getWebSocketService = () => wsService;
