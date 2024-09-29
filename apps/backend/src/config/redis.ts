import { Redis } from "@upstash/redis";
import {REDIS, REDIS_TOKEN} from './config'

const redis = new Redis({
  url: REDIS,
  token: REDIS_TOKEN,
});

export { redis };
