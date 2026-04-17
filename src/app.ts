import Koa from "koa";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import router from "./route";
import koaHelmet from "koa-helmet";
import { responseFormatter } from "./middleware/response.middleware";
import { LoggerMiddleware } from "./middleware/logger.middleware";
import authMiddleware from "./middleware/auth.middleware";
import { rateLimitMiddleware } from "./middleware/limit.middleware";
import { antiCrawlerMiddleware, apiKeyMiddleware } from "./middleware/anticrawler.middleware";
import { logger } from "./util/log";
import { koaSwagger } from "koa2-swagger-ui";
import { swaggerSpec } from "./util/swagger";
const app = new Koa();

app.use(cors());//跨域
app.use(bodyParser());//解析post请求
app.use(LoggerMiddleware); //日志中间件
app.use(responseFormatter); //全局异常捕捉和格式化返回
app.use(koaHelmet());//安全中间件 跨站脚本（XSS）、点击劫持、MIME 类型嗅探等

// Swagger UI 配置 - 放在认证中间件之前，避免需要认证才能访问文档
app.use(
  koaSwagger({
    routePrefix: '/swagger', // Swagger UI 访问路径
    swaggerOptions: {
      spec: swaggerSpec,
    },
  })
);

app.use(rateLimitMiddleware({ tokensPerInterval: 50, interval: 1000 }));//基于令牌桶的限流
app.use(apiKeyMiddleware);//API密钥
app.use(authMiddleware); //权限中间件
app.use(antiCrawlerMiddleware);//防爬虫
app.use(router.routes()).use(router.allowedMethods());

// 全局错误处理（兜底处理）
app.on('error', (err, ctx) => {
  logger().error({
    event: "serverError",
    message: "未捕获的服务器错误",
    error: err,
  });
  
  // 如果响应还没有发送，则发送错误响应
  if (!ctx.res.headersSent) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      code: 500,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '服务器内部错误',
        timestamp: new Date().toISOString()
      }
    };
  }
});
// 优雅关闭
const gracefulShutdown = (signal: string) => {
  logger().info({ event: "shutdown", message: signal });
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
export default app;
