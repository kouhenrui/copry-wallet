import Redis from "ioredis";
import { getRedisService } from "../util/redis";

import { env } from "../util/env";

export class MessageService {
  private redis: any;
  constructor() {
    this.redis = getRedisService();
  }
  async saveMessage(userId: string, message: string) {
    const key = `${env.MESSAGE_KEY_PREFIX}${userId}`;
    const record = JSON.stringify({
      message,
      timestamp: Date.now(),
    });
    await this.redis.rpush(key, record);
  }

  async getMessages(userId: string) {
    const key = `${env.MESSAGE_KEY_PREFIX}${userId}`;
    const messages = await this.redis.lrange(key, 0, -1);
    return messages.map((msg: any) => JSON.parse(msg));
  }
}

export const messageService = new MessageService();
