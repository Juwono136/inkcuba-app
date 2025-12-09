import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false, // Password tidak akan ikut terambil saat query user biasa (Security)
    },
    role: {
      type: String,
      enum: ["student", "lecturer", "admin"],
      default: "student",
    },
    // ID Unik Akademik (NIM untuk Student, NIP untuk Dosen)
    academicId: {
      type: String,
      unique: true,
      sparse: true, // Boleh kosong untuk Admin
    },
    // Informasi khusus Student
    academicInfo: {
      batch: String, // Angkatan (misal: 2021)
      program: String, // Jurusan (misal: Computer Science)
    },
    profileImage: {
      type: String,
      default: "default-profile.png",
    },
    isFirstLogin: {
      type: Boolean,
      default: true, // User baru wajib ganti password
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Otomatis buat createdAt dan updatedAt
  }
);

// --- MIDDLEWARE MONGOOSE ---

// 1. Encrypt password sebelum disimpan (Create / Update password)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 2. Method untuk membandingkan password saat login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
