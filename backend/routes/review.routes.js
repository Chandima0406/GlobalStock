import express from 'express';
import {
  createReview,
  getProductReviews,
  getMyReviews,
  getReview,
  updateReview,
  deleteReview,
  likeReview,
  dislikeReview,
  reportReview,
  getAllReviews,
  updateReviewStatus,
  bulkUpdateReviewStatus,
  getReviewStats,
  getFeaturedReviews
} from '../controllers/review.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get product reviews
router.get('/product/:productId', getProductReviews);

// Get single review
router.get('/:id', getReview);

// Get featured reviews
router.get('/featured/all', getFeaturedReviews);

// ==========================================
// PROTECTED ROUTES (Customer)
// ==========================================

// Create review (must be authenticated)
router.post('/', protect, createReview);

// Get my reviews
router.get('/my/reviews', protect, getMyReviews);

// Update my review
router.put('/:id', protect, updateReview);

// Delete my review
router.delete('/:id', protect, deleteReview);

// Like/Dislike review
router.post('/:id/like', protect, likeReview);
router.post('/:id/dislike', protect, dislikeReview);

// Report review
router.post('/:id/report', protect, reportReview);

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get all reviews (admin)
router.get('/', protect, authorize('admin'), getAllReviews);

// Get review statistics
router.get('/stats/all', protect, authorize('admin'), getReviewStats);

// Update review status (approve/reject)
router.put('/:id/status', protect, authorize('admin'), updateReviewStatus);

// Bulk update review status
router.put('/bulk/status', protect, authorize('admin'), bulkUpdateReviewStatus);

export default router;
