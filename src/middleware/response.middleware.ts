import { Context, Next } from "koa";
import {
  CustomError,
  FireError,
  ForbiddenError,
  ManyRequestError,
  UnauthorizedError,
  ValidateParamsError,
} from "../util/error";
import { logger } from "../util/log";
import { LogRepository } from "../orm/repository/exam";
import { logData } from "../util/key";
export async function responseFormatter(ctx: Context, next: Next) {
  let logData: logData = {
    level: "",
    message: "",
    role: "",
    path: ctx.path,
    method: ctx.method,
    userId: "",
    resStatus: 0,
  };
  try {
    await next();
    // 是否跳过格式化（导出文件等场景）
    const skip = ctx.state.skipFormat || Buffer.isBuffer(ctx.body);
    if (!skip) {
      // 如果已经有响应体，自动包装成统一格式
      if (ctx.body !== undefined && ctx.status === 200) {
        ctx.body = {
          code: 0,
          message: "success",
          data: ctx.body,
          success: true,
        };
      } else {
        logger().warn({
          event: "请求路由异常状态码捕捉",
          message: String(ctx.status),
        });
        ctx.status = ctx.status;
        ctx.body = {
          code: -1,
          message: "请求异常,请检查后重试",
          data: null,
          success: false,
        };
      }
      logger().info({
        event: "响应日志",
        message: "success",
      });
      logData.level = "info";
      logData.message = "请求成功";
      logData.role = ctx.state.account?.role || "游客登录";
      logData.userId = ctx.state.account?.id || 0;
      logData.resStatus = ctx.status;
      await LogRepository.create(logData);
    }
  } catch (err: any) {
    if (err instanceof CustomError) {
      logger().warn({ event: "全局非系统错误捕捉日志输出", error: err });
      // 捕获自定义错误，返回200状态并封装错误信息
      ctx.status = 200;
      ctx.body = {
        code: err.status || -1,
        message: `${err.message}` || "Custom error occurred",
        data: null,
        success: false,
      };
    } else if (
      err instanceof UnauthorizedError ||
      err instanceof ManyRequestError ||
      err instanceof ForbiddenError ||
      err instanceof ValidateParamsError ||
      err instanceof FireError
    ) {
      logger().warn({ event: "全局非系统错误捕捉日志输出", error: err });
      // 捕获自定义错误，返回200状态并封装错误信息
      ctx.status = err.status;
      ctx.body = {
        code: err.status || -1,
        message: `${err.message}` || "Unauthorized error occurred",
        data: null,
        success: false,
      };
    } else {
      logger().error({ event: "全局系统错误捕捉日志输出", error: err });
      // 系统错误，设置真实的HTTP状态码
      ctx.status = err.status || 500;
      ctx.body = {
        code: -1,
        message: err.message || "Internal Server Error",
        data: null,
        success: false,
      };
    }
    logData.level = "error";
    logData.error = JSON.stringify(err) || err.message;
    logData.role = ctx.state.account?.role || "游客登录";
    logData.userId = ctx.state.account?.id || 0;
    logData.resStatus = ctx.status;
    await LogRepository.create(logData);
  }
}
