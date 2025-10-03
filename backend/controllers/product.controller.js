import asyncHandler from '../utils/asyncHandler.util.js';
import Product from '../models/product.model.js';

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Vendor/Admin)
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    brand,
    inventory,
    images,
    specifications,
    features,
    tags,
    comparePrice,
    shortDescription,
    shipping,
    warranty,
    isDigital,
    options
  } = req.body;

  // Validation
  if (!name || !description || !price || !category || !brand) {
    res.status(400);
    throw new Error('Please fill in all required fields: name, description, price, category, brand');
  }

  // Create product
  const product = await Product.create({
    name,
    description,
    shortDescription,
    price,
    comparePrice,
    category,
    brand,
    inventory: {
      quantity: inventory?.quantity || 0,
      lowStockAlert: inventory?.lowStockAlert || 10,
      trackQuantity: inventory?.trackQuantity !== false,
      allowBackorder: inventory?.allowBackorder || false,
      sku: inventory?.sku,
      weight: inventory?.weight,
      dimensions: inventory?.dimensions
    },
    images: images || [],
    specifications: specifications || {},
    features: features || [],
    tags: tags || [],
    vendor: req.user._id,
    vendorName: req.user.name,
    shipping: shipping || {},
    warranty: warranty || {},
    isDigital: isDigital || false,
    options: options || [],
    status: 'active'
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully 🎉',
    data: product
  });
});

// @desc    Get all products with filtering, pagination, and sorting
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    brand,
    minPrice,
    maxPrice,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    inStock,
    featured,
    vendor
  } = req.query;

  // Build filter object
  const filter = { status: 'active' };

  // Category filter
  if (category) {
    filter.category = category;
  }

  // Brand filter
  if (brand) {
    filter.brand = new RegExp(brand, 'i');
  }

  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Search filter
  if (search) {
    filter.$text = { $search: search };
  }

  // Stock filter
  if (inStock === 'true') {
    filter.$or = [
      { 'inventory.trackQuantity': false },
      { 'inventory.trackQuantity': true, 'inventory.quantity': { $gt: 0 } }
    ];
  }

  // Featured filter
  if (featured === 'true') {
    filter.isFeatured = true;
  }

  // Vendor filter
  if (vendor) {
    filter.vendor = vendor;
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const products = await Product.find(filter)
    .populate('vendor', 'name email')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Get total count for pagination
  const total = await Product.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
});

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if ID is a valid ObjectId or slug
  let product;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    // It's an ObjectId
    product = await Product.findById(id)
      .populate('vendor', 'name email rating')
      .populate('relatedProducts', 'name price images brand rating');
  } else {
    // It's probably a slug
    product = await Product.findOne({ 'seo.slug': id })
      .populate('vendor', 'name email rating')
      .populate('relatedProducts', 'name price images brand rating');
  }

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Increment view count
  await product.addView();

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Vendor/Admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  let product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user owns the product or is admin
  if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this product');
  }

  // Update product
  product = await Product.findByIdAndUpdate(
    id,
    { $set: req.body },
    { 
      new: true,
      runValidators: true
    }
  ).populate('vendor', 'name email');

  res.status(200).json({
    success: true,
    message: 'Product updated successfully ✅',
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Vendor/Admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user owns the product or is admin
  if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this product');
  }

  // Soft delete by changing status
  product.status = 'archived';
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Get products by vendor
// @route   GET /api/products/vendor/my-products
// @access  Private (Vendor)
export const getVendorProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const filter = { vendor: req.user._id };
  
  if (status) {
    filter.status = status;
  }

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Update product inventory
// @route   PUT /api/products/:id/inventory
// @access  Private (Vendor/Admin)
export const updateInventory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity, operation = 'set' } = req.body;

  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user owns the product or is admin
  if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this product');
  }

  await product.updateInventory(quantity, operation);

  res.status(200).json({
    success: true,
    message: 'Inventory updated successfully',
    data: product
  });
});

// @desc    Toggle product featured status
// @route   PUT /api/products/:id/featured
// @access  Private (Admin)
export const toggleFeatured = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.isFeatured = !product.isFeatured;
  await product.save();

  res.status(200).json({
    success: true,
    message: `Product ${product.isFeatured ? 'added to' : 'removed from'} featured products`,
    data: product
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await Product.find({
    isFeatured: true,
    status: 'active'
  })
  .limit(parseInt(limit))
  .sort({ createdAt: -1 })
  .populate('vendor', 'name');

  res.status(200).json({
    success: true,
    data: products
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 12 } = req.query;

  const products = await Product.find({
    category,
    status: 'active'
  })
  .populate('vendor', 'name')
  .sort({ 'rating.average': -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);

  const total = await Product.countDocuments({ category, status: 'active' });

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Search products
// @route   GET /api/products/search/:query
// @access  Public
export const searchProducts = asyncHandler(async (req, res) => {
  const { query } = req.params;
  const { limit = 20 } = req.query;

  const products = await Product.find({
    $text: { $search: query },
    status: 'active'
  })
  .limit(parseInt(limit))
  .sort({ score: { $meta: 'textScore' } })
  .populate('vendor', 'name');

  res.status(200).json({
    success: true,
    data: products,
    query,
    results: products.length
  });
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 4 } = req.query;

  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const relatedProducts = await Product.find({
    $or: [
      { category: product.category },
      { brand: product.brand },
      { tags: { $in: product.tags } }
    ],
    _id: { $ne: id },
    status: 'active'
  })
  .limit(parseInt(limit))
  .populate('vendor', 'name');

  res.status(200).json({
    success: true,
    data: relatedProducts
  });
});

// @desc    Get low stock products (for vendors)
// @route   GET /api/products/vendor/low-stock
// @access  Private (Vendor/Admin)
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const lowStockProducts = await Product.find({
    vendor: req.user._id,
    'inventory.quantity': { $lte: 10 },
    'inventory.trackQuantity': true,
    status: 'active'
  })
  .sort({ 'inventory.quantity': 1 })
  .populate('vendor', 'name');

  res.status(200).json({
    success: true,
    data: lowStockProducts,
    count: lowStockProducts.length
  });
});

// @desc    Bulk update products status
// @route   PUT /api/products/bulk/status
// @access  Private (Vendor/Admin)
export const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { productIds, status } = req.body;

  if (!productIds || !Array.isArray(productIds) || !status) {
    res.status(400);
    throw new Error('Please provide productIds array and status');
  }

  // Check if user owns all products (for vendors)
  if (req.user.role !== 'admin') {
    const products = await Product.find({ _id: { $in: productIds } });
    const notOwned = products.find(p => p.vendor.toString() !== req.user._id.toString());
    
    if (notOwned) {
      res.status(403);
      throw new Error('Not authorized to update some products');
    }
  }

  await Product.updateMany(
    { _id: { $in: productIds } },
    { $set: { status } }
  );

  res.status(200).json({
    success: true,
    message: `Updated status for ${productIds.length} products`
  });
});