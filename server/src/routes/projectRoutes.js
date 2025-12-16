import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  reviewProject,
  deleteProject,
} from "../controllers/projectController.js";
import { protect, authorize, optionalAuth } from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";

const router = express.Router();

// 1. Public / Hybrid View (Optional Auth)
// Mendukung Pagination: ?page=1&limit=5
router.get("/", optionalAuth, getAllProjects);
router.get("/:id", optionalAuth, getProjectById);

// 2. Protected Routes
router.use(protect);

// Student Actions
// Create: Hanya Student
router.post("/", authorize("student"), upload.array("files", 5), createProject);
// Delete: Hanya Student (Admin dicabut aksesnya sesuai request)
router.delete("/:id", authorize("student"), deleteProject);

// Lecturer Actions
// Review: Hanya Lecturer (Admin dicabut aksesnya)
router.patch("/:id/review", authorize("lecturer"), reviewProject);

export default router;
