/**
 * Seed script: create initial admin user if none exists.
 * Usage: node seed.js
 * Env: SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME (optional)
 * In development, defaults are used if env vars are not set.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from './models/User.js';
import config from './config/index.js';
import logger from './logger/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const SEED_EMAIL = process.env.SEED_ADMIN_EMAIL || (config.isDev ? 'admin@inkcuba.binus.ac.id' : null);
const SEED_PASSWORD = process.env.SEED_ADMIN_PASSWORD || (config.isDev ? 'Admin@Inkcuba2025' : null);
const SEED_NAME = process.env.SEED_ADMIN_NAME || 'Inkcuba Admin';

async function seed() {
  if (!config.mongo?.uri) {
    logger.error('MONGO_URI not set. Cannot run seed.');
    process.exit(1);
  }
  if (!SEED_EMAIL || !SEED_PASSWORD) {
    logger.error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required (or use defaults in development).');
    process.exit(1);
  }

  try {
    await mongoose.connect(config.mongo.uri);
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      logger.info('Admin user already exists. Skipping seed.', { email: existingAdmin.email });
    } else {
      const admin = await User.create({
        name: SEED_NAME,
        email: SEED_EMAIL.toLowerCase().trim(),
        password: SEED_PASSWORD,
        role: 'admin',
        emailVerified: true,
        isActive: true,
      });
      logger.info('Admin user created.', { id: admin._id, email: admin.email });
    }
  } catch (err) {
    if (err.code === 11000) {
      logger.info('Admin with this email already exists. Skipping seed.');
    } else {
      logger.error('Seed failed', { error: err.message });
      process.exit(1);
    }
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
