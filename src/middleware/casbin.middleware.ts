import { Context, Next } from "koa";
import casbinService from "../service/casbin.service";
import { ForbiddenError } from "../util/error";

export async function casbinMiddleware(ctx: Context, next: Next) {
  const user = ctx.state.user; // 假设 JWT 中间件已解析用户信息
  if (user) {
    const subject = user?.role || "anonymous"; // 权限角色
    const object = ctx.path;
    const action = ctx.method.toLowerCase();
    const pass = await casbinService.enforce(subject, object, action);
    if (!pass) throw new ForbiddenError("无权访问");
  }

  await next();
}
