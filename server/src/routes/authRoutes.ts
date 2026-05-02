import { Router } from 'express';
import { login, verifyTotp, setupTotp, confirmTotp, logout, me } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/verify-totp', verifyTotp);

router.get('/setup-totp', authenticate, setupTotp);
router.post('/confirm-totp', authenticate, confirmTotp);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;
