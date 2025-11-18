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
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.avatar = req.body.avatar || user.avatar;

    if (req.body.password) {
      user.password = req.body.password;
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
        avatar: updatedUser.avatar
      }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  // In JWT, logout is handled client-side by removing the token
  // But we can add any server-side cleanup here if needed
  
  res.status(200).json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.'
  });
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