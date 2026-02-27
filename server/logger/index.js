import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from '../config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { combine, timestamp, printf, colorize } = winston.format;

const logDir = path.resolve(__dirname, '..', 'logs');
const isProd = config.isProd;

const logFormat = printf(({ level, message, timestamp: ts, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} [${level}] ${message}${metaStr}`;
});

const transports = [
  new winston.transports.Console({
    format: combine(
      colorize({ all: true }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      logFormat
    ),
  }),
];

// In production, also log to file for monitoring and auditing
if (isProd) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    })
  );
}

const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  defaultMeta: { service: 'inkcuba-api' },
  transports,
});

// Ensure log directory exists in production (for file transports)
export function ensureLogDir() {
  if (isProd && !fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

export default logger;
