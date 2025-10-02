import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  logoutUser,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// Protected routes (require JWT token)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logoutUser);

export default router;