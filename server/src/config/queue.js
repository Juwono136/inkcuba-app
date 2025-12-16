import { Queue } from "bullmq";
import logger from "../utils/logger.js";

// Konfigurasi koneksi Redis untuk BullMQ
const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
};

// Buat Antrian bernama 'user-processing'
export const userQueue = new Queue("user-processing", { connection });

// Event Listener untuk Debugging
userQueue.on("error", (err) => {
  logger.error(`Queue Error: ${err.message}`);
});

logger.info("🚀 User Queue initialized");
