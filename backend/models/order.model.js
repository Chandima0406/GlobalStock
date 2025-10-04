import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    // Order Information
    orderNumber: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    
    // Customer Information
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
    customerEmail: {
      type: String,
      required: true
    },
    
    customerPhone: {
      type: String
    },
    
    // Order Items
    orderItems: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      image: {
        type: String,
        default: ''
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
      },
      variant: {
        sku: String,
        attributes: {
          type: Map,
          of: String
        }
      },
      totalPrice: {
        type: Number,
        required: true,
        min: 0
      }
    }],
    
    // Shipping Information
    shippingAddress: {
      type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home'
      },
      firstName: {
        type: String,
        required: true,
        trim: true
      },
      lastName: {
        type: String,
        required: true,
        trim: true
      },
      street: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true,
        default: 'Sri Lanka'
      },
      zipCode: {
        type: String,
        required: true
      },
      phone: String
    },
    
    // Payment Information
    paymentMethod: {
      type: String,
      required: true,
      enum: ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery', 'bank_transfer'],
      default: 'cash_on_delivery'
    },
    
    paymentResult: {
      id: String, // Payment processor ID (Stripe, PayPal, etc.)
      status: String,
      update_time: String,
      email_address: String
    },
    
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending'
    },
    
    paidAt: {
      type: Date
    },
    
    // Pricing Breakdown
    itemsPrice: {
      type: Number,
      required: true,
      default: 0
    },
    
    taxPrice: {
      type: Number,
      required: true,
      default: 0
    },
    
    shippingPrice: {
      type: Number,
      required: true,
      default: 0
    },
    
    discount: {
      amount: {
        type: Number,
        default: 0
      },
      couponCode: String,
      type: {
        type: String,
        enum: ['percentage', 'fixed', 'free_shipping'],
        default: 'fixed'
      }
    },
    
    totalPrice: {
      type: Number,
      required: true,
      default: 0
    },
    
    // Order Status & Tracking
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
      ],
      default: 'pending'
    },
    
    statusHistory: [{
      status: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      note: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    
    // Shipping & Delivery
    shippingMethod: {
      type: String,
      default: 'standard'
    },
    
    trackingNumber: {
      type: String
    },
    
    carrier: {
      type: String
    },
    
    estimatedDelivery: {
      type: Date
    },
    
    deliveredAt: {
      type: Date
    },
    
    // Vendor Information (for multi-vendor orders)
    vendors: [{
      vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      vendorName: String,
      items: [{
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        quantity: Number,
        price: Number,
        status: {
          type: String,
          enum: ['pending', 'confirmed', 'shipped', 'delivered'],
          default: 'pending'
        }
      }]
    }],
    
    // Notes & Communication
    customerNotes: {
      type: String,
      maxLength: 500
    },
    
    adminNotes: {
      type: String,
      maxLength: 1000
    },
    
    // Cancellation & Refunds
    cancellationReason: {
      type: String,
      enum: [
        'changed_mind',
        'found_cheaper',
        'shipping_delay',
        'product_not_needed',
        'wrong_item_ordered',
        'other'
      ]
    },
    
    cancellationNote: String,
    
    refundAmount: {
      type: Number,
      default: 0
    },
    
    refundedAt: {
      type: Date
    },
    
    // Analytics & Metadata
    ipAddress: String,
    
    userAgent: String,
    
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin'],
      default: 'web'
    },
    
    // Fraud Detection
    fraudScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    
    isFlagged: {
      type: Boolean,
      default: false
    },
    
    flagReason: String
  },
  {
    timestamps: true
  }
);

// ======================
// INDEXES for Performance
// ======================
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'vendors.vendor': 1 });
orderSchema.index({ trackingNumber: 1 });

// ======================
// VIRTUAL FIELDS
// ======================

// Check if order is completed
orderSchema.virtual('isCompleted').get(function() {
  return this.orderStatus === 'delivered' && this.paymentStatus === 'completed';
});

// Check if order can be cancelled
orderSchema.virtual('canBeCancelled').get(function() {
  const nonCancellableStatuses = ['shipped', 'delivered', 'cancelled', 'refunded'];
  return !nonCancellableStatuses.includes(this.orderStatus);
});

// Get order age in days
orderSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// ======================
// INSTANCE METHODS
// ======================

// Calculate total price
orderSchema.methods.calculateTotals = function() {
  // Calculate items total
  this.itemsPrice = this.orderItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // Calculate final total
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice - this.discount.amount;
  
  return this.totalPrice;
};

// Update order status with history
orderSchema.methods.updateStatus = async function(newStatus, note = '', updatedBy = null) {
  const oldStatus = this.orderStatus;
  this.orderStatus = newStatus;
  
  // Add to status history
  this.statusHistory.push({
    status: newStatus,
    note,
    updatedBy
  });
  
  // Set timestamps for specific statuses
  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  } else if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
  }
  
  await this.save();
  return this;
};

// Add tracking information
orderSchema.methods.addTracking = async function(trackingNumber, carrier, estimatedDelivery) {
  this.trackingNumber = trackingNumber;
  this.carrier = carrier;
  this.estimatedDelivery = estimatedDelivery;
  
  // Update status to shipped if not already
  if (this.orderStatus !== 'shipped') {
    await this.updateStatus('shipped', 'Tracking information added');
  }
  
  return await this.save();
};

// Process payment
orderSchema.methods.processPayment = async function(paymentResult) {
  this.paymentResult = paymentResult;
  this.paymentStatus = 'completed';
  this.paidAt = new Date();
  
  return await this.save();
};

// Calculate refund amount
orderSchema.methods.calculateRefund = function() {
  if (this.orderStatus === 'cancelled') {
    // Full refund for cancelled orders
    this.refundAmount = this.totalPrice;
  } else {
    // Partial refund logic (customize based on your business rules)
    this.refundAmount = this.itemsPrice; // Refund only items price
  }
  return this.refundAmount;
};

// ======================
// STATIC METHODS
// ======================

// Generate unique order number
orderSchema.statics.generateOrderNumber = function() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GS${timestamp.substring(timestamp.length - 6)}${random}`;
};

// Find orders by customer
orderSchema.statics.findByCustomer = function(customerId, limit = 20) {
  return this.find({ customer: customerId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('orderItems.product', 'name images');
};

// Find orders by status
orderSchema.statics.findByStatus = function(status, limit = 50) {
  return this.find({ orderStatus: status })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('customer', 'name email')
    .populate('orderItems.product', 'name brand');
};

// Get sales statistics
orderSchema.statics.getSalesStats = async function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    orderStatus: { $ne: 'cancelled' },
    paymentStatus: 'completed'
  };
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        averageOrderValue: { $avg: '$totalPrice' },
        uniqueCustomers: { $addToSet: '$customer' }
      }
    },
    {
      $project: {
        _id: 0,
        totalOrders: 1,
        totalRevenue: { $round: ['$totalRevenue', 2] },
        averageOrderValue: { $round: ['$averageOrderValue', 2] },
        uniqueCustomers: { $size: '$uniqueCustomers' }
      }
    }
  ]);
  
  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    uniqueCustomers: 0
  };
};

// Find recent orders
orderSchema.statics.findRecent = function(limit = 10) {
  return this.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('customer', 'name email')
    .populate('orderItems.product', 'name images');
};

// ======================
// MIDDLEWARE
// ======================

// Pre-save middleware to generate order number and calculate totals
orderSchema.pre('save', async function(next) {
  // Generate order number if new
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = this.constructor.generateOrderNumber();
  }
  
  // Calculate totals before saving
  if (this.isModified('orderItems') || this.isModified('taxPrice') || 
      this.isModified('shippingPrice') || this.isModified('discount.amount')) {
    this.calculateTotals();
  }
  
  // Add initial status to history for new orders
  if (this.isNew) {
    this.statusHistory.push({
      status: this.orderStatus,
      note: 'Order created',
      timestamp: new Date()
    });
  }
  
  next();
});

// Post-save middleware to update product inventory
orderSchema.post('save', async function(doc, next) {
  if (doc.orderStatus === 'cancelled' || doc.orderStatus === 'refunded') {
    // Restore inventory for cancelled/refunded orders
    const Product = mongoose.model('Product');
    
    for (const item of doc.orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { 'inventory.quantity': item.quantity } }
      );
    }
  }
  next();
});

// ======================
// JSON SERIALIZATION
// ======================

orderSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Remove sensitive information
    delete ret.ipAddress;
    delete ret.userAgent;
    delete ret.fraudScore;
    delete ret.isFlagged;
    delete ret.flagReason;
    return ret;
  }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;