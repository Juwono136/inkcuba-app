import { createClient } from "redis";
import logger from "../utils/logger.js";

// Get the value from env, if it is not there (undefined), use the default 'localhost' and '6379'
const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = process.env.REDIS_PORT || "6379";

const redisClient = createClient({
  url: `redis://${redisHost}:${redisPort}`,
});

redisClient.on("error", (err) => logger.error("Redis Client Error", err));
redisClient.on("connect", () => logger.info("Redis Client Connected"));

try {
  await redisClient.connect();
} catch (error) {
  logger.error(`Failed to connect to Redis: ${error.message}`);
}

export default redisClient;
