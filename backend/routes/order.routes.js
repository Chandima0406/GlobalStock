import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  addTracking,
  cancelOrder,
  getOrders,
  getSalesStats,
  getVendorOrders,
  getOrderByNumber,
  getRecentOrders,
  processRefund,
  getOrderAnalytics
} from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==========================================
// CUSTOMER ROUTES
// ==========================================

// Create new order
router.post('/', protect, createOrder);

// Get my orders
router.get('/my-orders', protect, getMyOrders);

// Get order by ID (customer can only see their own)
router.get('/:id', protect, getOrderById);

// Get order by order number
router.get('/number/:orderNumber', protect, getOrderByNumber);

// Cancel order (customer can cancel their own pending orders)
router.put('/:id/cancel', protect, cancelOrder);

// Update order to paid (for manual payment confirmation)
router.put('/:id/pay', protect, updateOrderToPaid);

// ==========================================
// VENDOR ROUTES
// ==========================================

// Get vendor orders (products from this vendor)
router.get('/vendor/orders', protect, authorize('vendor', 'admin'), getVendorOrders);

// Update order status (vendor can update orders containing their products)
router.put('/:id/status', protect, authorize('vendor', 'admin'), updateOrderStatus);

// Add tracking information
router.put('/:id/tracking', protect, authorize('vendor', 'admin'), addTracking);

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get all orders (admin can see all orders)
router.get('/', protect, authorize('admin'), getOrders);

// Get recent orders
router.get('/admin/recent', protect, authorize('admin'), getRecentOrders);

// Get sales statistics
router.get('/admin/sales-stats', protect, authorize('admin'), getSalesStats);

// Get order analytics
router.get('/admin/analytics', protect, authorize('admin'), getOrderAnalytics);

// Process refund
router.post('/:id/refund', protect, authorize('admin'), processRefund);

export default router;
