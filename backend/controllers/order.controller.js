import asyncHandler from '../utils/asyncHandler.util.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    shippingPrice,
    taxPrice,
    discount,
    customerNotes
  } = req.body;

  // Validation
  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  if (!shippingAddress) {
    res.status(400);
    throw new Error('Shipping address is required');
  }

  // Calculate prices and validate products
  let itemsPrice = 0;
  const orderItemsWithDetails = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }

    if (product.inventory.trackQuantity && product.inventory.quantity < item.quantity) {
      res.status(400);
      throw new Error(`Not enough stock for ${product.name}. Available: ${product.inventory.quantity}`);
    }

    const itemTotal = product.price * item.quantity;
    itemsPrice += itemTotal;

    orderItemsWithDetails.push({
      product: item.product,
      name: product.name,
      image: product.primaryImage || (product.images[0] ? product.images[0].url : ''),
      price: product.price,
      quantity: item.quantity,
      variant: item.variant || {},
      totalPrice: itemTotal
    });
  }

  // Calculate total price
  const discountAmount = discount?.amount || 0;
  const totalPrice = itemsPrice + (taxPrice || 0) + (shippingPrice || 0) - discountAmount;

  // Create order
  const order = new Order({
    orderItems: orderItemsWithDetails,
    customer: req.user._id,
    customerEmail: req.user.email,
    customerPhone: req.user.phone,
    shippingAddress,
    paymentMethod: paymentMethod || 'cash_on_delivery',
    itemsPrice,
    taxPrice: taxPrice || 0,
    shippingPrice: shippingPrice || 0,
    discount: discount || { amount: 0 },
    totalPrice,
    customerNotes,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    source: 'web'
  });

  // Update product inventory
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { 'inventory.quantity': -item.quantity } }
    );
  }

  const createdOrder = await order.save();

  // Populate order for response
  const populatedOrder = await Order.findById(createdOrder._id)
    .populate('orderItems.product', 'name images brand')
    .populate('customer', 'name email');

  res.status(201).json({
    success: true,
    message: 'Order created successfully 🎉',
    data: populatedOrder
  });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  const filter = { customer: req.user._id };
  if (status) {
    filter.orderStatus = status;
  }

  const orders = await Order.find(filter)
    .populate('orderItems.product', 'name images brand')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('orderItems.product', 'name images brand category')
    .populate('vendors.vendor', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user owns the order or is admin
  if (order.customer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const { id, status, update_time, email_address } = req.body;

  order.paymentResult = {
    id: id || `manual_${Date.now()}`,
    status: status || 'completed',
    update_time: update_time || new Date().toISOString(),
    email_address: email_address || order.customerEmail
  };

  order.paymentStatus = 'completed';
  order.paidAt = new Date();

  // Update order status to confirmed if still pending
  if (order.orderStatus === 'pending') {
    await order.updateStatus('confirmed', 'Payment received');
  }

  const updatedOrder = await order.save();

  res.status(200).json({
    success: true,
    message: 'Order payment updated successfully',
    data: updatedOrder
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin/Vendor)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check authorization
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update order status');
  }

  await order.updateStatus(status, note, req.user._id);

  const updatedOrder = await Order.findById(order._id)
    .populate('customer', 'name email')
    .populate('orderItems.product', 'name');

  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    data: updatedOrder
  });
});

// @desc    Add tracking information
// @route   PUT /api/orders/:id/tracking
// @access  Private (Admin/Vendor)
export const addTracking = asyncHandler(async (req, res) => {
  const { trackingNumber, carrier, estimatedDelivery } = req.body;

  if (!trackingNumber || !carrier) {
    res.status(400);
    throw new Error('Tracking number and carrier are required');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check authorization
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to add tracking information');
  }

  await order.addTracking(trackingNumber, carrier, estimatedDelivery);

  const updatedOrder = await Order.findById(order._id)
    .populate('customer', 'name email')
    .populate('orderItems.product', 'name');

  res.status(200).json({
    success: true,
    message: 'Tracking information added successfully',
    data: updatedOrder
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const { reason, note } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user owns the order or is admin
  if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  if (!order.canBeCancelled) {
    res.status(400);
    throw new Error('This order cannot be cancelled');
  }

  order.cancellationReason = reason || 'changed_mind';
  order.cancellationNote = note;
  
  // Calculate refund if paid
  if (order.paymentStatus === 'completed') {
    order.refundAmount = order.calculateRefund();
    order.paymentStatus = 'refunded';
    order.refundedAt = new Date();
  }

  await order.updateStatus('cancelled', `Cancelled: ${note || reason}`, req.user._id);

  const updatedOrder = await Order.findById(order._id)
    .populate('customer', 'name email')
    .populate('orderItems.product', 'name');

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: updatedOrder
  });
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private (Admin)
export const getOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    paymentStatus,
    customer,
    startDate,
    endDate
  } = req.query;

  // Build filter
  const filter = {};

  if (status) filter.orderStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (customer) filter.customer = customer;

  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const orders = await Order.find(filter)
    .populate('customer', 'name email')
    .populate('orderItems.product', 'name images')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get sales statistics (Admin)
// @route   GET /api/orders/stats/sales
// @access  Private (Admin)
export const getSalesStats = asyncHandler(async (req, res) => {
  const { startDate, endDate = new Date().toISOString() } = req.query;

  if (!startDate) {
    res.status(400);
    throw new Error('Start date is required');
  }

  const stats = await Order.getSalesStats(startDate, endDate);

  // Get recent orders count
  const recentOrders = await Order.countDocuments({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  // Get top products
  const topProducts = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        orderStatus: { $ne: 'cancelled' }
      }
    },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        totalSold: { $sum: '$orderItems.quantity' },
        totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        _id: 0,
        product: '$product.name',
        totalSold: 1,
        totalRevenue: { $round: ['$totalRevenue', 2] }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...stats,
      recentOrders,
      topProducts,
      dateRange: {
        start: startDate,
        end: endDate
      }
    }
  });
});

// @desc    Get vendor orders
// @route   GET /api/orders/vendor/my-orders
// @access  Private (Vendor)
export const getVendorOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  // For now, return empty array since vendor order logic needs products linked to vendors
  // This will be implemented when we have vendor-product relationships
  
  const orders = await Order.find({
    'orderStatus': status || { $exists: true }
  })
  .populate('customer', 'name email')
  .populate('orderItems.product', 'name images vendor')
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);

  // Filter orders that contain vendor's products
  const vendorOrders = orders.filter(order => 
    order.orderItems.some(item => 
      item.product.vendor && item.product.vendor.toString() === req.user._id.toString()
    )
  );

  res.status(200).json({
    success: true,
    data: vendorOrders,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(vendorOrders.length / limit),
      total: vendorOrders.length
    }
  });
});

// @desc    Get order by order number
// @route   GET /api/orders/number/:orderNumber
// @access  Private
export const getOrderByNumber = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;

  const order = await Order.findOne({ orderNumber })
    .populate('customer', 'name email phone')
    .populate('orderItems.product', 'name images brand');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user owns the order or is admin
  if (order.customer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Get recent orders (Admin)
// @route   GET /api/orders/recent
// @access  Private (Admin)
export const getRecentOrders = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const orders = await Order.findRecent(parseInt(limit));

  res.status(200).json({
    success: true,
    data: orders
  });
});

// @desc    Process refund for order
// @route   PUT /api/orders/:id/refund
// @access  Private (Admin)
export const processRefund = asyncHandler(async (req, res) => {
  const { refundAmount, reason } = req.body;

  if (!refundAmount || refundAmount <= 0) {
    res.status(400);
    throw new Error('Valid refund amount is required');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.paymentStatus !== 'completed') {
    res.status(400);
    throw new Error('Cannot refund unpaid order');
  }

  if (order.refundAmount > 0) {
    res.status(400);
    throw new Error('Refund already processed for this order');
  }

  order.refundAmount = refundAmount;
  order.paymentStatus = 'refunded';
  order.refundedAt = new Date();
  order.cancellationReason = 'refund_processed';
  order.cancellationNote = reason || 'Customer refund';

  await order.updateStatus('refunded', `Refund processed: ${reason}`, req.user._id);

  const updatedOrder = await Order.findById(order._id)
    .populate('customer', 'name email')
    .populate('orderItems.product', 'name');

  res.status(200).json({
    success: true,
    message: `Refund of $${refundAmount} processed successfully`,
    data: updatedOrder
  });
});

// @desc    Get order analytics (Admin)
// @route   GET /api/orders/analytics/overview
// @access  Private (Admin)
export const getOrderAnalytics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  // Total orders and revenue
  const totalStats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        orderStatus: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        averageOrderValue: { $avg: '$totalPrice' }
      }
    }
  ]);

  // Orders by status
  const statusStats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  // Daily revenue for chart
  const dailyRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        orderStatus: { $ne: 'cancelled' },
        paymentStatus: 'completed'
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const analytics = {
    period: {
      start: startDate,
      end: new Date(),
      days: parseInt(days)
    },
    overview: totalStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0
    },
    statusDistribution: statusStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {}),
    dailyRevenue
  };

  res.status(200).json({
    success: true,
    data: analytics
  });
});