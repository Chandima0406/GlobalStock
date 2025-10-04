import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    // Basic Product Information
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
      maxLength: [200, 'Product name cannot be more than 200 characters']
    },
    
    description: {
      type: String,
      required: [true, 'Please add a product description'],
      maxLength: [2000, 'Description cannot be more than 2000 characters']
    },
    
    shortDescription: {
      type: String,
      maxLength: [500, 'Short description cannot be more than 500 characters']
    },
    
    // Pricing Information
    price: {
      type: Number,
      required: [true, 'Please add a product price'],
      min: [0, 'Price cannot be negative'],
      set: value => Math.round(value * 100) / 100 // Store with 2 decimal precision
    },
    
    comparePrice: {
      type: Number,
      min: [0, 'Compare price cannot be negative'],
      set: value => value ? Math.round(value * 100) / 100 : undefined
    },
    
    costPrice: {
      type: Number,
      min: [0, 'Cost price cannot be negative']
    },
    
    // Category & Classification
    category: {
      type: String,
      required: [true, 'Please add a product category'],
      enum: [
        'electronics',
        'clothing',
        'books',
        'home-garden',
        'sports-outdoors',
        'beauty-health',
        'toys-games',
        'automotive',
        'food-grocery',
        'jewelry-accessories',
        'other'
      ]
    },
    
    subcategory: {
      type: String,
      trim: true
    },
    
    brand: {
      type: String,
      required: [true, 'Please add a brand'],
      trim: true
    },
    
    tags: [{
      type: String,
      trim: true
    }],
    
    // Images & Media
    images: [{
      url: {
        type: String,
        required: true
      },
      alt: {
        type: String,
        default: ''
      },
      isPrimary: {
        type: Boolean,
        default: false
      }
    }],
    
    // Inventory Management
    inventory: {
      sku: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true,
        trim: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [0, 'Quantity cannot be negative'],
        default: 0
      },
      lowStockAlert: {
        type: Number,
        default: 10
      },
      trackQuantity: {
        type: Boolean,
        default: true
      },
      allowBackorder: {
        type: Boolean,
        default: false
      },
      weight: {
        value: Number,
        unit: {
          type: String,
          enum: ['g', 'kg', 'lb', 'oz'],
          default: 'g'
        }
      },
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: {
          type: String,
          enum: ['cm', 'm', 'in', 'ft'],
          default: 'cm'
        }
      }
    },
    
    // Product Specifications (Amazon-style specs)
    specifications: {
      type: Map,
      of: String
    },
    
    features: [{
      type: String,
      trim: true
    }],
    
    // Vendor Information
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    vendorName: {
      type: String,
      required: true
    },
    
    // Reviews & Ratings
    reviews: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }],
    
    rating: {
      average: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
        set: value => Math.round(value * 10) / 10 // 1 decimal place
      },
      count: {
        type: Number,
        default: 0
      },
      distribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 }
      }
    },
    
    // Shipping Information
    shipping: {
      weight: Number,
      dimensions: {
        length: Number,
        width: Number, 
        height: Number
      },
      isFreeShipping: {
        type: Boolean,
        default: false
      },
      shippingClass: String
    },
    
    // SEO & Marketing
    seo: {
      title: String,
      description: String,
      slug: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
      },
      keywords: [String]
    },
    
    // Product Status & Visibility
    status: {
      type: String,
      enum: ['active', 'draft', 'archived', 'out-of-stock'],
      default: 'active'
    },
    
    isFeatured: {
      type: Boolean,
      default: false
    },
    
    isPublished: {
      type: Boolean,
      default: true
    },
    
    // Sales & Analytics
    sales: {
      totalSold: {
        type: Number,
        default: 0
      },
      totalRevenue: {
        type: Number,
        default: 0
      },
      lastSold: Date
    },
    
    // Variants (for products with options like size, color)
    hasVariants: {
      type: Boolean,
      default: false
    },
    
    variants: [{
      sku: String,
      price: Number,
      comparePrice: Number,
      quantity: Number,
      attributes: {
        type: Map,
        of: String
      },
      images: [String]
    }],
    
    // Product Options (for variant creation)
    options: [{
      name: {
        type: String,
        required: true
      },
      values: [{
        type: String,
        required: true
      }]
    }],
    
    // Warranty & Support
    warranty: {
      hasWarranty: {
        type: Boolean,
        default: false
      },
      period: String, // "1 year", "2 years", etc.
      description: String
    },
    
    // Digital Product Fields (if applicable)
    isDigital: {
      type: Boolean,
      default: false
    },
    
    digitalFile: {
      url: String,
      fileName: String,
      fileSize: Number
    },
    
    // Related Products
    relatedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    
    // Metadata
    meta: {
      views: {
        type: Number,
        default: 0
      },
      clicks: {
        type: Number,
        default: 0
      },
      conversions: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true
  }
);

// ======================
// INDEXES for Performance
// ======================
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ 'sales.totalSold': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ vendor: 1 });

// ======================
// VIRTUAL FIELDS
// ======================

// Check if product is in stock
productSchema.virtual('inStock').get(function() {
  if (!this.inventory.trackQuantity) return true;
  return this.inventory.quantity > 0;
});

// Calculate discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Get primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0] ? this.images[0].url : '');
});

// Check if product is on sale
productSchema.virtual('onSale').get(function() {
  return this.comparePrice && this.comparePrice > this.price;
});

// ======================
// INSTANCE METHODS
// ======================

// Update inventory quantity
productSchema.methods.updateInventory = async function(quantity, operation = 'set') {
  if (operation === 'increment') {
    this.inventory.quantity += quantity;
  } else if (operation === 'decrement') {
    this.inventory.quantity = Math.max(0, this.inventory.quantity - quantity);
  } else {
    this.inventory.quantity = quantity;
  }
  
  // Update status based on inventory
  if (this.inventory.quantity === 0 && this.inventory.trackQuantity) {
    this.status = 'out-of-stock';
  } else if (this.status === 'out-of-stock' && this.inventory.quantity > 0) {
    this.status = 'active';
  }
  
  return await this.save();
};

// Add product view
productSchema.methods.addView = async function() {
  this.meta.views += 1;
  return await this.save();
};

// Record sale
productSchema.methods.recordSale = async function(quantity, revenue) {
  this.sales.totalSold += quantity;
  this.sales.totalRevenue += revenue;
  this.sales.lastSold = new Date();
  
  // Update inventory if tracking
  if (this.inventory.trackQuantity) {
    await this.updateInventory(quantity, 'decrement');
  }
  
  return await this.save();
};

// Update rating from reviews
productSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { product: this._id } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 },
        distribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length > 0) {
    const stat = stats[0];
    this.rating.average = Math.round(stat.averageRating * 10) / 10;
    this.rating.count = stat.ratingCount;
    
    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stat.distribution.forEach(rating => {
      const star = Math.round(rating);
      if (distribution[star] !== undefined) {
        distribution[star] += 1;
      }
    });
    
    this.rating.distribution = distribution;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
    this.rating.distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }

  return await this.save();
};

// Generate slug from name
productSchema.methods.generateSlug = async function() {
  const baseSlug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  let slug = baseSlug;
  let counter = 1;
  
  // Check if slug already exists
  while (await mongoose.model('Product').findOne({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  this.seo.slug = slug;
  return await this.save();
};

// ======================
// STATIC METHODS
// ======================

// Find products by category
productSchema.statics.findByCategory = function(category, limit = 50) {
  return this.find({ category, status: 'active' })
    .limit(limit)
    .sort({ 'rating.average': -1 });
};

// Find featured products
productSchema.statics.findFeatured = function(limit = 10) {
  return this.find({ isFeatured: true, status: 'active' })
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Find products by vendor
productSchema.statics.findByVendor = function(vendorId) {
  return this.find({ vendor: vendorId })
    .sort({ createdAt: -1 });
};

// Search products
productSchema.statics.search = function(query, limit = 20) {
  return this.find({
    $text: { $search: query },
    status: 'active'
  })
  .limit(limit)
  .sort({ score: { $meta: 'textScore' } });
};

// Get low stock products
productSchema.statics.getLowStock = function(limit = 50) {
  return this.find({
    'inventory.quantity': { $lte: 10 },
    'inventory.trackQuantity': true,
    status: 'active'
  })
  .limit(limit)
  .sort({ 'inventory.quantity': 1 });
};

// ======================
// MIDDLEWARE
// ======================

// Generate slug before saving if not provided
productSchema.pre('save', async function(next) {
  if (this.isModified('name') && (!this.seo.slug || this.seo.slug === '')) {
    await this.generateSlug();
  }
  
  // Generate SKU if not provided
  if (!this.inventory.sku) {
    const prefix = this.brand.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.inventory.sku = `${prefix}-${random}`;
  }
  
  next();
});

// ======================
// JSON SERIALIZATION
// ======================

productSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Remove heavy fields for list views
    delete ret.reviews;
    delete ret.relatedProducts;
    delete ret.variants;
    return ret;
  }
});

const Product = mongoose.model('Product', productSchema);

export default Product;