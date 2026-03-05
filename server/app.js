import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import lecturerWorkspaceRoutes from './routes/lecturerWorkspaceRoutes.js';
import lecturerStudentRoutes from './routes/lecturerStudentRoutes.js';
import studentWorkspaceRoutes from './routes/studentWorkspaceRoutes.js';
import studentSubmissionRoutes from './routes/studentSubmissionRoutes.js';
import lecturerSubmissionRoutes from './routes/lecturerSubmissionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import { getAvatar, getPortfolioFile } from './controllers/uploadsController.js';

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

// Body parsing (higher limit for profile avatar base64)
app.use(express.json({ limit: '350kb' }));
app.use(express.urlencoded({ extended: true, limit: '350kb' }));

// Health / root
app.get('/', (req, res) => {
  res.send('Inkcuba API is running...');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/lecturer/workspaces', lecturerWorkspaceRoutes);
app.use('/api/lecturer/students', lecturerStudentRoutes);
app.use('/api/student/workspaces', studentWorkspaceRoutes);
app.use('/api/student/submissions', studentSubmissionRoutes);
app.use('/api/lecturer/submissions', lecturerSubmissionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/portfolios', portfolioRoutes);

// Serve avatar images from MinIO (public read)
app.get('/api/uploads/avatars/:filename', getAvatar);
// Serve portfolio files from MinIO (public read; auth can be added later if needed)
app.get('/api/uploads/portfolios/:submissionId/:filename', getPortfolioFile);

// 404 and global error handler (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
