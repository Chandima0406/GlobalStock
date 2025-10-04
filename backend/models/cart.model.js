import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  
  variant: {
    sku: String,
    attributes: {
      type: Map,
      of: String
    },
    price: Number
  },
  
  addedAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Customizations or special instructions
  notes: {
    type: String,
    maxLength: [200, 'Notes cannot exceed 200 characters']
  },
  
  // For digital products
  isDigital: {
    type: Boolean,
    default: false
  }
});

const cartSchema = mongoose.Schema(
  {
    // User reference (for logged-in users)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    
    // Session ID (for guest users - optional)
    sessionId: {
      type: String,
      index: true,
      sparse: true
    },
    
    // Cart items
    items: [cartItemSchema],
    
    // Pricing information
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Subtotal cannot be negative']
    },
    
    discount: {
      amount: {
        type: Number,
        default: 0,
        min: 0
      },
      couponCode: String,
      type: {
        type: String,
        enum: ['percentage', 'fixed', 'free_shipping'],
        default: 'fixed'
      },
      description: String
    },
    
    tax: {
      amount: {
        type: Number,
        default: 0,
        min: 0
      },
      rate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      description: String
    },
    
    shipping: {
      amount: {
        type: Number,
        default: 0,
        min: 0
      },
      method: String,
      description: String,
      estimatedDays: Number,
      isFree: {
        type: Boolean,
        default: false
      }
    },
    
    total: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Total cannot be negative']
    },
    
    // Currency information
    currency: {
      type: String,
      default: 'LKR',
      uppercase: true,
      trim: true
    },
    
    // Cart expiration (for abandoned carts)
    expiresAt: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      },
      index: true
    },
    
    // Cart metadata
    itemCount: {
      type: Number,
      default: 0,
      min: 0
    },
    
    lastActive: {
      type: Date,
      default: Date.now
    },
    
    // Shipping address (if already provided)
    shippingAddress: {
      type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home'
      },
      firstName: String,
      lastName: String,
      street: String,
      city: String,
      state: String,
      country: {
        type: String,
        default: 'Sri Lanka'
      },
      zipCode: String,
      phone: String
    },
    
    // Selected payment method
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery', 'bank_transfer'],
      default: 'cash_on_delivery'
    },
    
    // Cart status
    status: {
      type: String,
      enum: ['active', 'abandoned', 'converted', 'expired'],
      default: 'active'
    },
    
    // Merge tracking (when user logs in with guest cart)
    mergedFrom: [{
      sessionId: String,
      mergedAt: Date,
      itemsCount: Number
    }],
    
    // Abandoned cart recovery
    recoveryEmailsSent: {
      type: Number,
      default: 0,
      min: 0
    },
    
    lastRecoveryEmailSent: Date,
    
    // Custom fields
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ======================
// INDEXES for Performance
// ======================
cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ expiresAt: 1 });
cartSchema.index({ status: 1 });
cartSchema.index({ lastActive: -1 });
cartSchema.index({ 'items.product': 1 });

// ======================
// VIRTUAL FIELDS
// ======================

// Check if cart is empty
cartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

// Get total quantity of all items
cartSchema.virtual('totalQuantity').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Check if cart has physical products (needs shipping)
cartSchema.virtual('hasPhysicalProducts').get(function() {
  return this.items.some(item => !item.isDigital);
});

// Check if cart has digital products
cartSchema.virtual('hasDigitalProducts').get(function() {
  return this.items.some(item => item.isDigital);
});

// Get cart age in days
cartSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// ======================
// INSTANCE METHODS
// ======================

// Calculate cart totals
cartSchema.methods.calculateTotals = function() {
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => {
    const itemPrice = item.variant?.price || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);
  
  // Calculate tax if rate is provided
  if (this.tax.rate > 0 && this.tax.amount === 0) {
    this.tax.amount = this.subtotal * (this.tax.rate / 100);
  }
  
  // Apply discount
  let discountAmount = this.discount.amount;
  if (this.discount.type === 'percentage' && this.discount.amount > 0) {
    discountAmount = this.subtotal * (this.discount.amount / 100);
  }
  
  // Calculate shipping
  let shippingAmount = this.shipping.amount;
  if (this.shipping.isFree || this.discount.type === 'free_shipping') {
    shippingAmount = 0;
  }
  
  // Calculate total
  this.total = this.subtotal + this.tax.amount + shippingAmount - discountAmount;
  
  // Update item count
  this.itemCount = this.items.length;
  
  return this.total;
};

// Add item to cart
cartSchema.methods.addItem = async function(productId, quantity = 1, variant = null, notes = '') {
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Check stock availability
  if (product.inventory.trackQuantity && product.inventory.quantity < quantity) {
    throw new Error(`Not enough stock. Available: ${product.inventory.quantity}`);
  }
  
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() &&
    this.areVariantsEqual(item.variant?.attributes, variant?.attributes)
  );
  
  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].updatedAt = new Date();
    this.items[existingItemIndex].notes = notes || this.items[existingItemIndex].notes;
  } else {
    // Add new item
    const itemPrice = variant?.price || product.price;
    
    this.items.push({
      product: productId,
      quantity,
      price: itemPrice,
      variant: variant || {},
      notes,
      isDigital: product.isDigital || false,
      addedAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  this.calculateTotals();
  this.lastActive = new Date();
  
  return await this.save();
};

// Update item quantity
cartSchema.methods.updateItemQuantity = async function(productId, quantity, variantAttributes = null) {
  const itemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() &&
    this.areVariantsEqual(item.variant?.attributes, variantAttributes)
  );
  
  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    this.items.splice(itemIndex, 1);
  } else {
    // Update quantity
    this.items[itemIndex].quantity = quantity;
    this.items[itemIndex].updatedAt = new Date();
  }
  
  this.calculateTotals();
  this.lastActive = new Date();
  
  return await this.save();
};

// Remove item from cart
cartSchema.methods.removeItem = async function(productId, variantAttributes = null) {
  const initialLength = this.items.length;
  
  this.items = this.items.filter(item => 
    !(item.product.toString() === productId.toString() &&
      this.areVariantsEqual(item.variant?.attributes, variantAttributes))
  );
  
  if (this.items.length === initialLength) {
    throw new Error('Item not found in cart');
  }
  
  this.calculateTotals();
  this.lastActive = new Date();
  
  return await this.save();
};

// Clear entire cart
cartSchema.methods.clearCart = async function() {
  this.items = [];
  this.subtotal = 0;
  this.discount.amount = 0;
  this.tax.amount = 0;
  this.shipping.amount = 0;
  this.total = 0;
  this.itemCount = 0;
  this.lastActive = new Date();
  
  return await this.save();
};

// Apply coupon/discount
cartSchema.methods.applyDiscount = async function(couponCode, discountAmount, discountType = 'fixed', description = '') {
  this.discount = {
    couponCode,
    amount: discountAmount,
    type: discountType,
    description
  };
  
  this.calculateTotals();
  this.lastActive = new Date();
  
  return await this.save();
};

// Remove discount
cartSchema.methods.removeDiscount = async function() {
  this.discount = {
    amount: 0,
    couponCode: '',
    type: 'fixed',
    description: ''
  };
  
  this.calculateTotals();
  this.lastActive = new Date();
  
  return await this.save();
};

// Set shipping address
cartSchema.methods.setShippingAddress = async function(address) {
  this.shippingAddress = address;
  this.lastActive = new Date();
  
  return await this.save();
};

// Set shipping method
cartSchema.methods.setShippingMethod = async function(method, amount, description = '', estimatedDays = null) {
  this.shipping = {
    method,
    amount,
    description,
    estimatedDays,
    isFree: amount === 0
  };
  
  this.calculateTotals();
  this.lastActive = new Date();
  
  return await this.save();
};

// Merge with another cart (for guest to user conversion)
cartSchema.methods.mergeCart = async function(guestCart) {
  for (const guestItem of guestCart.items) {
    await this.addItem(
      guestItem.product,
      guestItem.quantity,
      guestItem.variant,
      guestItem.notes
    );
  }
  
  // Record merge
  this.mergedFrom.push({
    sessionId: guestCart.sessionId,
    mergedAt: new Date(),
    itemsCount: guestCart.items.length
  });
  
  return await this.save();
};

// Check if product exists in cart
cartSchema.methods.hasProduct = function(productId, variantAttributes = null) {
  return this.items.some(item => 
    item.product.toString() === productId.toString() &&
    this.areVariantsEqual(item.variant?.attributes, variantAttributes)
  );
};

// Get item by product and variant
cartSchema.methods.getItem = function(productId, variantAttributes = null) {
  return this.items.find(item => 
    item.product.toString() === productId.toString() &&
    this.areVariantsEqual(item.variant?.attributes, variantAttributes)
  );
};

// Helper method to compare variants
cartSchema.methods.areVariantsEqual = function(variant1, variant2) {
  if (!variant1 && !variant2) return true;
  if (!variant1 || !variant2) return false;
  
  const map1 = variant1 instanceof Map ? variant1 : new Map(Object.entries(variant1));
  const map2 = variant2 instanceof Map ? variant2 : new Map(Object.entries(variant2));
  
  if (map1.size !== map2.size) return false;
  
  for (const [key, value] of map1) {
    if (map2.get(key) !== value) return false;
  }
  
  return true;
};

// ======================
// STATIC METHODS
// ======================

// Find cart by user ID
cartSchema.statics.findByUserId = function(userId) {
  return this.findOne({ user: userId })
    .populate('items.product', 'name images price inventory isDigital')
    .populate('user', 'name email');
};

// Find cart by session ID
cartSchema.statics.findBySessionId = function(sessionId) {
  return this.findOne({ sessionId })
    .populate('items.product', 'name images price inventory isDigital');
};

// Find abandoned carts
cartSchema.statics.findAbandonedCarts = function(daysOld = 1, limit = 100) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  
  return this.find({
    lastActive: { $lt: cutoffDate },
    status: 'active',
    itemCount: { $gt: 0 }
  })
  .populate('user', 'name email')
  .populate('items.product', 'name images price')
  .limit(limit)
  .sort({ lastActive: 1 });
};

// Get cart statistics
cartSchema.statics.getCartStats = async function() {
  const stats = await this.aggregate([
    {
      $match: {
        status: 'active',
        itemCount: { $gt: 0 }
      }
    },
    {
      $group: {
        _id: null,
        totalActiveCarts: { $sum: 1 },
        totalItemsInCarts: { $sum: '$itemCount' },
        averageCartValue: { $avg: '$total' },
        maxCartValue: { $max: '$total' },
        minCartValue: { $min: '$total' }
      }
    },
    {
      $project: {
        _id: 0,
        totalActiveCarts: 1,
        totalItemsInCarts: 1,
        averageCartValue: { $round: ['$averageCartValue', 2] },
        maxCartValue: 1,
        minCartValue: 1
      }
    }
  ]);
  
  return stats[0] || {
    totalActiveCarts: 0,
    totalItemsInCarts: 0,
    averageCartValue: 0,
    maxCartValue: 0,
    minCartValue: 0
  };
};

// Clean up expired carts
cartSchema.statics.cleanupExpiredCarts = async function() {
  const result = await this.updateMany(
    {
      expiresAt: { $lt: new Date() },
      status: 'active'
    },
    {
      $set: { status: 'expired' }
    }
  );
  
  return result.modifiedCount;
};

// ======================
// MIDDLEWARE
// ======================

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  this.calculateTotals();
  this.lastActive = new Date();
  next();
});

// Update expiration date when cart becomes active again
cartSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'active' && this.items.length > 0) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;