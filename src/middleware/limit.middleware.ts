import { Context, Next } from "koa";
import { FireError, ManyRequestError } from "../util/error";
import rateLimit from "koa-ratelimit";
import { getRedisService, rateLimitRedis } from "../util/redis";
import CircuitBreaker from "opossum";
import { logger } from "../util/log";
import { env } from "../util/env";
const rateLimitMap = new Map<string, { tokens: number; last: number }>();
/**
 * Middleware to enforce rate limiting using a token bucket algorithm.
 *
 * @param options - Configuration options for the rate limiter.
 * @param options.tokensPerInterval - Number of tokens to refill in each interval.
 * @param options.interval - Time in milliseconds for each refill interval.
 *
 * @returns A Koa middleware function that checks and updates the token bucket for each request.
 *
 * The middleware allows a specific number of requests from a client within a defined interval.
 * If the client exceeds the allowed number of requests, a ManyRequestError is thrown.
 * Each client is identified by their IP address.
 */
interface limitOption {
  tokensPerInterval: number;
  interval: number;
}
export function rateLimitMiddleware(options: limitOption) {
  return async (ctx: Context, next: Next) => {
    const key = ctx.ip;
    const now = Date.now();
    const bucket = rateLimitMap.get(key) || {
      tokens: options.tokensPerInterval,
      last: now,
    };

    const elapsed = now - bucket.last;
    const refill = Math.floor(elapsed / options.interval);
    if (refill > 0) {
      bucket.tokens = Math.min(
        options.tokensPerInterval,
        bucket.tokens + refill
      );
      bucket.last = now;
    }

    if (bucket.tokens > 0) {
      bucket.tokens -= 1;
      rateLimitMap.set(key, bucket);
      await next();
      return;
    }
    throw new ManyRequestError("Too Many Requests");
  };
}

//验证码组件限流
export const capychaMiddleware = async (ctx: Context, next: Next) => {
  try {
    const maxCount = env.captcha.maxCount;
    const seconds = env.captcha.second;
    const ip = ctx.ip || ctx.request.ip;
    const key = `limit:ip:${ip}`;
    const redisService = getRedisService();
    const current = await redisService.incr(key);

    if (current === 1) {
      // 第一次，需要设置过期时间
      await redisService.expire(key, seconds);
    }

    if (current > maxCount) {
      logger().warn({
        event: "验证码组件限流",
        message: `${ip}请求太频繁，请稍后重试`,
      });
      throw new ManyRequestError("请求太频繁，请稍后重试");
    }
    await next();
  } catch (error: any) {
    throw error;
  }
};

// export const rateLimitByRedis = rateLimit({
//   driver: "redis",
//   db: rateLimitRedis,
//   duration: 60000, // 1 分钟内
//   errorMessage: "请求太频繁，请稍后重试。",
//   id: (ctx: Context) => ctx.ip,
//   max: 2, // 每分钟最多10次请求
//   disableHeader: false,
// });

// 熔断器配置（包装业务逻辑）
const breakerOptions = {
  timeout: 3000, // 调用超时
  errorThresholdPercentage: 50, // 错误率达到 50% 时触发熔断
  resetTimeout: 10000, // 熔断 10 秒后尝试恢复
};

// 你可以传入任何异步服务函数，比如远程调用、数据库请求等
export function circuitBreakerMiddleware(
  serviceFn: (ctx: Context) => Promise<any>
) {
  const breaker = new CircuitBreaker(serviceFn, breakerOptions);

  // 错误日志监听
  breaker.on("open", () =>
    logger().info({ event: "熔断器open", message: "熔断器打开✅" })
  );
  breaker.on("halfOpen", () =>
    logger().warn({ event: "熔断器halfOpen", message: "熔断器半开⚠️" })
  );
  breaker.on("close", () =>
    logger().error({ event: "熔断器close", message: "熔断器关闭❌" })
  );

  // 返回中间件
  return async (ctx: Context, next: Next) => {
    try {
      ctx.body = await breaker.fire(ctx);
    } catch (err: any) {
      throw new FireError(`${err.message},服务暂不可用（熔断保护）`);
    }
    await next();
    return;
  };
}
