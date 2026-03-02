import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/index.js';
import logger from '../logger/index.js';
import { generateSecureToken, hashToken } from '../utils/tokenUtils.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangedEmail } from '../services/emailService.js';
import { uploadAvatarToMinio, deleteAvatarFromMinio } from '../services/avatarService.js';

function createTokenPayload(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
}

function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.accessExpiry });
}

/**
 * Sanitize user for response (no password, no tokens).
 */
function toSafeUser(user) {
  if (!user) return null;
  const u = user.toObject ? user.toObject() : user;
  delete u.password;
  delete u.emailVerifyToken;
  delete u.emailVerifyExpires;
  delete u.resetPasswordToken;
  delete u.resetPasswordExpires;
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    emailVerified: !!u.emailVerified,
    isActive: u.isActive !== false,
    avatarUrl: u.avatarUrl || '',
    mustChangePassword: !!u.mustChangePassword,
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt,
  };
}

// ----- Register -----
export async function register(req, res, next) {
  try {
    const { name, email, password, role = 'student' } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }
    const allowedRoles = ['student', 'lecturer'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Allowed: student, lecturer.',
      });
    }
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }
    const verifyToken = generateSecureToken();
    const verifyTokenHashed = hashToken(verifyToken);
    const expires = new Date();
    expires.setHours(expires.getHours() + config.auth.emailVerifyExpiryHours);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      emailVerifyToken: verifyTokenHashed,
      emailVerifyExpires: expires,
    });

    await sendVerificationEmail(user.email, user.name, verifyToken);

    const accessToken = signAccessToken(createTokenPayload(user));
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: toSafeUser(user),
      accessToken,
      expiresIn: config.jwt.accessExpiry,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({
        success: false,
        message: first?.message || 'Validation failed.',
      });
    }
    logger.error('Register error', { error: err.message });
    next(err);
  }
}

// ----- Login -----
export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator for assistance.',
      });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const accessToken = signAccessToken(createTokenPayload(user));
    res.json({
      success: true,
      user: toSafeUser(user),
      accessToken,
      expiresIn: config.jwt.accessExpiry,
    });
  } catch (err) {
    logger.error('Login error', { error: err.message });
    next(err);
  }
}

// ----- Forgot password -----
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }
    const genericMessage = 'If an account exists with this email, you will receive a password reset link.';
    const resetToken = generateSecureToken();
    const resetTokenHashed = hashToken(resetToken);
    const expires = new Date();
    expires.setHours(expires.getHours() + config.auth.passwordResetExpiryHours);
    user.resetPasswordToken = resetTokenHashed;
    user.resetPasswordExpires = expires;
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(user.email, user.name, resetToken);
    return res.json({ success: true, message: genericMessage });
  } catch (err) {
    logger.error('Forgot password error', { error: err.message });
    next(err);
  }
}

// ----- Reset password (with token from email) -----
export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required.',
      });
    }
    const complexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!complexity.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
      });
    }
    const hashed = hashToken(token);
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link. Please request a new one.',
      });
    }
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    const accessToken = signAccessToken(createTokenPayload(user));
    res.json({
      success: true,
      message: 'Password has been reset. You can now log in.',
      user: toSafeUser(user),
      accessToken,
      expiresIn: config.jwt.accessExpiry,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({
        success: false,
        message: first?.message || 'Validation failed.',
      });
    }
    logger.error('Reset password error', { error: err.message });
    next(err);
  }
}

// ----- Update password for logged-in user (e.g. first login) -----
export async function updatePasswordAfterLogin(req, res, next) {
  try {
    const { newPassword } = req.body || {};
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required.',
      });
    }
    const complexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!complexity.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    const accessToken = signAccessToken(createTokenPayload(user));
    res.json({
      success: true,
      message: 'Password updated successfully.',
      user: toSafeUser(user),
      accessToken,
      expiresIn: config.jwt.accessExpiry,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({
        success: false,
        message: first?.message || 'Validation failed.',
      });
    }
    logger.error('Update password after login error', { error: err.message });
    next(err);
  }
}

// ----- Verify email (token from link) -----
export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required.',
      });
    }
    const hashed = hashToken(token);
    const user = await User.findOne({
      emailVerifyToken: hashed,
      emailVerifyExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification link. You can request a new one from login.',
      });
    }
    user.emailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save({ validateBeforeSave: false });
    const accessToken = signAccessToken(createTokenPayload(user));
    res.json({
      success: true,
      message: 'Email verified successfully.',
      user: toSafeUser(user),
      accessToken,
      expiresIn: config.jwt.accessExpiry,
    });
  } catch (err) {
    logger.error('Verify email error', { error: err.message });
    next(err);
  }
}

// ----- Resend verification email -----
export async function resendVerification(req, res, next) {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    const genericMessage = 'If the account exists and is not verified, a new verification email has been sent.';
    if (!user || user.emailVerified) {
      return res.json({ success: true, message: genericMessage });
    }
    const verifyToken = generateSecureToken();
    const verifyTokenHashed = hashToken(verifyToken);
    const expires = new Date();
    expires.setHours(expires.getHours() + config.auth.emailVerifyExpiryHours);
    user.emailVerifyToken = verifyTokenHashed;
    user.emailVerifyExpires = expires;
    await user.save({ validateBeforeSave: false });
    await sendVerificationEmail(user.email, user.name, verifyToken);
    return res.json({ success: true, message: genericMessage });
  } catch (err) {
    logger.error('Resend verification error', { error: err.message });
    next(err);
  }
}

// ----- Get current user (protected) -----
export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated.',
      });
    }
    res.json({ success: true, user: toSafeUser(user) });
  } catch (err) {
    logger.error('Me error', { error: err.message });
    next(err);
  }
}

// ----- Update profile (protected): name, avatarUrl (MinIO key only) -----
const AVATAR_KEY_REGEX = /^[a-zA-Z0-9._-]+$/;

export async function updateProfile(req, res, next) {
  try {
    const { name, avatarUrl } = req.body || {};
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated.',
      });
    }

    const updates = {};
    if (name !== undefined) {
      const trimmed = typeof name === 'string' ? name.trim() : '';
      if (!trimmed) {
        return res.status(400).json({
          success: false,
          message: 'Name is required and cannot be empty.',
        });
      }
      if (trimmed.length > 120) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot exceed 120 characters.',
        });
      }
      updates.name = trimmed;
    }
    if (avatarUrl !== undefined) {
      if (avatarUrl === null || avatarUrl === '') {
        updates.avatarUrl = '';
      } else if (typeof avatarUrl === 'string') {
        const key = avatarUrl.replace(/^avatars\//, '').split('/')[0];
        if (!key || !AVATAR_KEY_REGEX.test(key)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid profile image key. Please upload a new photo.',
          });
        }
        updates.avatarUrl = key;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid profile image.',
        });
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.json({ success: true, user: toSafeUser(user) });
    }

    if (updates.avatarUrl !== undefined && user.avatarUrl && !user.avatarUrl.startsWith('data:')) {
      await deleteAvatarFromMinio(user.avatarUrl);
    }

    Object.assign(user, updates);
    await user.save({ validateBeforeSave: true });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: toSafeUser(user),
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({
        success: false,
        message: first?.message || 'Validation failed.',
      });
    }
    logger.error('Update profile error', { error: err.message });
    next(err);
  }
}

// ----- Upload avatar (protected). Stores in MinIO, returns key for avatarUrl. Deletes previous avatar from MinIO. -----
export async function uploadAvatar(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Please select an image (JPEG, PNG, WebP or GIF, max 2 MB).',
      });
    }

    const userId = req.user.id;
    const key = await uploadAvatarToMinio(
      req.file.buffer,
      userId,
      req.file.mimetype || 'image/jpeg'
    );

    const existingUser = await User.findById(userId).select('avatarUrl').lean();
    if (existingUser?.avatarUrl && !existingUser.avatarUrl.startsWith('data:')) {
      await deleteAvatarFromMinio(existingUser.avatarUrl);
    }

    res.status(201).json({
      success: true,
      avatarUrl: key,
    });
  } catch (err) {
    logger.error('Upload avatar error', { error: err.message });
    next(err);
  }
}

// ----- Change password (protected). Forces re-login: no new token returned. -----
const PASSWORD_COMPLEXITY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }
    if (!PASSWORD_COMPLEXITY.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'New password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
      });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your current password.',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated.',
      });
    }

    const match = await user.comparePassword(currentPassword);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    sendPasswordChangedEmail(user.email, user.name);

    res.json({
      success: true,
      message: 'Password changed successfully. Please sign in again with your new password.',
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({
        success: false,
        message: first?.message || 'Validation failed.',
      });
    }
    logger.error('Change password error', { error: err.message });
    next(err);
  }
}
