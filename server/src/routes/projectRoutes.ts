import { Router } from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public
router.get('/', getProjects);
router.get('/:id', getProject);

// Protected
router.post('/', authenticate, createProject);
router.put('/:id', authenticate, updateProject);
router.delete('/:id', authenticate, deleteProject);

export default router;
