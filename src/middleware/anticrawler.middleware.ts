// middleware/antiCrawler.ts
import { Context, Next } from "koa";
import { ForbiddenError } from "../util/error";
import { env } from "../util/env";

export async function antiCrawlerMiddleware(ctx: Context, next: Next) {
  const userAgent = ctx.headers["user-agent"] || "";
  const blacklist = ["wget", "python", "scrapy", "httpclient", "curl"]; //'curl'

  const isBot = blacklist.some((ua) => userAgent.toLowerCase().includes(ua));
  if (isBot) {
    throw new ForbiddenError(`禁止以下${blacklist}请求访问,请使用浏览器访问`);
    // ctx.status = 403;
    // ctx.body = 'Access Denied';
    // return;
  }

  await next();
}

export async function apiKeyMiddleware(ctx: Context, next: Next) {
  const key = ctx.headers["x-api-key"] || "";
  if (key !== env.APIKEY) {
    throw new ForbiddenError("无效的API密钥");
  }

  await next();
}
