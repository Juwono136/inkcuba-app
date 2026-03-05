import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ROLES = ['admin', 'lecturer', 'student'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'student',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    emailVerifyToken: String,
    emailVerifyExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    program: {
      type: String,
      trim: true,
      maxlength: [120, 'Program cannot exceed 120 characters'],
      default: '',
    },
    /** Student code / ID (e.g. NIM) — only used when role is student */
    studentCode: {
      type: String,
      trim: true,
      maxlength: [80, 'Student code cannot exceed 80 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

userSchema.index({ emailVerifyToken: 1 });
userSchema.index({ resetPasswordToken: 1 });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const UserRoles = Object.freeze(ROLES.reduce((acc, r) => ({ ...acc, [r.toUpperCase()]: r }), {}));
export default mongoose.model('User', userSchema);
