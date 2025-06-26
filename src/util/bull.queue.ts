import Bull, { Job, JobOptions } from "bull";
import { ServerConfig } from "./env";
class BullQueue {
  static instance: BullQueue
  queue: Bull.Queue;
  constructor() {
    this.queue = new Bull("crypto_queue", {
      redis: {
        host: ServerConfig.redis.default.host,
        port: ServerConfig.redis.default.port,
        ...(ServerConfig.redis.default.username && {
          username: ServerConfig.redis.default.username,
        }), //三元运算精简版写法
        ...(ServerConfig.redis.default.password && {
          password: ServerConfig.redis.default.password,
        }),
      },
    });
  }
  static getInstance(): BullQueue {
    if (!BullQueue.instance) {
      BullQueue.instance = new BullQueue();
    }
    return BullQueue.instance;
  }
  async getQueue(queueID:string){
      return await this.queue.getJob(queueID);
  }

  async addJob(data: any, options?: JobOptions){
    return await this.queue.add(data, options);
  }

  process(handler: (job: Job<any>) => Promise<void>) {
    this.queue.process(handler);
  }
}
