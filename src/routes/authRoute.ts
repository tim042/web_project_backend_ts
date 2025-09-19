import { Router } from 'express';
import * as authController from '../controllers/authController';
import { 
  validateRegistration, 
  validateLogin, 
  validatePasswordChange, 
  checkValidationResult 
} from '../middleware/validation';
import { loginLimiter, registerLimiter, authLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply general rate limiting to all auth routes
router.use(authLimiter);

// Public routes
router.post(
  '/register',
  registerLimiter,
  validateRegistration,
  checkValidationResult,
  authController.register
);

router.post(
  '/login',
  loginLimiter,
  validateLogin,
  checkValidationResult,
  authController.login
);

router.post('/refresh-token', authController.refresh);

// Protected routes (require authentication)
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.put(
  '/change-password',
  authenticate,
  validatePasswordChange,
  checkValidationResult,
  authController.changePassword
);

export default router;
