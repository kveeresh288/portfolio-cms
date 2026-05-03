import { Router } from 'express';
import {
  login,
  verifyEmailOtp,
  verifyTotp,
  setupTotp,
  confirmTotp,
  enableEmailMfa,
  disableMfa,
  logout,
  me,
} from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// ── Public (no auth required) ──────────────────────────────────────────────
router.post('/login', login);
router.post('/verify-email-otp', verifyEmailOtp);  // Email OTP step 2
router.post('/verify-totp', verifyTotp);           // TOTP step 2

// ── Protected ──────────────────────────────────────────────────────────────
router.get('/setup-totp', authenticate, setupTotp);          // Generate QR
router.post('/confirm-totp', authenticate, confirmTotp);     // Confirm TOTP setup
router.post('/enable-email-mfa', authenticate, enableEmailMfa); // Enable email OTP
router.post('/disable-mfa', authenticate, disableMfa);       // Disable MFA (recovery)
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;
