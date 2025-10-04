import asyncHandler from '../utils/asyncHandler.util.js';
import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name price images inventory brand rating');

  if (!cart) {
    cart = await Cart.create({ user: req.user._id });
  }

  // Calculate totals
  cart.calculateTotals();
  await cart.save();

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, variant, notes } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check stock availability
  const requestedQty = quantity || 1;
  if (product.inventory.trackQuantity && product.inventory.quantity < requestedQty) {
    res.status(400);
    throw new Error(`Only ${product.inventory.quantity} items available in stock`);
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id });
  }

  // Add item to cart
  await cart.addItem(productId, requestedQty, variant, notes);

  // Populate and return updated cart
  cart = await Cart.findById(cart._id)
    .populate('items.product', 'name price images inventory brand rating');

  res.status(200).json({
    success: true,
    message: 'Item added to cart 🛒',
    data: cart
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:productId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity, variantAttributes } = req.body;

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error('Valid quantity is required');
  }

  // Find cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  // Check product stock
  const product = await Product.findById(productId);
  if (product && product.inventory.trackQuantity && product.inventory.quantity < quantity) {
    res.status(400);
    throw new Error(`Only ${product.inventory.quantity} items available in stock`);
  }

  // Update item quantity
  await cart.updateItemQuantity(productId, quantity, variantAttributes);

  // Populate and return updated cart
  const updatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price images inventory brand rating');

  res.status(200).json({
    success: true,
    message: 'Cart updated successfully ✅',
    data: updatedCart
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variantAttributes } = req.body;

  // Find cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  // Remove item
  await cart.removeItem(productId, variantAttributes);

  // Populate and return updated cart
  const updatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price images inventory brand rating');

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: updatedCart
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  // Find cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  // Clear all items
  await cart.clearCart();

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    data: cart
  });
});

// @desc    Apply discount/coupon to cart
// @route   POST /api/cart/discount
// @access  Private
export const applyDiscount = asyncHandler(async (req, res) => {
  const { couponCode, discountAmount, discountType, description } = req.body;

  if (!couponCode || !discountAmount) {
    res.status(400);
    throw new Error('Coupon code and discount amount are required');
  }

  // Find cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  // Apply discount
  await cart.applyDiscount(couponCode, discountAmount, discountType, description);

  // Populate and return updated cart
  const updatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price images inventory brand rating');

  res.status(200).json({
    success: true,
    message: 'Discount applied successfully 🎉',
    data: updatedCart
  });
});

// @desc    Remove discount from cart
// @route   DELETE /api/cart/discount
// @access  Private
export const removeDiscount = asyncHandler(async (req, res) => {
  // Find cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  // Remove discount
  await cart.removeDiscount();

  // Populate and return updated cart
  const updatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price images inventory brand rating');

  res.status(200).json({
    success: true,
    message: 'Discount removed',
    data: updatedCart
  });
});

// @desc    Set shipping address
// @route   POST /api/cart/shipping/address
// @access  Private
export const setShippingAddress = asyncHandler(async (req, res) => {
  const { address } = req.body;

  if (!address) {
    res.status(400);
    throw new Error('Shipping address is required');
  }

  // Find cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  // Set shipping address
  await cart.setShippingAddress(address);

  res.status(200).json({
    success: true,
    message: 'Shipping address set successfully',
    data: cart
  });
});

// @desc    Set shipping method
// @route   POST /api/cart/shipping/method
// @access  Private
export const setShippingMethod = asyncHandler(async (req, res) => {
  const { method, amount, description, estimatedDays } = req.body;

  if (!method || amount === undefined) {
    res.status(400);
    throw new Error('Shipping method and amount are required');
  }

  // Find cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  // Set shipping method
  await cart.setShippingMethod(method, amount, description, estimatedDays);

  res.status(200).json({
    success: true,
    message: 'Shipping method set successfully',
    data: cart
  });
});

// @desc    Merge guest cart with user cart
// @route   POST /api/cart/merge
// @access  Private
export const mergeCart = asyncHandler(async (req, res) => {
  const { guestCartItems } = req.body;

  if (!guestCartItems || !Array.isArray(guestCartItems)) {
    res.status(400);
    throw new Error('Valid guest cart items are required');
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id });
  }

  // Merge carts
  await cart.mergeCart({ items: guestCartItems });

  // Populate and return updated cart
  const updatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price images inventory brand rating');

  res.status(200).json({
    success: true,
    message: 'Carts merged successfully',
    data: updatedCart
  });
});

// @desc    Get cart summary (totals)
// @route   GET /api/cart/summary
// @access  Private
export const getCartSummary = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(200).json({
      success: true,
      data: {
        itemsCount: 0,
        subtotal: 0,
        discount: 0,
        shippingCost: 0,
        tax: 0,
        total: 0
      }
    });
  }

  // Calculate totals
  cart.calculateTotals();

  res.status(200).json({
    success: true,
    data: {
      itemsCount: cart.totalItems,
      subtotal: cart.subtotal,
      discount: cart.discount?.amount || 0,
      shippingCost: cart.shippingCost,
      tax: cart.tax,
      total: cart.total
    }
  });
});

// @desc    Validate cart (check stock, prices, etc.)
// @route   GET /api/cart/validate
// @access  Private
export const validateCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product');

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const issues = [];

  // Check each item
  for (const item of cart.items) {
    if (!item.product) {
      issues.push({
        itemId: item._id,
        issue: 'Product no longer exists'
      });
      continue;
    }

    // Check stock
    if (item.product.inventory.trackQuantity && 
        item.product.inventory.quantity < item.quantity) {
      issues.push({
        itemId: item._id,
        productName: item.product.name,
        issue: `Only ${item.product.inventory.quantity} items available (you have ${item.quantity} in cart)`
      });
    }

    // Check price change
    if (item.price !== item.product.price) {
      issues.push({
        itemId: item._id,
        productName: item.product.name,
        issue: `Price changed from ${item.price} to ${item.product.price}`
      });
    }

    // Check if product is active
    if (item.product.status !== 'active') {
      issues.push({
        itemId: item._id,
        productName: item.product.name,
        issue: 'Product is no longer available'
      });
    }
  }

  res.status(200).json({
    success: true,
    isValid: issues.length === 0,
    issues,
    data: cart
  });
});
