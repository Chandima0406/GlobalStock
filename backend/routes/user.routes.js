import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updatePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getUserOrders,
  getUserOrderStats,
  getUsers,
  getUserById,
  updateUserRole,
  toggleUserActive,
  deleteUser,
  getUserDashboardStats
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==========================================
// PROTECTED USER ROUTES (Customer)
// ==========================================

// Profile management
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, updatePassword);

// Address management
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.put('/addresses/:addressId/default', protect, setDefaultAddress);

// Wishlist management
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist', protect, addToWishlist);
router.delete('/wishlist/:productId', protect, removeFromWishlist);

// Orders
router.get('/orders', protect, getUserOrders);
router.get('/orders/stats', protect, getUserOrderStats);

// Dashboard
router.get('/dashboard/stats', protect, getUserDashboardStats);

// ==========================================
// ADMIN ROUTES
// ==========================================

// User management (Admin only)
router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.put('/:id/active', protect, authorize('admin'), toggleUserActive);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;
