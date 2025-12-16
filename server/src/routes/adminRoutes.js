import express from "express";
import { bulkUploadUsers, getDashboardStats } from "../controllers/adminController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";

const router = express.Router();

// Semua route di sini hanya untuk ADMIN
router.use(protect, authorize("admin"));

// Route: Upload User via Excel
router.post("/users/bulk-upload", upload.single("file"), bulkUploadUsers);

// Route: Dashboard Analytics
router.get("/dashboard-stats", getDashboardStats);

export default router;
