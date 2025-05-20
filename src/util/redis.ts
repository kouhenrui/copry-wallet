import Redis from "ioredis";
import { env } from "./env";
import { logger } from "./log";
export class redisClient {
  private client: Redis;
  constructor() {
    this.client = new Redis({
      host: env.redis.default.host, //"127.0.0.1",
      port: env.redis.default.port, //6379,
      ...(env.redis.default.username
        ? { username: env.redis.default.username }
        : {}), //三元运算长版写法
      ...(env.redis.default.password
        ? { password: env.redis.default.password }
        : {}),
      // ...(env.redis.default.username && {
      //   username: env.redis.default.username,
      // }), //三元运算精简版写法
      // ...(env.redis.default.password && {
      //   password: env.redis.default.password,
      // }),
      db: env.redis.default.db, //0, // 可切换不同 db
      retryStrategy: (times) => {
        // 连接失败时，重连的时间间隔（ms）
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
      // reconnectOnError: (err) => {
      //   const targetError = "READONLY";
      //   if (err.message.includes(targetError)) {
      //     // 出现指定错误时才重连
      //     return true;
      //   }
      //   return false;
      // },
    });

    this.client.on("connect", () => {
      logger().info({ event: "redis connected", message: "🌴 redis connected" });
      // console.log("Redis connected");
    });

    this.client.on("error", (err) => {
      logger().error({ event: "redis connected error", error: err });
      // console.error("Redis connected error:", err);
      process.exit(1);
    });
  }

  // 基础 set
  async set(key: string, value: any, ttlSeconds?: number): Promise<string> {
    const data = typeof value === "string" ? value : JSON.stringify(value);
    if (ttlSeconds) {
      return this.client.set(key, data, "EX", ttlSeconds);
    }
    return this.client.set(key, data);
  }

  // 基础 get
  async get<T = any>(key: string): Promise<T | null> {
    const val = await this.client.get(key);
    if (!val) return null;
    try {
      return JSON.parse(val) as T;
    } catch {
      return val as unknown as T;
    }
  }
  async setCache(key: string, value: any): Promise<void> {
    await this.client.set(key, JSON.stringify(value));
  }

  async setCacheEx(key: string, value: any, ttl = 3600): Promise<void> {
    await this.client.set(key, JSON.stringify(value), "EX", ttl);
  }

  async getCache(key: string): Promise<any | null> {
    if ((await this.existCache(key)) === false) return null;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async existCache(key: string): Promise<boolean> {
    const data = await this.client.exists(key);
    if (data) return true;
    return false;
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  // 发布订阅（适用于广播）
  async publish(channel: string, message: string): Promise<number> {
    return await this.client.publish(channel, message);
  }

  async subscribe(channel: string, handler: (message: string) => void) {
    const sub = new Redis();
    sub.subscribe(channel);
    sub.on("message", (_, message) => {
      handler(message);
    });
    return sub;
  }

  // geo 添加地理位置
  async geoAdd(
    key: string,
    longitude: number,
    latitude: number,
    member: string
  ): Promise<number> {
    return await this.client.geoadd(key, longitude, latitude, member);
  }

  async geoRadius(
    key: string,
    longitude: number,
    latitude: number,
    radius: number,
    unit: "m" | "km" = "km"
  ): Promise<any> {
    return await this.client.georadius(
      key,
      longitude,
      latitude,
      radius,
      unit,
      "WITHDIST"
    );
  }

  async hashSet(
    key: string,
    field: string,
    value: string | number
  ): Promise<number> {
    return await this.client.hset(key, field, value.toString());
  }

  async hashGet(key: string, field: string): Promise<string | null> {
    return await this.client.hget(key, field);
  }

  async hashDel(key: string, field: string): Promise<number> {
    return await this.client.hdel(key, field);
  }

  async hashKeys(key: string): Promise<string[]> {
    return await this.client.hkeys(key);
  }

  /**
   * 自增 + 设置过期时间（如果是第一次）
   * @param key Redis Key
   * @param expireSeconds 过期时间（秒）
   * @returns 当前的值
   */
  async incrWithExpire(key: string, expireSeconds: number): Promise<number> {
    const current = await this.client.incr(key);

    if (current === 1) {
      await this.client.expire(key, expireSeconds);
    }

    return current;
  }

  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<number | null> {
    if (await this.client.exists(key)) {
      return await this.client.expire(key, seconds);
    }
    return null;
  }

  getClient() {
    return this.client;
  }
}

let redisService: redisClient;

export const initRedis = () => {
  if (!redisService) redisService = new redisClient();
  return redisService;
};

export const getRedisService = () => {
  if (!redisService) initRedis();
  return redisService;
};

export const rateLimitRedis = new Redis({
  host: env.redis.default.host, //"127.0.0.1",
  port: env.redis.default.port, //6379,
  ...(env.redis.default.username && {
    username: env.redis.default.username,
  }), //三元运算精简版写法
  ...(env.redis.default.password && {
    password: env.redis.default.password,
  }),
  db: 1,
});
