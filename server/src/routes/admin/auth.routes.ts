import { Router } from 'express';
import {
  adminSignup,
  adminLogin,
  adminRefreshToken,
  getAdminProfile,
  adminLogout,
} from '../../controllers/admin/auth.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  adminSignupSchema,
  adminLoginSchema,
  refreshTokenSchema,
} from '../../validators/admin/auth.validator';

const router = Router();

// Admin Signup (Temporary - will be removed later)
router.post('/signup', validateRequest(adminSignupSchema), adminSignup);

// Admin Login
router.post('/login', validateRequest(adminLoginSchema), adminLogin);

// Admin Refresh Token
router.post('/refresh', validateRequest(refreshTokenSchema), adminRefreshToken);

// Get Admin Profile (Protected)
router.get('/profile', authenticate, getAdminProfile);

// Admin Logout (Protected)
router.post('/logout', authenticate, adminLogout);

export default router;
