import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../util/log";
// import { verifyToken } from "../utils/auth"; // 你可以自定义 token 验证逻辑
// import { registerRedisSubscriber } from "../redis/sub";
// import pub from "../redis/pub";
type ClientInfo = {
  id: string;
  ws: WebSocket;
  isAlive: boolean;
  userId?: string; // 可扩展
};
export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, ClientInfo> = new Map();
  private heartbeatInterval: NodeJS.Timeout;
  constructor(server: any, path = "/ws") {
    this.wss = new WebSocketServer({ server, path });
    this.init();
    //心跳连接
    this.heartbeatInterval = setInterval(() => this.checkHeartbeat(), 30000);
    // registerRedisSubscriber(this);
  }

  private init() {
    this.wss.on("connection", async (ws: any) => {
      const id = uuidv4();
      const client: ClientInfo = { id, ws, isAlive: true, userId: "123" };

      this.clients.set(id, client);

      ws.on("pong", () => this.handlePong(id));
      ws.on("message", (data: any) => {
        const msg = data.toString().trim();

        if (!msg) {
          // 👇 空消息不处理，但也不关闭连接
          console.log(`收到${id}空消息，忽略`);
          logger().error({
            event: "ws收到错误信息提示",
            message: `收到${id}空消息`,
            error: new Error("空消息"),
          });
          return;
        }
        this.handleMessage(id, msg);
      });
      ws.on("close", () => this.disconnect(id));
      ws.on("error", () => this.disconnect(id));

      this.onConnect(id);
    });
  }
  /**
   * Handle pong message from client, mark it as alive.
   * @param id - Client ID.
   */
  private handlePong(id: string) {
    const client = this.clients.get(id);
    if (client) client.isAlive = true;
  }
  /**
   * Heartbeat check, close the connection if no pong is received within 30s.
   * Send a ping to all connected clients to check if they are still alive.
   * If a client does not respond with a pong within 30s, it is considered
   * disconnected and the connection is closed.
   */
  private checkHeartbeat() {
    this.clients.forEach((client, id) => {
      if (!client.isAlive) {
        this.disconnect(id);
        return;
      }
      client.isAlive = false;
      client.ws.ping();
    });
  }

  public onConnect(id: string) {
    const client = this.clients.get(id);
    if (client)
      client.ws.send(
        JSON.stringify({
          event: "connected",
          message: "Welcome to connect WS",
        })
      );
  }

  public disconnect(id: string) {
    const client = this.clients.get(id);
    if (client) {
      client.ws.terminate(); // 确保断开
      this.clients.delete(id);
      console.log(`❌ Client disconnected: ${id}`);
    }
  }

  public sendToClient(id: string, message: string | object) {
    const client = this.clients.get(id);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(
        typeof message === "string" ? message : JSON.stringify(message)
      );
    }
  }

  public broadcast(message: string | object) {
    const msg = typeof message === "string" ? message : JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(msg);
      }
    });
  }

  public close() {
    clearInterval(this.heartbeatInterval);
    this.wss.close();
  }

  public getOnlineCount(): number {
    return this.clients.size;
  }

  public getClientIds(): string[] {
    return Array.from(this.clients.keys());
  }

  public bindUser(id: string, userId: string) {
    const client = this.clients.get(id);
    if (client) client.userId = userId;
  }

  public getClientByUserId(userId: string): ClientInfo | undefined {
    return Array.from(this.clients.values()).find((c) => c.userId === userId);
  }

  public sendToUser(userId: string, message: string | object) {
    const client = this.getClientByUserId(userId);
    if (client) {
      this.sendToClient(client.id, message);
    }
  }

  public handleMessage(id: string, msg: string) {
    const client = this.clients.get(id);
    if (!client) return;
    console.log("接收到消息为:", msg);
    logger().warn({ event: "websocket消息接收警告", message: msg });
    if (!msg.includes("{")) {
      client.ws.send(
        JSON.stringify({
          event: "auth_fail",
          id,
          message: "消息格式不正确,请检查后重新发送",
        })
      );
      // return;
    } else {
      const data = JSON.parse(msg);
      logger().info({ event: "websocket消息接收", data });
      client.ws.send(
        JSON.stringify({ event: "auth_success", id, message: data })
      );
    }
  }
}
