import { Router } from 'express';
import { sendContact } from '../controllers/contactController';
import rateLimit from 'express-rate-limit';

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many messages sent. Please try again in an hour.' },
});

const router = Router();
router.post('/', contactLimiter, sendContact);

export default router;
