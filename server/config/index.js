import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from server root (parent of config/)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';
const isDev = NODE_ENV === 'development';

/**
 * Required env vars for runtime. Missing in production will throw.
 * In development, defaults are used where safe.
 */
const required = [
  'MONGO_URI',
];

const optionalDefaults = {
  PORT: 5000,
  NODE_ENV: 'development',
  FRONTEND_URL_DEV: 'http://localhost:5173',
  FRONTEND_URL_PROD: '',
  MINIO_ENDPOINT: '127.0.0.1',
  MINIO_PORT: '9000',
  MINIO_BUCKET_NAME: 'inkcuba-portfolios',
  JWT_ACCESS_EXPIRY: '7d',
  JWT_REFRESH_EXPIRY: '30d',
  EMAIL_VERIFY_EXPIRY_HOURS: '24',
  PASSWORD_RESET_EXPIRY_HOURS: '1',
};

function getEnv(name) {
  const value = process.env[name];
  if (value !== undefined && value !== '') return value;
  if (optionalDefaults[name] !== undefined) return optionalDefaults[name];
  return undefined;
}

function validateConfig() {
  const missing = required.filter((key) => !getEnv(key));
  if (missing.length > 0 && isProd) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  if (missing.length > 0 && isDev) {
    console.warn(`[config] Missing optional env in development: ${missing.join(', ')}`);
  }
}

validateConfig();

const config = {
  env: NODE_ENV,
  isProd,
  isDev,
  port: parseInt(getEnv('PORT'), 10) || 5000,
  mongo: {
    uri: getEnv('MONGO_URI'),
  },
  frontend: {
    url: isProd ? getEnv('FRONTEND_URL_PROD') : getEnv('FRONTEND_URL_DEV'),
  },
  minio: {
    endPoint: getEnv('MINIO_ENDPOINT') || '127.0.0.1',
    port: parseInt(getEnv('MINIO_PORT'), 10) || 9000,
    useSSL: isProd,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucketName: getEnv('MINIO_BUCKET_NAME') || 'inkcuba-portfolios',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
  jwt: {
    secret: process.env.JWT_SECRET || (isProd ? null : 'dev-secret-change-in-production'),
    accessExpiry: getEnv('JWT_ACCESS_EXPIRY') || '7d',
    refreshExpiry: getEnv('JWT_REFRESH_EXPIRY') || '30d',
  },
  auth: {
    emailVerifyExpiryHours: parseInt(getEnv('EMAIL_VERIFY_EXPIRY_HOURS'), 10) || 24,
    passwordResetExpiryHours: parseInt(getEnv('PASSWORD_RESET_EXPIRY_HOURS'), 10) || 1,
  },
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
  },
};

if (isProd && !config.jwt.secret) {
  throw new Error('JWT_SECRET is required in production');
}

export default config;
