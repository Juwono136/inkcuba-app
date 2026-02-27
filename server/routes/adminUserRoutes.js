import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { listUsers, createUser, updateUser, deleteUser } from '../controllers/adminUserController.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;

