import mongoose from 'mongoose';

const categorySchema = mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      trim: true,
      maxLength: [50, 'Category name cannot be more than 50 characters'],
      unique: true,
      index: true
    },
    
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    
    description: {
      type: String,
      maxLength: [500, 'Description cannot be more than 500 characters'],
      default: ''
    },
    
    // Hierarchy & Organization
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    
    ancestors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    
    level: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    
    path: {
      type: String,
      default: ''
    },
    
    // Visual Representation
    image: {
      url: {
        type: String,
        default: ''
      },
      alt: {
        type: String,
        default: ''
      }
    },
    
    icon: {
      type: String,
      default: ''
    },
    
    color: {
      type: String,
      default: '#6B7280'
    },
    
    // Display & Organization
    displayOrder: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    
    isFeatured: {
      type: Boolean,
      default: false
    },
    
    showInNavigation: {
      type: Boolean,
      default: true
    },
    
    showInFooter: {
      type: Boolean,
      default: false
    },
    
    // Status & Visibility
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active'
    },
    
    // SEO & Marketing
    seo: {
      title: {
        type: String,
        maxLength: [60, 'SEO title cannot be more than 60 characters']
      },
      description: {
        type: String,
        maxLength: [160, 'SEO description cannot be more than 160 characters']
      },
      keywords: [{
        type: String,
        trim: true
      }],
      canonicalUrl: String
    },
    
    // Content & Metadata
    content: {
      type: String,
      maxLength: [2000, 'Content cannot be more than 2000 characters']
    },
    
    attributes: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      type: {
        type: String,
        enum: ['text', 'number', 'select', 'boolean', 'color'],
        default: 'text'
      },
      values: [String],
      isRequired: {
        type: Boolean,
        default: false
      },
      isFilterable: {
        type: Boolean,
        default: true
      },
      displayOrder: {
        type: Number,
        default: 0
      }
    }],
    
    // Analytics & Statistics
    stats: {
      productCount: {
        type: Number,
        default: 0
      },
      viewCount: {
        type: Number,
        default: 0
      },
      clickCount: {
        type: Number,
        default: 0
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    },
    
    // Vendor & Management
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Custom Fields
    customFields: {
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
// slug index is automatically created by unique: true
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ status: 1 });
categorySchema.index({ displayOrder: 1 });
categorySchema.index({ isFeatured: 1 });
categorySchema.index({ showInNavigation: 1 });
categorySchema.index({ 'ancestors': 1 });

// ======================
// VIRTUAL FIELDS
// ======================

// Get subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
  justOne: false
});

// Get products count (will be populated)
categorySchema.virtual('productsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Get full category path
categorySchema.virtual('fullPath').get(function() {
  return this.path ? `${this.path} > ${this.name}` : this.name;
});

// Check if category has children
categorySchema.virtual('hasChildren').get(function() {
  // This will be populated when needed
  return false; // Default, will be set during population
});

// ======================
// INSTANCE METHODS
// ======================

// Generate slug from name
categorySchema.methods.generateSlug = async function() {
  const baseSlug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  let slug = baseSlug;
  let counter = 1;
  
  // Check if slug already exists
  while (await mongoose.model('Category').findOne({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  this.slug = slug;
  return slug;
};

// Update category path and ancestors
categorySchema.methods.updateHierarchy = async function() {
  if (this.parent) {
    const parentCategory = await mongoose.model('Category').findById(this.parent);
    if (parentCategory) {
      this.ancestors = [...parentCategory.ancestors, this.parent];
      this.level = parentCategory.level + 1;
      this.path = parentCategory.path ? `${parentCategory.path} > ${parentCategory.name}` : parentCategory.name;
    }
  } else {
    this.ancestors = [];
    this.level = 0;
    this.path = '';
  }
  
  return await this.save();
};

// Increment product count
categorySchema.methods.incrementProductCount = async function() {
  this.stats.productCount += 1;
  this.stats.lastUpdated = new Date();
  return await this.save();
};

// Decrement product count
categorySchema.methods.decrementProductCount = async function() {
  this.stats.productCount = Math.max(0, this.stats.productCount - 1);
  this.stats.lastUpdated = new Date();
  return await this.save();
};

// Add view count
categorySchema.methods.addView = async function() {
  this.stats.viewCount += 1;
  return await this.save();
};

// Add attribute to category
categorySchema.methods.addAttribute = async function(attributeData) {
  this.attributes.push(attributeData);
  return await this.save();
};

// Remove attribute from category
categorySchema.methods.removeAttribute = async function(attributeName) {
  this.attributes = this.attributes.filter(attr => attr.name !== attributeName);
  return await this.save();
};

// ======================
// STATIC METHODS
// ======================

// Get all root categories (no parent)
categorySchema.statics.getRootCategories = function() {
  return this.find({ parent: null, status: 'active' })
    .sort({ displayOrder: 1, name: 1 });
};

// Get featured categories
categorySchema.statics.getFeaturedCategories = function(limit = 10) {
  return this.find({ 
    isFeatured: true, 
    status: 'active' 
  })
  .sort({ displayOrder: 1, name: 1 })
  .limit(limit);
};

// Get categories for navigation
categorySchema.statics.getNavigationCategories = function() {
  return this.find({ 
    showInNavigation: true, 
    status: 'active' 
  })
  .sort({ displayOrder: 1, name: 1 });
};

// Get category tree (hierarchical structure)
categorySchema.statics.getCategoryTree = async function() {
  const categories = await this.find({ status: 'active' })
    .sort({ level: 1, displayOrder: 1, name: 1 });
  
  const buildTree = (parentId = null) => {
    return categories
      .filter(cat => {
        if (parentId === null) return cat.parent === null;
        return cat.parent && cat.parent.toString() === parentId.toString();
      })
      .map(category => ({
        ...category.toObject(),
        children: buildTree(category._id)
      }));
  };
  
  return buildTree();
};

// Find category by slug
categorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, status: 'active' })
    .populate('parent', 'name slug')
    .populate('subcategories', 'name slug image displayOrder');
};

// Get categories with product counts
categorySchema.statics.getCategoriesWithCounts = async function() {
  const Product = mongoose.model('Product');
  
  const categories = await this.find({ status: 'active' })
    .sort({ displayOrder: 1, name: 1 });
  
  // Get product counts for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({ 
        category: category.name,
        status: 'active'
      });
      
      return {
        ...category.toObject(),
        productCount
      };
    })
  );
  
  return categoriesWithCounts;
};

// Search categories
categorySchema.statics.searchCategories = function(query, limit = 10) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { 'seo.keywords': { $in: [new RegExp(query, 'i')] } }
    ],
    status: 'active'
  })
  .limit(limit)
  .sort({ displayOrder: 1, name: 1 });
};

// ======================
// MIDDLEWARE
// ======================

// Pre-save middleware
categorySchema.pre('save', async function(next) {
  // Generate slug if not provided or name changed
  if (this.isModified('name') && (!this.slug || this.slug === '')) {
    await this.generateSlug();
  }
  
  // Update hierarchy if parent changed
  if (this.isModified('parent')) {
    await this.updateHierarchy();
  }
  
  // Ensure displayOrder is set
  if (this.isNew && !this.displayOrder) {
    const maxOrder = await mongoose.model('Category')
      .findOne({ parent: this.parent })
      .sort({ displayOrder: -1 })
      .select('displayOrder');
    
    this.displayOrder = maxOrder ? maxOrder.displayOrder + 1 : 0;
  }
  
  next();
});

// Pre-remove middleware
categorySchema.pre('remove', async function(next) {
  const Category = mongoose.model('Category');
  const Product = mongoose.model('Product');
  
  // Check if category has subcategories
  const subcategoryCount = await Category.countDocuments({ parent: this._id });
  if (subcategoryCount > 0) {
    throw new Error('Cannot delete category with subcategories. Please delete subcategories first.');
  }
  
  // Check if category has products
  const productCount = await Product.countDocuments({ category: this.name });
  if (productCount > 0) {
    throw new Error('Cannot delete category with products. Please reassign or delete products first.');
  }
  
  next();
});

// Post-save middleware to update subcategories hierarchy
categorySchema.post('save', async function(doc, next) {
  if (doc.isModified('ancestors') || doc.isModified('level') || doc.isModified('path')) {
    // Update all subcategories
    const Category = mongoose.model('Category');
    const subcategories = await Category.find({ parent: doc._id });
    
    for (const subcategory of subcategories) {
      await subcategory.updateHierarchy();
    }
  }
  next();
});

// ======================
// VALIDATION METHODS
// ======================

// Validate parent category (avoid circular references)
categorySchema.methods.isValidParent = async function(parentId) {
  if (!parentId) return true;
  
  if (parentId.toString() === this._id.toString()) {
    return false; // Cannot be parent of itself
  }
  
  const parentCategory = await mongoose.model('Category').findById(parentId);
  if (!parentCategory) return false;
  
  // Check if parent is in ancestors (circular reference)
  if (this.ancestors.some(ancestor => ancestor.toString() === parentId.toString())) {
    return false;
  }
  
  return true;
};

const Category = mongoose.model('Category', categorySchema);

export default Category;