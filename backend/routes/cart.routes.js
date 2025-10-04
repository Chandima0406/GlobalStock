import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyDiscount,
  removeDiscount,
  setShippingAddress,
  setShippingMethod,
  mergeCart,
  getCartSummary,
  validateCart
} from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// Cart management
router.route('/')
  .get(getCart)       // Get user's cart
  .delete(clearCart); // Clear cart

// Cart items
router.post('/items', addToCart);                        // Add item to cart
router.put('/items/:productId', updateCartItem);         // Update item quantity
router.delete('/items/:productId', removeFromCart);      // Remove item from cart

// Discount/Coupon
router.post('/discount', applyDiscount);                 // Apply discount code
router.delete('/discount', removeDiscount);              // Remove discount

// Shipping
router.post('/shipping/address', setShippingAddress);    // Set shipping address
router.post('/shipping/method', setShippingMethod);      // Set shipping method

// Cart operations
router.post('/merge', mergeCart);                        // Merge guest cart with user cart
router.get('/summary', getCartSummary);                  // Get cart totals summary
router.get('/validate', validateCart);                   // Validate cart (stock, prices, etc.)

export default router;
