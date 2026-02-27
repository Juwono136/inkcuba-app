import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';

const app = express();

// Security: HTTP headers
app.use(helmet());

// Request logging (development: verbose; production: minimal)
if (config.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS: single allowed origin per environment
app.use(
  cors({
    origin: config.frontend.url,
    credentials: true,
  })
);

// Rate limiting: DDoS / brute-force protection
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api', apiLimiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health / root
app.get('/', (req, res) => {
  res.send('Inkcuba API is running...');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRoutes);

// 404 and global error handler (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
