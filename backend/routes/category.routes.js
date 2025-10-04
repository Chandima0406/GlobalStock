import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getRootCategories,
  getFeaturedCategories,
  getNavigationCategories,
  getCategoriesWithCounts,
  getSubcategories,
  searchCategories,
  bulkUpdateStatus,
  updateDisplayOrder,
  addAttribute,
  removeAttribute
} from '../controllers/category.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get all categories
router.get('/', getCategories);

// Get category tree (hierarchical structure)
router.get('/tree', getCategoryTree);

// Get root categories (top-level only)
router.get('/root', getRootCategories);

// Get featured categories
router.get('/featured', getFeaturedCategories);

// Get categories for navigation menu
router.get('/navigation', getNavigationCategories);

// Get categories with product counts
router.get('/with-counts', getCategoriesWithCounts);

// Search categories
router.get('/search', searchCategories);

// Get category by slug
router.get('/slug/:slug', getCategoryBySlug);

// Get subcategories of a category
router.get('/:categoryId/subcategories', getSubcategories);

// Get category by ID
router.get('/:id', getCategoryById);

// ==========================================
// ADMIN ROUTES
// ==========================================

// Create category
router.post('/', protect, authorize('admin'), createCategory);

// Update category
router.put('/:id', protect, authorize('admin'), updateCategory);

// Delete category
router.delete('/:id', protect, authorize('admin'), deleteCategory);

// Bulk update category status
router.put('/bulk/status', protect, authorize('admin'), bulkUpdateStatus);

// Update display order
router.put('/bulk/order', protect, authorize('admin'), updateDisplayOrder);

// Manage category attributes
router.post('/:id/attributes', protect, authorize('admin'), addAttribute);
router.delete('/:id/attributes/:attributeName', protect, authorize('admin'), removeAttribute);

export default router;
