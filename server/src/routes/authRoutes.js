import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { registerRules, loginRules } from '../validators/authValidators.js';
import validate from '../middleware/validationMiddleware.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);

// Protected routes
router.get('/me', protect, authController.getMe);

export default router;
