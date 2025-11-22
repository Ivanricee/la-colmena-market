import { Redis } from "@upstash/redis";
import {
  UPSTASH_REDIS_REST_TOKEN,
  UPSTASH_REDIS_REST_URL,
} from "astro:env/server";

export const redisClient = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});
export const REDIS_ID = "queued:qstach-job-id";
export const getRedisLastQueuedQStachJobId = async () => {
  return await redisClient.get(REDIS_ID);
};
export const setRedisQueueQStachJobId = async (qstachJobId: string) => {
  return await redisClient.set(REDIS_ID, String(qstachJobId));
};
