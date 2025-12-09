import "dotenv/config";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import logger from "./src/utils/logger.js";
import "./src/config/redis.js";

// Handle Uncaught Exception (Synchronous coding error)
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! Shutting down...");
  logger.error(err.name, err.message);
  process.exit(1);
});

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle Unhandled Rejection (Uncaught Promise/Async errors)
process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! Shutting down...");
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
