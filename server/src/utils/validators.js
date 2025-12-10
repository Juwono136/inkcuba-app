import { z } from "zod";

// Regex Password: Minimum 1 lowercase letter, 1 uppercase letter, 1 number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{6,20}$/;

// Check domain Binus email
const validateBinusEmail = (email) => {
  return email.endsWith("@binus.ac.id") || email.endsWith("@binus.edu");
};

export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),

  email: z.email("Invalid email address format").refine(validateBinusEmail, {
    message: "Email must use @binus.ac.id or @binus.edu domain",
  }),

  role: z.string().refine((val) => ["student", "lecturer", "admin"].includes(val), {
    message: "Invalid User Role",
  }),

  academicId: z.string().optional(),
  academicInfo: z
    .object({
      batch: z.string().optional(),
      program: z.string().optional(),
    })
    .optional(),
});

// Login schema
export const loginSchema = z.object({
  email: z.email().refine(validateBinusEmail, {
    message: "Access restricted to Binus domains only",
  }),
  password: z.string().min(1, "Password is required"),
});

// Password change scheme (User update profile)
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z
    .string()
    .min(6, "Password min 6 characters")
    .max(20, "Password max 20 characters")
    .regex(passwordRegex, "Password must contain at least 1 uppercase, 1 lowercase, and 1 number"),
});
