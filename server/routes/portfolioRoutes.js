import express from 'express';
import { listPublished, getPublishedById } from '../controllers/portfolioController.js';

const router = express.Router();

router.get('/', listPublished);
router.get('/:id', getPublishedById);

export default router;
