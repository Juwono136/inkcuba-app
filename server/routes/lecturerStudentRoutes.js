import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { uploadStudentList } from '../middlewares/uploadMiddleware.js';
import { searchStudents, matchStudentsFromFile } from '../controllers/lecturerStudentController.js';

const router = express.Router();

router.use(protect, restrictTo('lecturer'));
router.get('/', searchStudents);
router.post('/match-from-file', (req, res, next) => {
  uploadStudentList(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message || 'File upload failed.' });
    next();
  });
}, matchStudentsFromFile);

export default router;
