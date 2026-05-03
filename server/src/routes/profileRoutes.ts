import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getProfile);                    // Public — homepage fetches this
router.put('/', authenticate, updateProfile);   // Protected — admin edits

export default router;
