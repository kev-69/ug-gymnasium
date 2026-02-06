import { Router } from 'express';
import {
  studentSignup,
  staffSignup,
  publicSignup,
  login,
  refreshToken,
  getProfile,
  logout,
} from '../../controllers/user/auth.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  studentSignupSchema,
  staffSignupSchema,
  publicSignupSchema,
  loginSchema,
  refreshTokenSchema,
} from '../../validators/user/auth.validator';

const router = Router();

/**
 * @route   POST /api/auth/signup/student
 * @desc    Register a new student
 * @access  Public
 */
router.post(
  '/signup/student',
  validateRequest(studentSignupSchema),
  studentSignup
);

/**
 * @route   POST /api/auth/signup/staff
 * @desc    Register a new staff member
 * @access  Public
 */
router.post(
  '/signup/staff',
  validateRequest(staffSignupSchema),
  staffSignup
);

/**
 * @route   POST /api/auth/signup/public
 * @desc    Register a new public user
 * @access  Public
 */
router.post(
  '/signup/public',
  validateRequest(publicSignupSchema),
  publicSignup
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateRequest(loginSchema), login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', validateRequest(refreshTokenSchema), refreshToken);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, logout);

export default router;
