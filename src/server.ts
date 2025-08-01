import app from "./app";
import dotenv from "dotenv";
import Koa from "koa";
import http from "http";
import { initWebSocket } from "./ws";
import { ServerConfig } from "./util/env";
import "reflect-metadata";
import { initRedis } from "./util/redis";
import { initLogger, logger } from "./util/log";
import { initMySQL, initPostgre } from "./util/orm";
import { getLocalIp, getPublicIp } from "./util/crypto";
const PORT = ServerConfig.PORT;
class StartServer {
  private server: http.Server;
  private app: Koa;
  private port: string;
  constructor(app: Koa, port: string) {
    this.app = app;
    this.port = port;
    this.server = http.createServer(this.app.callback());
    this.init();
  }
  private async init() {
    initWebSocket(this.server);
    initLogger({ name: "mainServer", id: "mainID", context: "mainContext" });
    initRedis(); //连接redis
    // initMySQL(); //连接mysql
    initPostgre(); //连接postgre
    this.server.listen(this.port, async () => {
      logger().info({
        event: "http server success",
        message: `server running at - Local: http://localhost:${this.port} 🚀 - LAN: http://${getLocalIp()}:${this.port} 🚀  - Public: http://${await getPublicIp()}:${this.port} 🚀`,
      });
      logger().info({
        event: "websocket server success",
        message: `🚀 websocket Server running ${this.port}`,
      });
    });
  }
  
}
new StartServer(app, PORT!);
