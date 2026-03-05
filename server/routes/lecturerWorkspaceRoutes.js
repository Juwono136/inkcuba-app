import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { uploadStudentList } from '../middlewares/uploadMiddleware.js';
import {
  listWorkspaces,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  downloadStudentTemplate,
  uploadStudentList as uploadStudentListController,
  addStudentsBatchToWorkspace,
  addStudentToWorkspace,
  removeStudentFromWorkspace,
  listWorkspaceStudents,
  createCard,
  updateCard,
  deleteCard,
} from '../controllers/lecturerWorkspaceController.js';

const router = express.Router();

router.use(protect, restrictTo('lecturer'));

router.get('/', listWorkspaces);
router.post('/', createWorkspace);
router.get('/student-template', downloadStudentTemplate);
router.get('/:id', getWorkspace);
router.patch('/:id', updateWorkspace);
router.delete('/:id', deleteWorkspace);

router.post('/:id/students/upload', (req, res, next) => {
  uploadStudentList(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed.',
      });
    }
    next();
  });
}, uploadStudentListController);
router.post('/:id/students/batch', addStudentsBatchToWorkspace);
router.post('/:id/students', addStudentToWorkspace);
router.delete('/:id/students/:studentId', removeStudentFromWorkspace);
router.get('/:id/students', listWorkspaceStudents);

router.post('/:id/cards', createCard);
router.patch('/:workspaceId/cards/:cardId', updateCard);
router.delete('/:workspaceId/cards/:cardId', deleteCard);

export default router;
