import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import {
  getSubmissionSummary,
  listSubmissions,
  getOne,
  review,
  publish,
  takeDown,
} from '../controllers/lecturerSubmissionController.js';

const router = express.Router();

router.use(protect, restrictTo('lecturer'));

router.get('/summary', getSubmissionSummary);
router.get('/', listSubmissions);
router.get('/:id', getOne);
router.patch('/:id/review', review);
router.patch('/:id/publish', publish);
router.patch('/:id/take-down', takeDown);

export default router;
