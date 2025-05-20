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
const app = new Koa();

app.use(cors());//跨域
app.use(bodyParser());//解析post请求
app.use(LoggerMiddleware); //日志中间件
app.use(responseFormatter); //全局异常捕捉和格式化返回
app.use(koaHelmet());//安全中间件 跨站脚本（XSS）、点击劫持、MIME 类型嗅探等
app.use(rateLimitMiddleware({ tokensPerInterval: 50, interval: 1000 }));//基于令牌桶的限流
app.use(apiKeyMiddleware);//API密钥
app.use(authMiddleware); //权限中间件
app.use(antiCrawlerMiddleware);//防爬虫
app.use(router.routes()).use(router.allowedMethods());
export default app;
