import { z } from "zod";

// Validasi saat Register User (oleh Admin)
export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"), // Password awal
  role: z.enum(["student", "lecturer", "admin"]),
  academicId: z.string().optional(),
  academicInfo: z
    .object({
      batch: z.string().optional(),
      program: z.string().optional(),
    })
    .optional(),
});

// Validasi saat Submit Project
export const projectSchema = z.object({
  title: z.string().min(5, "Title too short"),
  description: z.string().min(20, "Description too short"),
  type: z.enum(["individual", "team"]),
  lecturerId: z.string().min(1, "Lecturer is required"),
  academicInfo: z.object({
    batch: z.string().min(1),
    program: z.string().min(1),
    course: z.string().min(1),
  }),
  // Validasi array team member jika type == team
  teamMembers: z
    .array(
      z.object({
        name: z.string().min(1),
        role: z.string().min(1),
      })
    )
    .optional(),
});
