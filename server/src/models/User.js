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
      match: [
        /^[a-zA-Z0-9._%+-]+@(binus\.ac\.id|binus\.edu)$/,
        "Please provide a valid BINUS email (@binus.ac.id or @binus.edu)",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "lecturer", "admin"],
      default: "student",
    },
    academicId: {
      type: String,
      unique: true,
      sparse: true, // Can be left blank for Admin
    },
    academicInfo: {
      batch: String, // e.g. Batch 2027
      program: String, // e.g. Computer science
    },
    profileImage: {
      type: String,
      default: "https://res.cloudinary.com/dz8dtz5ki/image/upload/v1765253617/profile_jm5amd.png",
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
