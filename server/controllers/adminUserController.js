import User from '../models/User.js';
import logger from '../logger/index.js';
import { sendNewAdminUserEmail } from '../services/emailService.js';

function toAdminSafeUser(user) {
  if (!user) return null;
  const u = user.toObject ? user.toObject() : user;
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    program: u.program || '',
    isActive: u.isActive !== false,
    emailVerified: !!u.emailVerified,
    avatarUrl: u.avatarUrl || '',
    mustChangePassword: !!u.mustChangePassword,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    lastLoginAt: u.lastLoginAt,
  };
}

export async function listUsers(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query || {};

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const filter = {};

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { program: regex }];
    }

    if (role && ['admin', 'lecturer', 'student'].includes(role)) {
      filter.role = role;
    }

    if (req.query.program && typeof req.query.program === 'string' && req.query.program.trim()) {
      filter.program = new RegExp(req.query.program.trim(), 'i');
    }

    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const allowedSortFields = ['name', 'email', 'role', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.json({
      success: true,
      data: users.map(toAdminSafeUser),
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        sortBy: sortField,
        sortOrder: sortDirection === 1 ? 'asc' : 'desc',
      },
    });
  } catch (err) {
    logger.error('Admin listUsers error', { error: err.message });
    next(err);
  }
}

function generateStrongPassword(length = 12) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%^&*()-_=+[]{}';

  const pick = (chars) => chars[Math.floor(Math.random() * chars.length)];

  // Ensure at least one of each required class
  const required = [pick(upper), pick(lower), pick(digits), pick(special)];
  const all = upper + lower + digits + special;

  const remaining = Array.from({ length: Math.max(length - required.length, 4) }).map(() =>
    pick(all)
  );

  const passwordArray = [...required, ...remaining];

  // Fisher–Yates shuffle
  for (let i = passwordArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
}

export async function createUser(req, res, next) {
  try {
    const { name, email, role = 'student', isActive = true, program } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required.',
      });
    }

    const allowedRoles = ['admin', 'lecturer', 'student'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Allowed: admin, lecturer, student.',
      });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const generatedPassword = generateStrongPassword(12);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: generatedPassword,
      role,
      program: typeof program === 'string' ? program.trim() : '',
      isActive: !!isActive,
      emailVerified: true,
      mustChangePassword: true,
    });

    // Fire-and-forget email; errors are logged inside the service
    sendNewAdminUserEmail(user.email, user.name, generatedPassword);

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: toAdminSafeUser(user),
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({
        success: false,
        message: first?.message || 'Validation failed.',
      });
    }
    logger.error('Admin createUser error', { error: err.message });
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, role, isActive, program } = req.body || {};

    const update = {};
    if (name != null) update.name = name.trim();
    if (email != null) update.email = email.trim().toLowerCase();
    if (role != null) {
      const allowedRoles = ['admin', 'lecturer', 'student'];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Allowed: admin, lecturer, student.',
        });
      }
      update.role = role;
    }
    if (isActive != null) update.isActive = !!isActive;
    if (program !== undefined) update.program = typeof program === 'string' ? program.trim() : '';

    const user = await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully.',
      user: toAdminSafeUser(user),
    });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }
    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({
        success: false,
        message: first?.message || 'Validation failed.',
      });
    }
    logger.error('Admin updateUser error', { error: err.message });
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    if (id === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.',
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (err) {
    logger.error('Admin deleteUser error', { error: err.message });
    next(err);
  }
}

