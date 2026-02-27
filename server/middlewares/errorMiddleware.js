import logger from '../logger/index.js';
import config from '../config/index.js';

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  logger.error('Request error', {
    message: err.message,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    ...(config.isDev && { stack: err.stack }),
  });

  res.status(statusCode).json({
    success: false,
    message,
    stack: config.isProd ? null : err.stack,
  });
};