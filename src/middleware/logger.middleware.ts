import { Context, Next } from "koa";
import { logger } from "../util/log";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ValidateParamsError } from "../util/error";
export const LoggerMiddleware = async (ctx: Context, next: Next) => {
  const body = ctx.request.body;
  logger().info({
    event: "请求路径和方法",
    message: `${ctx.method} ${ctx.url}`,
  });
  if (body && body != null && Object.keys(body).length > 0) {
    logger().info({
      event: "请求参数",
      message: `${JSON.stringify(body)}`,
    });
  }

  await next();
};

export const ValidationMiddleware = (DtoClass: any) => {
  return async (ctx: Context, next: Next) => {
    const input: Object = plainToInstance(DtoClass, ctx.request.body);
    const errors = await validate(input);
    if (errors.length > 0) {
      const hasError = errors.map((e) => {
        const name=e.property;
        const err=e.constraints;
        return {name,err};
      });
      logger().error({
        event: "参数校验失败",
        message: JSON.stringify(hasError),
      });
      throw new ValidateParamsError(
        JSON.stringify(hasError),
        Error(errors.toString())
      );
      // ctx.throw(400, "参数校验失败", { details: errors });
    }
    await next();
  };
};
