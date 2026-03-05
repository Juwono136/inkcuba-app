import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import {
  uploadPortfolioScreenshot,
  uploadPortfolioPoster,
  uploadPortfolioReport,
} from '../middlewares/uploadMiddleware.js';
import {
  createOrGetDraft,
  updateDraft,
  uploadScreenshot,
  uploadPoster,
  uploadReport,
  submit,
  deleteDraft,
  listMy,
  getOne,
} from '../controllers/studentSubmissionController.js';

const router = express.Router();

router.use(protect, restrictTo('student'));

router.post('/', createOrGetDraft);
router.get('/', listMy);
router.get('/:id', getOne);
router.patch('/:id', updateDraft);
router.post('/:id/submit', submit);
router.delete('/:id', deleteDraft);

router.post('/:id/upload-screenshot', (req, res, next) => {
  uploadPortfolioScreenshot(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message || 'Upload failed.' });
    next();
  });
}, uploadScreenshot);

router.post('/:id/upload-poster', (req, res, next) => {
  uploadPortfolioPoster(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message || 'Upload failed.' });
    next();
  });
}, uploadPoster);

router.post('/:id/upload-report', (req, res, next) => {
  uploadPortfolioReport(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message || 'Upload failed.' });
    next();
  });
}, uploadReport);

export default router;
