import Bull, { Job, JobOptions } from "bull";
import { env } from "./env";
class BullQueue {
  static instance: BullQueue;
  queue: Bull.Queue;
  constructor() {
    this.queue = new Bull("crypto_queue", {
      redis: {
        host: env.redis.default.host,
        port: env.redis.default.port,
        ...(env.redis.default.username && {
          username: env.redis.default.username,
        }), //三元运算精简版写法
        ...(env.redis.default.password && {
          password: env.redis.default.password,
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
