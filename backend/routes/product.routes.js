import express from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts,
  updateInventory,
  toggleFeatured,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  getRelatedProducts,
  getLowStockProducts,
  bulkUpdateStatus
} from '../controllers/product.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/search/:query', searchProducts);
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);

// Protected routes
router.use(protect);

// Vendor routes
router.get('/vendor/my-products', authorize('vendor', 'admin'), getVendorProducts);
router.get('/vendor/low-stock', authorize('vendor', 'admin'), getLowStockProducts);
router.post('/', authorize('vendor', 'admin'), createProduct);
router.put('/:id', authorize('vendor', 'admin'), updateProduct);
router.delete('/:id', authorize('vendor', 'admin'), deleteProduct);
router.put('/:id/inventory', authorize('vendor', 'admin'), updateInventory);
router.put('/bulk/status', authorize('vendor', 'admin'), bulkUpdateStatus);

// Admin only routes
router.put('/:id/featured', authorize('admin'), toggleFeatured);

export default router;
