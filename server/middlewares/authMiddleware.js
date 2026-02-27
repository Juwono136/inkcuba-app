import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import logger from '../logger/index.js';

/**
 * Protect route: require valid JWT. Sets req.user = { id, email, role }.
 */
export function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies?.accessToken || null;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in.',
      });
    }
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: err.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid token.',
      });
    }
    logger.error('Auth middleware error', { error: err.message });
    next(err);
  }
}

/**
 * Restrict to given roles. Use after protect().
 */
export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
}
