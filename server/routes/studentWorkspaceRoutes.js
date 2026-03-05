import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { listMyWorkspaces } from '../controllers/studentWorkspaceController.js';

const router = express.Router();

router.use(protect, restrictTo('student'));
router.get('/', listMyWorkspaces);

export default router;
