import { Worker } from "bullmq";
import User from "../models/User.js";
import crypto from "crypto";
import { sendNewUserCredentials } from "../services/emailService.js";
import logger from "../utils/logger.js";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
};

// Worker ini akan memproses setiap "Job" yang masuk ke antrian 'user-processing'
const userWorker = new Worker(
  "user-processing",
  async (job) => {
    const { name, email, role, academicInfo } = job.data;

    try {
      // 1. Cek apakah user sudah ada
      const exists = await User.findOne({ email });
      if (exists) {
        logger.warn(`Skipping duplicate user: ${email}`);
        return { status: "skipped", email, reason: "Duplicate" };
      }

      // 2. Generate Password Acak
      const generatedPassword = crypto.randomBytes(8).toString("hex") + "A1!";

      // 3. Create User di DB
      const newUser = await User.create({
        name,
        email,
        role: role || "student", // Default student jika kosong
        academicInfo: academicInfo || {},
        password: generatedPassword,
        isFirstLogin: true,
      });

      // 4. Kirim Email (Ini yang berat, makanya ditaruh di background)
      await sendNewUserCredentials(email, name, generatedPassword, newUser.role);

      logger.info(`User created via Bulk: ${email}`);
      return { status: "success", email };
    } catch (error) {
      logger.error(`Failed processing user ${email}: ${error.message}`);
      // Lempar error agar BullMQ tahu job ini gagal (bisa diset retry otomatis)
      throw error;
    }
  },
  {
    connection,
    concurrency: 5, // Memproses 5 user sekaligus secara paralel (bisa dinaikkan sesuai spek server)
  }
);

export default userWorker;
