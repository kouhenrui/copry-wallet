import { Context, Next } from "koa";
import { ServerConfig } from "../util/env";
import { verifyToken, whiteListRegex } from "../util/crypto";
import { getRedisService } from "../util/redis";
import { UnauthorizedError } from "../util/error";
const authMiddleware = async (ctx: Context, next: Next) => {
  const path = ctx.request.path;
  if (
    ServerConfig.jwt.whiteList.includes(path) ||
    (await whiteListRegex(path))
  ) {
    await next();
    return;
  }
  const token = ctx.request.headers.authorization;
  if (!token) throw new UnauthorizedError("缺少token");
  const redisService = getRedisService();
  const blackToken = `${ServerConfig.jwt.blackListPrefix}${token}`;
  if (await redisService.existCache(blackToken))
    throw new UnauthorizedError("该登录状态已被抛弃,请重新登陆获取状态");
  if (ctx.request.path === "/logout")
    await redisService.setCacheEx(blackToken, "1", 60 * 60 * 24);
  const replaceToken = token.replace("Bearer ", "");
  const account = await verifyToken(replaceToken);
  ctx.state.account = account;
  await next();
};

export default authMiddleware;
