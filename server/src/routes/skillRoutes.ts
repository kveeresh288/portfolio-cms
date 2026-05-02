import { Router } from 'express';
import { getSkills, createSkill, updateSkill, deleteSkill } from '../controllers/skillController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getSkills);
router.post('/', authenticate, createSkill);
router.put('/:id', authenticate, updateSkill);
router.delete('/:id', authenticate, deleteSkill);

export default router;
