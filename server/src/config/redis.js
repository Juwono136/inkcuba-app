import { createClient } from "redis";
import logger from "../utils/logger.js";

const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = process.env.REDIS_PORT || "6379";
const redisPassword = process.env.REDIS_PASSWORD;

// If there is a password: redis://:password@host:port
// If there is none: redis://host:port
const redisUrl = redisPassword
  ? `redis://:${redisPassword}@${redisHost}:${redisPort}`
  : `redis://${redisHost}:${redisPort}`;

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("error", (err) => logger.error("Redis Client Error", err));

(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      logger.info("Redis Client Connected");
    }
  } catch (err) {
    logger.error("Failed to connect to Redis", err);
  }
})();

export default redisClient;
