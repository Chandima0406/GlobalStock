import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.util.js';
import generateToken from '../utils/generateToken.util.js';
import User from '../models/user.model.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, vendorRequest } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Prepare user data
  const userData = {
    name,
    email,
    password,
    phone: phone || ''
  };

  // Handle vendor request
  if (vendorRequest) {
    userData.vendorRequest = {
      status: 'pending',
      requestedAt: new Date()
    };
  }

  // Create user
  const user = await User.create(userData);

  if (user) {
    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: vendorRequest 
        ? 'Registration successful! Your vendor request is pending approval 🎉' 
        : 'User registered successfully 🎉',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        vendorRequestStatus: user.vendorRequest?.status || 'none',
        token: token
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    res.status(400);
    throw new Error('Please add email and password');
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    // Update last login
    await user.updateLastLogin();

    // Check if this is the first user in the system
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 1;

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful! 👋',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        vendorRequestStatus: user.vendorRequest?.status || 'none',
        isFirstUser: isFirstUser,
        token: token
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  // req.user is set by the auth middleware
  const user = await User.findById(req.user._id)
    .populate('wishlist.product', 'name price images')
    .populate('cart.product', 'name price images inventory');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, email, phone, avatar, address, country, preferredCurrency, newsletter, currentPassword } = req.body;

  // Validation
  if (name && name.trim().length < 2) {
    res.status(400);
    throw new Error('Name must be at least 2 characters long');
  }

  if (name && name.trim().length > 50) {
    res.status(400);
    throw new Error('Name cannot exceed 50 characters');
  }

  // Check if email is being changed
  if (email && email !== user.email) {
    // Verify current password for email change
    if (!currentPassword) {
      res.status(401);
      throw new Error('Current password is required to change email');
    }

    const isPasswordValid = await user.matchPassword(currentPassword);
    if (!isPasswordValid) {
      res.status(401);
      throw new Error('Current password is incorrect');
    }

    // Check if new email already exists
    const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (emailExists && emailExists._id.toString() !== user._id.toString()) {
      res.status(409);
      throw new Error('Email already exists');
    }

    user.email = email.toLowerCase().trim();
  }

  // Update basic fields
  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (avatar !== undefined) user.avatar = avatar;

  // Handle address updates
  if (address || country) {
    if (user.addresses && user.addresses.length > 0) {
      // Update existing default address
      let defaultAddress = user.addresses.find(addr => addr.isDefault);
      
      if (defaultAddress) {
        if (address !== undefined) defaultAddress.street = address;
        if (country !== undefined) defaultAddress.country = country;
        // Mark the addresses array as modified for Mongoose to save changes
        user.markModified('addresses');
      }
    } else if (address && country) {
      // Only create new address if both address and country are provided
      // This prevents incomplete address validation errors
      user.addresses.push({
        street: address,
        city: 'N/A', // Placeholder
        state: 'N/A', // Placeholder
        country: country,
        zipCode: '00000', // Placeholder
        isDefault: true
      });
    }
  }

  // Update preferences if provided
  if (preferredCurrency !== undefined) {
    user.preferences.currency = preferredCurrency;
    user.markModified('preferences');
  }
  if (newsletter !== undefined) {
    user.preferences.newsletter = newsletter;
    user.markModified('preferences');
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully ✅',
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      addresses: updatedUser.addresses,
      preferences: updatedUser.preferences
    }
  });
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  // In JWT, logout is handled client-side by removing the token
  // You could add server-side cleanup here if needed:
  // - Blacklist the token
  // - Clear refresh tokens
  // - Log the logout event
  
  try {
    // Optional: Log logout event for audit trail
    const user = await User.findById(req.user._id);
    if (user) {
      // You can add lastLogout timestamp or logout history if needed
      // user.lastLogout = new Date();
      // await user.save();
      console.log(`User ${user.email} logged out at ${new Date().toISOString()}`);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully! See you soon 👋'
    });
  } catch (error) {
    // Even if server-side cleanup fails, return success
    // since logout is primarily client-side for JWT
    res.status(200).json({
      success: true,
      message: 'Logged out successfully! See you soon 👋'
    });
  }
});

// @desc    Forgot password - Generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found with this email');
  }

  // Generate reset token (simplified - in production, send email)
  const resetToken = generateToken(user._id);
  
  // In production: Save reset token to user and send email
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save();

  res.json({
    success: true,
    message: 'Password reset instructions sent to your email',
    resetToken: resetToken // In production, don't send token in response
  });
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  // Verify token and find user
  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.resetPasswordToken !== resetToken) {
      res.status(400);
      throw new Error('Invalid or expired reset token');
    }

    // Check if token expired
    if (Date.now() > user.resetPasswordExpire) {
      res.status(400);
      throw new Error('Reset token has expired');
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful ✅'
    });
  } catch (error) {
    res.status(400);
    throw new Error('Invalid reset token');
  }
});