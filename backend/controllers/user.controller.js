import asyncHandler from '../utils/asyncHandler.util.js';
import User from '../models/user.model.js';
import Order from '../models/order.model.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist.product', 'name price images brand')
    .populate('cart.product', 'name price images inventory')
    .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const {
    name,
    email,
    phone,
    avatar,
    gender,
    dateOfBirth,
    preferences
  } = req.body;

  // Check if email is being changed and if it already exists
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already exists');
    }
  }

  // Update user fields
  user.name = name || user.name;
  user.email = email || user.email;
  user.phone = phone !== undefined ? phone : user.phone;
  user.avatar = avatar || user.avatar;
  user.gender = gender || user.gender;
  user.dateOfBirth = dateOfBirth || user.dateOfBirth;

  // Update preferences if provided
  if (preferences) {
    user.preferences = {
      ...user.preferences,
      ...preferences
    };
  }

  const updatedUser = await user.save();

  // Return user without sensitive information
  const userResponse = {
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    avatar: updatedUser.avatar,
    role: updatedUser.role,
    gender: updatedUser.gender,
    dateOfBirth: updatedUser.dateOfBirth,
    addresses: updatedUser.addresses,
    preferences: updatedUser.preferences,
    stats: updatedUser.stats,
    isActive: updatedUser.isActive,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt
  };

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully ✅',
    data: userResponse
  });
});

// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current password and new password');
  }

  // Check current password
  const isCurrentPasswordCorrect = await user.matchPassword(currentPassword);
  if (!isCurrentPasswordCorrect) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully ✅'
  });
});

// @desc    Add address to user profile
// @route   POST /api/users/addresses
// @access  Private
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const {
    type,
    street,
    city,
    state,
    country,
    zipCode,
    phone,
    isDefault
  } = req.body;

  // Validation
  if (!street || !city || !state || !country || !zipCode) {
    res.status(400);
    throw new Error('Please fill in all required address fields');
  }

  const addressData = {
    type: type || 'home',
    street,
    city,
    state,
    country,
    zipCode,
    phone: phone || user.phone,
    isDefault: isDefault || false
  };

  await user.addAddress(addressData);

  const updatedUser = await User.findById(req.user._id).select('addresses');

  res.status(201).json({
    success: true,
    message: 'Address added successfully 🎉',
    data: updatedUser.addresses
  });
});

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { addressId } = req.params;

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  // Update address fields
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      address[key] = req.body[key];
    }
  });

  // If setting as default, update other addresses
  if (req.body.isDefault) {
    user.addresses.forEach(addr => {
      if (addr._id.toString() !== addressId) {
        addr.isDefault = false;
      }
    });
  }

  await user.save();

  const updatedUser = await User.findById(req.user._id).select('addresses');

  res.status(200).json({
    success: true,
    message: 'Address updated successfully ✅',
    data: updatedUser.addresses
  });
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { addressId } = req.params;

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  // Cannot delete the only address
  if (user.addresses.length === 1) {
    res.status(400);
    throw new Error('Cannot delete your only address');
  }

  address.deleteOne();
  await user.save();

  const updatedUser = await User.findById(req.user._id).select('addresses');

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully',
    data: updatedUser.addresses
  });
});

// @desc    Set default address
// @route   PUT /api/users/addresses/:addressId/default
// @access  Private
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { addressId } = req.params;

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.setDefaultAddress(addressId);

  const updatedUser = await User.findById(req.user._id).select('addresses');

  res.status(200).json({
    success: true,
    message: 'Default address updated successfully ✅',
    data: updatedUser.addresses
  });
});

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.addToWishlist(productId);

  const updatedUser = await User.findById(req.user._id)
    .populate('wishlist.product', 'name price images brand')
    .select('wishlist');

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist ❤️',
    data: updatedUser.wishlist
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.removeFromWishlist(productId);

  const updatedUser = await User.findById(req.user._id)
    .populate('wishlist.product', 'name price images brand')
    .select('wishlist');

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist',
    data: updatedUser.wishlist
  });
});

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist.product', 'name price images brand category inventory rating')
    .select('wishlist');

  res.status(200).json({
    success: true,
    data: user.wishlist
  });
});

// @desc    Get user orders
// @route   GET /api/users/orders
// @access  Private
export const getUserOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const orders = await Order.findByCustomer(req.user._id, parseInt(limit))
    .populate('orderItems.product', 'name images brand')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments({ customer: req.user._id });

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

// @desc    Get user order statistics
// @route   GET /api/users/orders/stats
// @access  Private
export const getUserOrderStats = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id });

  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((total, order) => total + order.totalPrice, 0),
    pendingOrders: orders.filter(order => order.orderStatus === 'pending').length,
    deliveredOrders: orders.filter(order => order.orderStatus === 'delivered').length,
    cancelledOrders: orders.filter(order => order.orderStatus === 'cancelled').length,
    averageOrderValue: orders.length > 0 ? 
      orders.reduce((total, order) => total + order.totalPrice, 0) / orders.length : 0
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search, isActive } = req.query;

  // Build filter
  const filter = {};

  if (role) {
    filter.role = role;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter)
    .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private (Admin)
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire')
    .populate('wishlist.product', 'name price images')
    .populate('cart.product', 'name price images');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get user's orders
  const userOrders = await Order.find({ customer: user._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('orderItems.product', 'name price');

  const userData = {
    ...user.toObject(),
    recentOrders: userOrders
  };

  res.status(200).json({
    success: true,
    data: userData
  });
});

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role || !['customer', 'vendor', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Valid role is required (customer, vendor, admin)');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { role } },
    { new: true, runValidators: true }
  ).select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    message: `User role updated to ${role} ✅`,
    data: user
  });
});

// @desc    Toggle user active status (Admin only)
// @route   PUT /api/users/:id/active
// @access  Private (Admin)
export const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isActive = !user.isActive;
  await user.save();

  const status = user.isActive ? 'activated' : 'deactivated';

  res.status(200).json({
    success: true,
    message: `User ${status} successfully`,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    }
  });
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user has orders
  const orderCount = await Order.countDocuments({ customer: user._id });
  if (orderCount > 0) {
    res.status(400);
    throw new Error('Cannot delete user with existing orders');
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Get user dashboard statistics
// @route   GET /api/users/dashboard/stats
// @access  Private
export const getUserDashboardStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  // Get user orders
  const orders = await Order.find({ customer: req.user._id });
  
  // Get wishlist count
  const wishlistCount = user.wishlist.length;
  
  // Get cart items count
  const cartItemsCount = user.cart.reduce((total, item) => total + item.quantity, 0);

  const stats = {
    user: {
      name: user.name,
      email: user.email,
      memberSince: user.createdAt
    },
    orders: {
      total: orders.length,
      pending: orders.filter(order => order.orderStatus === 'pending').length,
      delivered: orders.filter(order => order.orderStatus === 'delivered').length
    },
    wishlist: {
      count: wishlistCount
    },
    cart: {
      itemsCount: cartItemsCount
    },
    spending: {
      total: orders.reduce((total, order) => total + order.totalPrice, 0),
      average: orders.length > 0 ? 
        orders.reduce((total, order) => total + order.totalPrice, 0) / orders.length : 0
    }
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});