import asyncHandler from '../utils/asyncHandler.util.js';
import Category from '../models/category.model.js';
import Product from '../models/product.model.js';

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
export const createCategory = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    parent,
    image,
    icon,
    color,
    displayOrder,
    isFeatured,
    showInNavigation,
    showInFooter,
    seo,
    content,
    attributes
  } = req.body;

  // Validation
  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }

  // Check if category already exists
  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  // Validate parent category if provided
  if (parent) {
    const parentCategory = await Category.findById(parent);
    if (!parentCategory) {
      res.status(404);
      throw new Error('Parent category not found');
    }
  }

  // Create category
  const category = new Category({
    name,
    description: description || '',
    parent: parent || null,
    image: image || {},
    icon: icon || '',
    color: color || '#6B7280',
    displayOrder: displayOrder || 0,
    isFeatured: isFeatured || false,
    showInNavigation: showInNavigation !== false,
    showInFooter: showInFooter || false,
    seo: seo || {},
    content: content || '',
    attributes: attributes || [],
    createdBy: req.user._id,
    status: 'active'
  });

  // Generate slug and update hierarchy
  await category.generateSlug();
  await category.updateHierarchy();

  const createdCategory = await category.save();

  res.status(201).json({
    success: true,
    message: 'Category created successfully 🎉',
    data: createdCategory
  });
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    featured,
    navigation,
    parent,
    level,
    search,
    status = 'active'
  } = req.query;

  // Build filter
  const filter = { status };

  if (featured === 'true') {
    filter.isFeatured = true;
  }

  if (navigation === 'true') {
    filter.showInNavigation = true;
  }

  if (parent) {
    if (parent === 'null') {
      filter.parent = null;
    } else {
      filter.parent = parent;
    }
  }

  if (level) {
    filter.level = parseInt(level);
  }

  // Search filter
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const categories = await Category.find(filter)
    .populate('parent', 'name slug')
    .populate('subcategories', 'name slug image displayOrder productCount')
    .sort({ displayOrder: 1, name: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Category.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: categories,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('parent', 'name slug image')
    .populate('subcategories', 'name slug image displayOrder')
    .populate('ancestors', 'name slug');

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Increment view count
  await category.addView();

  // Get products count for this category
  const productCount = await Product.countDocuments({ 
    category: category.name,
    status: 'active'
  });

  const categoryWithCount = {
    ...category.toObject(),
    productCount
  };

  res.status(200).json({
    success: true,
    data: categoryWithCount
  });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug })
    .populate('parent', 'name slug image')
    .populate('subcategories', 'name slug image displayOrder')
    .populate('ancestors', 'name slug');

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Increment view count
  await category.addView();

  // Get products for this category
  const products = await Product.find({ 
    category: category.name,
    status: 'active'
  })
  .populate('vendor', 'name')
  .sort({ 'rating.average': -1, createdAt: -1 })
  .limit(20);

  const categoryWithProducts = {
    ...category.toObject(),
    products,
    productCount: products.length
  };

  res.status(200).json({
    success: true,
    data: categoryWithProducts
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    parent,
    image,
    icon,
    color,
    displayOrder,
    isFeatured,
    showInNavigation,
    showInFooter,
    seo,
    content,
    attributes,
    status
  } = req.body;

  let category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if name is being changed and if it already exists
  if (name && name !== category.name) {
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      res.status(400);
      throw new Error('Category name already exists');
    }
  }

  // Validate parent category if provided
  if (parent && parent !== category.parent?.toString()) {
    const parentCategory = await Category.findById(parent);
    if (!parentCategory) {
      res.status(404);
      throw new Error('Parent category not found');
    }

    // Check for circular reference
    if (parent === req.params.id) {
      res.status(400);
      throw new Error('Category cannot be its own parent');
    }

    // Check if parent is in ancestors
    const isValidParent = await category.isValidParent(parent);
    if (!isValidParent) {
      res.status(400);
      throw new Error('Invalid parent category (circular reference)');
    }
  }

  // Update category
  category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name: name || category.name,
        description: description !== undefined ? description : category.description,
        parent: parent !== undefined ? parent : category.parent,
        image: image || category.image,
        icon: icon !== undefined ? icon : category.icon,
        color: color || category.color,
        displayOrder: displayOrder !== undefined ? displayOrder : category.displayOrder,
        isFeatured: isFeatured !== undefined ? isFeatured : category.isFeatured,
        showInNavigation: showInNavigation !== undefined ? showInNavigation : category.showInNavigation,
        showInFooter: showInFooter !== undefined ? showInFooter : category.showInFooter,
        seo: seo || category.seo,
        content: content !== undefined ? content : category.content,
        attributes: attributes || category.attributes,
        status: status || category.status
      }
    },
    {
      new: true,
      runValidators: true
    }
  )
  .populate('parent', 'name slug')
  .populate('subcategories', 'name slug');

  // Update hierarchy if parent changed
  if (parent !== undefined && parent !== category.parent?.toString()) {
    await category.updateHierarchy();
  }

  res.status(200).json({
    success: true,
    message: 'Category updated successfully ✅',
    data: category
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if category has products
  const productCount = await Product.countDocuments({ category: category.name });
  if (productCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete category. It has ${productCount} products associated.`);
  }

  // Check if category has subcategories
  const subcategoryCount = await Category.countDocuments({ parent: category._id });
  if (subcategoryCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete category. It has ${subcategoryCount} subcategories.`);
  }

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// @desc    Get category tree (hierarchical structure)
// @route   GET /api/categories/tree
// @access  Public
export const getCategoryTree = asyncHandler(async (req, res) => {
  const tree = await Category.getCategoryTree();

  res.status(200).json({
    success: true,
    data: tree
  });
});

// @desc    Get root categories (no parent)
// @route   GET /api/categories/root
// @access  Public
export const getRootCategories = asyncHandler(async (req, res) => {
  const categories = await Category.getRootCategories();

  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Get featured categories
// @route   GET /api/categories/featured
// @access  Public
export const getFeaturedCategories = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const categories = await Category.getFeaturedCategories(parseInt(limit));

  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Get navigation categories
// @route   GET /api/categories/navigation
// @access  Public
export const getNavigationCategories = asyncHandler(async (req, res) => {
  const categories = await Category.getNavigationCategories();

  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Get categories with product counts
// @route   GET /api/categories/with-counts
// @access  Public
export const getCategoriesWithCounts = asyncHandler(async (req, res) => {
  const categories = await Category.getCategoriesWithCounts();

  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Get subcategories
// @route   GET /api/categories/:id/subcategories
// @access  Public
export const getSubcategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  const subcategories = await Category.find({
    parent: req.params.id,
    status: 'active'
  })
  .populate('parent', 'name slug')
  .sort({ displayOrder: 1, name: 1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);

  const total = await Category.countDocuments({ parent: req.params.id, status: 'active' });

  res.status(200).json({
    success: true,
    data: subcategories,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Search categories
// @route   GET /api/categories/search/:query
// @access  Public
export const searchCategories = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const { query } = req.params;

  const categories = await Category.searchCategories(query, parseInt(limit));

  res.status(200).json({
    success: true,
    data: categories,
    query,
    results: categories.length
  });
});

// @desc    Bulk update categories status
// @route   PUT /api/categories/bulk/status
// @access  Private (Admin)
export const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { categoryIds, status } = req.body;

  if (!categoryIds || !Array.isArray(categoryIds) || !status) {
    res.status(400);
    throw new Error('Please provide categoryIds array and status');
  }

  await Category.updateMany(
    { _id: { $in: categoryIds } },
    { $set: { status } }
  );

  res.status(200).json({
    success: true,
    message: `Updated status for ${categoryIds.length} categories`
  });
});

// @desc    Update category display order
// @route   PUT /api/categories/:id/order
// @access  Private (Admin)
export const updateDisplayOrder = asyncHandler(async (req, res) => {
  const { displayOrder } = req.body;

  if (displayOrder === undefined || displayOrder < 0) {
    res.status(400);
    throw new Error('Valid display order is required');
  }

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { $set: { displayOrder } },
    { new: true, runValidators: true }
  );

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.status(200).json({
    success: true,
    message: 'Display order updated successfully',
    data: category
  });
});

// @desc    Add attribute to category
// @route   POST /api/categories/:id/attributes
// @access  Private (Admin)
export const addAttribute = asyncHandler(async (req, res) => {
  const { name, type, values, isRequired, isFilterable, displayOrder } = req.body;

  if (!name || !type) {
    res.status(400);
    throw new Error('Attribute name and type are required');
  }

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const attributeData = {
    name,
    type,
    values: values || [],
    isRequired: isRequired || false,
    isFilterable: isFilterable !== false,
    displayOrder: displayOrder || 0
  };

  await category.addAttribute(attributeData);

  const updatedCategory = await Category.findById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Attribute added successfully',
    data: updatedCategory
  });
});

// @desc    Remove attribute from category
// @route   DELETE /api/categories/:id/attributes/:attributeName
// @access  Private (Admin)
export const removeAttribute = asyncHandler(async (req, res) => {
  const { attributeName } = req.params;

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  await category.removeAttribute(attributeName);

  const updatedCategory = await Category.findById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Attribute removed successfully',
    data: updatedCategory
  });
});