import logger from "../utils/logger.js";

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Error log to file system (Winston)
  logger.error(
    `${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    // Show stack trace only in development mode
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default globalErrorHandler;
