import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Rotas públicas
router.post('/login', asyncHandler(AuthController.login));
router.post('/register', asyncHandler(AuthController.register));

// Rotas protegidas
router.post('/logout', authenticateToken, asyncHandler(AuthController.logout));
router.get('/me', authenticateToken, asyncHandler(AuthController.me));

export default router;


