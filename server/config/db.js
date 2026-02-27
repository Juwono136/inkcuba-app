import mongoose from 'mongoose';
import config from './index.js';
import logger from '../logger/index.js';

const connectDB = async () => {
  if (!config.mongo?.uri) {
    logger.warn('MONGO_URI not set; skipping database connection');
    return;
  }
  try {
    const conn = await mongoose.connect(config.mongo.uri);
    logger.info('MongoDB connected', { host: conn.connection.host });
  } catch (error) {
    logger.error('MongoDB connection error', { error: error.message });
    throw error;
  }
};

export { mongoose };
export default connectDB;