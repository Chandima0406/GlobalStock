import express from 'express';
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getNewsletterSubscribers
} from '../controllers/newsletter.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', unsubscribeNewsletter);

// Admin routes
router.get('/subscribers', protect, authorize('admin'), getNewsletterSubscribers);

export default router;
