import asyncHandler from '../utils/asyncHandler.util.js';
import mongoose from 'mongoose';

// Newsletter Subscriber Model (inline for simplicity)
const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    default: 'website'
  }
});

const Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', newsletterSchema);

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validation
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please enter a valid email address');
  }

  // Check if already subscribed
  const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });
  
  if (existingSubscriber) {
    if (existingSubscriber.isActive) {
      res.status(400);
      throw new Error('This email is already subscribed to our newsletter');
    } else {
      // Reactivate subscription
      existingSubscriber.isActive = true;
      existingSubscriber.subscribedAt = Date.now();
      await existingSubscriber.save();

      res.status(200).json({
        success: true,
        message: 'Welcome back! Your subscription has been reactivated.'
      });
      return;
    }
  }

  // Create new subscriber
  const subscriber = await Newsletter.create({
    email: email.toLowerCase(),
    source: 'website'
  });

  res.status(201).json({
    success: true,
    message: 'Thank you for subscribing! Check your email for confirmation.',
    data: {
      email: subscriber.email,
      subscribedAt: subscriber.subscribedAt
    }
  });
});

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
export const unsubscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

  if (!subscriber) {
    res.status(404);
    throw new Error('Email not found in our subscriber list');
  }

  subscriber.isActive = false;
  await subscriber.save();

  res.status(200).json({
    success: true,
    message: 'You have been unsubscribed from our newsletter'
  });
});

// @desc    Get all newsletter subscribers (Admin only)
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
export const getNewsletterSubscribers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, active } = req.query;

  const query = {};
  if (active !== undefined) {
    query.isActive = active === 'true';
  }

  const subscribers = await Newsletter.find(query)
    .sort({ subscribedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-__v');

  const count = await Newsletter.countDocuments(query);

  res.status(200).json({
    success: true,
    data: subscribers,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalSubscribers: count,
      limit: parseInt(limit)
    }
  });
});

export default {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getNewsletterSubscribers
};
