import config from './config/index.js';
import logger from './logger/index.js';
import { ensureLogDir } from './logger/index.js';
import connectDB, { mongoose } from './config/db.js';
import { initMinio } from './config/minio.js';
import app from './app.js';

ensureLogDir();

async function start() {
  try {
    await connectDB();
    await initMinio();
  } catch (err) {
    logger.error('Startup failure', { error: err.message });
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    logger.info(`Server running in ${config.env} mode on port ${config.port}`);
  });

  function shutdown(signal) {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(() => {
      logger.info('HTTP server closed');
      if (config.mongo?.uri && mongoose.connection?.readyState === 1) {
        mongoose.connection.close().then(() => {
          logger.info('MongoDB connection closed');
          process.exit(0);
        }).catch((err) => {
          logger.error('Error closing MongoDB', { error: err.message });
          process.exit(1);
        });
      } else {
        process.exit(0);
      }
    });

    const forceExit = setTimeout(() => {
      logger.warn('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
    if (forceExit.unref) forceExit.unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  logger.error('Unhandled startup error', { error: err.message, stack: err.stack });
  process.exit(1);
});
