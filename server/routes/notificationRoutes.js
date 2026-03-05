import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  listNotifications,
  getLatest,
  markRead,
  markAllRead,
} from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect);

router.get('/latest', getLatest);
router.get('/', listNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

export default router;
