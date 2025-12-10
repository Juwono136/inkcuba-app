import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import redisClient from "../config/redis.js";

// 1. Cek apakah user sudah login (punya token valid)
export const protect = async (req, res, next) => {
  let token;

  // Ambil token dari Header: "Bearer eyJhbGci..."
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Not authorized, please login", StatusCodes.UNAUTHORIZED));
  }

  try {
    // A. Cek apakah token ada di Blacklist Redis (Artinya user sudah logout)
    const isBlacklisted = await redisClient.get(`blacklist_${token}`);
    if (isBlacklisted) {
      return next(new AppError("Token is no longer valid (Logged out)", StatusCodes.UNAUTHORIZED));
    }

    // B. Verifikasi Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // C. Cek apakah user masih ada di DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("User not found", StatusCodes.UNAUTHORIZED));
    }

    // D. Simpan user di request object agar bisa dipakai di controller
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError(`Auth Failed: ${error.message}`, StatusCodes.UNAUTHORIZED));
    // console.error("AUTH ERROR:", error);
    // return next(new AppError("Not authorized, auth failed", StatusCodes.UNAUTHORIZED));
  }
};

// 2. Cek Role (Authorization)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", StatusCodes.FORBIDDEN)
      );
    }
    next();
  };
};
