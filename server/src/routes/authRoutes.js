import express from "express";
import { createUser, login, logout, updatePassword } from "../controllers/authController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", protect, logout);
router.post("/create-user", protect, authorize("admin"), createUser);

router.put("/update-password", protect, updatePassword);

export default router;
