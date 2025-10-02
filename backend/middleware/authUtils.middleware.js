/**
 * Additional Authentication Utilities and Middleware
 */
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.util.js';

/**
 * Check if user is admin
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

/**
 * Check if user is vendor or admin
 */
export const vendorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'vendor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Vendor or Admin privileges required.'
    });
  }
};

/**
 * Optional auth middleware - doesn't block if no token provided
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token invalid but continue without user
      req.user = null;
    }
  }
  
  next();
});

/**
 * Rate limiting helper
 */
export const createRateLimit = (windowMs, max, message) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const requestTimes = requests.get(key);
    const requestsInWindow = requestTimes.filter(time => time > windowStart);
    
    if (requestsInWindow.length >= max) {
      return res.status(429).json({
        success: false,
        message: message || 'Too many requests, please try again later.'
      });
    }
    
    requestsInWindow.push(now);
    requests.set(key, requestsInWindow);
    
    next();
  };
};