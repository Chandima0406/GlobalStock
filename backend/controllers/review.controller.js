import asyncHandler from '../utils/asyncHandler.util.js';
import Review from '../models/review.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { product, rating, title, comment, images } = req.body;

  // Validation
  if (!product || !rating) {
    res.status(400);
    throw new Error('Product and rating are required');
  }

  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  // Check if product exists
  const productExists = await Product.findById(product);
  if (!productExists) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user has purchased the product
  const hasPurchased = await Order.findOne({
    customer: req.user._id,
    'orderItems.product': product,
    orderStatus: 'delivered'
  });

  if (!hasPurchased && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You can only review products you have purchased');
  }

  // Check if user has already reviewed this product
  const existingReview = await Review.findOne({
    product,
    user: req.user._id
  });

  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  // Create review
  const review = await Review.create({
    product,
    user: req.user._id,
    rating,
    title: title || '',
    comment: comment || '',
    images: images || [],
    isVerified: true // Mark as verified since user purchased the product
  });

  // Update product rating
  await productExists.updateRating();

  // Populate review for response
  const populatedReview = await Review.findById(review._id)
    .populate('user', 'name avatar')
    .populate('product', 'name images');

  res.status(201).json({
    success: true,
    message: 'Review created successfully ⭐',
    data: populatedReview
  });
});

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { 
    page = 1, 
    limit = 10, 
    rating, 
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Build filter
  const filter = { product: productId, status: 'approved' };

  if (rating) {
    filter.rating = parseInt(rating);
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const reviews = await Review.find(filter)
    .populate('user', 'name avatar')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Review.countDocuments(filter);

  // Get rating distribution
  const ratingDistribution = await Review.aggregate([
    { $match: { product: product._id, status: 'approved' } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  // Calculate average rating
  const ratingStats = await Review.aggregate([
    { $match: { product: product._id, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const stats = ratingStats[0] || {
    averageRating: 0,
    totalReviews: 0
  };

  res.status(200).json({
    success: true,
    data: reviews,
    stats: {
      averageRating: Math.round(stats.averageRating * 10) / 10 || 0,
      totalReviews: stats.totalReviews || 0,
      ratingDistribution: ratingDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
    },
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getMyReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const reviews = await Review.find({ user: req.user._id })
    .populate('product', 'name images brand price')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Review.countDocuments({ user: req.user._id });

  res.status(200).json({
    success: true,
    data: reviews,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
export const getReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate('user', 'name avatar')
    .populate('product', 'name images brand');

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res) => {
  const { rating, title, comment, images } = req.body;

  let review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this review');
  }

  // Validate rating if provided
  if (rating && (rating < 1 || rating > 5)) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  // Update review
  review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        rating: rating || review.rating,
        title: title !== undefined ? title : review.title,
        comment: comment !== undefined ? comment : review.comment,
        images: images || review.images,
        isEdited: true,
        editedAt: new Date()
      }
    },
    {
      new: true,
      runValidators: true
    }
  )
  .populate('user', 'name avatar')
  .populate('product', 'name images');

  // Update product rating if rating changed
  if (rating && rating !== review.rating) {
    const product = await Product.findById(review.product);
    await product.updateRating();
  }

  res.status(200).json({
    success: true,
    message: 'Review updated successfully ✅',
    data: review
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  const productId = review.product;

  await Review.findByIdAndDelete(req.params.id);

  // Update product rating
  const product = await Product.findById(productId);
  if (product) {
    await product.updateRating();
  }

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Like a review
// @route   POST /api/reviews/:id/like
// @access  Private
export const likeReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user already liked the review
  const alreadyLiked = review.likes.some(
    like => like.user.toString() === req.user._id.toString()
  );

  if (alreadyLiked) {
    // Unlike the review
    review.likes = review.likes.filter(
      like => like.user.toString() !== req.user._id.toString()
    );
  } else {
    // Like the review
    review.likes.push({
      user: req.user._id,
      likedAt: new Date()
    });

    // Remove from dislikes if exists
    review.dislikes = review.dislikes.filter(
      dislike => dislike.user.toString() !== req.user._id.toString()
    );
  }

  await review.save();

  const updatedReview = await Review.findById(review._id)
    .populate('user', 'name avatar')
    .populate('likes.user', 'name')
    .populate('dislikes.user', 'name');

  res.status(200).json({
    success: true,
    message: alreadyLiked ? 'Review unliked' : 'Review liked 👍',
    data: updatedReview
  });
});

// @desc    Dislike a review
// @route   POST /api/reviews/:id/dislike
// @access  Private
export const dislikeReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user already disliked the review
  const alreadyDisliked = review.dislikes.some(
    dislike => dislike.user.toString() === req.user._id.toString()
  );

  if (alreadyDisliked) {
    // Remove dislike
    review.dislikes = review.dislikes.filter(
      dislike => dislike.user.toString() !== req.user._id.toString()
    );
  } else {
    // Dislike the review
    review.dislikes.push({
      user: req.user._id,
      dislikedAt: new Date()
    });

    // Remove from likes if exists
    review.likes = review.likes.filter(
      like => like.user.toString() !== req.user._id.toString()
    );
  }

  await review.save();

  const updatedReview = await Review.findById(review._id)
    .populate('user', 'name avatar')
    .populate('likes.user', 'name')
    .populate('dislikes.user', 'name');

  res.status(200).json({
    success: true,
    message: alreadyDisliked ? 'Review undisliked' : 'Review disliked 👎',
    data: updatedReview
  });
});

// @desc    Report a review
// @route   POST /api/reviews/:id/report
// @access  Private
export const reportReview = asyncHandler(async (req, res) => {
  const { reason, description } = req.body;

  if (!reason) {
    res.status(400);
    throw new Error('Report reason is required');
  }

  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user already reported this review
  const alreadyReported = review.reports.some(
    report => report.user.toString() === req.user._id.toString()
  );

  if (alreadyReported) {
    res.status(400);
    throw new Error('You have already reported this review');
  }

  // Add report
  review.reports.push({
    user: req.user._id,
    reason,
    description: description || '',
    reportedAt: new Date()
  });

  // Auto-flag if reports exceed threshold
  if (review.reports.length >= 5) {
    review.status = 'flagged';
  }

  await review.save();

  res.status(200).json({
    success: true,
    message: 'Review reported successfully. Our team will review it.'
  });
});

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private (Admin)
export const getAllReviews = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    rating,
    product,
    user,
    hasImages,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter
  const filter = {};

  if (status) filter.status = status;
  if (rating) filter.rating = parseInt(rating);
  if (product) filter.product = product;
  if (user) filter.user = user;
  if (hasImages === 'true') {
    filter.images = { $exists: true, $ne: [] };
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const reviews = await Review.find(filter)
    .populate('user', 'name email avatar')
    .populate('product', 'name images brand')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Review.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: reviews,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Update review status (Admin)
// @route   PUT /api/reviews/:id/status
// @access  Private (Admin)
export const updateReviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !['pending', 'approved', 'rejected', 'flagged'].includes(status)) {
    res.status(400);
    throw new Error('Valid status is required (pending, approved, rejected, flagged)');
  }

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $set: { status } },
    { new: true, runValidators: true }
  )
  .populate('user', 'name email')
  .populate('product', 'name');

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Update product rating if status changed to/from approved
  const product = await Product.findById(review.product);
  await product.updateRating();

  res.status(200).json({
    success: true,
    message: `Review status updated to ${status} ✅`,
    data: review
  });
});

// @desc    Bulk update review status (Admin)
// @route   PUT /api/reviews/bulk/status
// @access  Private (Admin)
export const bulkUpdateReviewStatus = asyncHandler(async (req, res) => {
  const { reviewIds, status } = req.body;

  if (!reviewIds || !Array.isArray(reviewIds) || !status) {
    res.status(400);
    throw new Error('Please provide reviewIds array and status');
  }

  await Review.updateMany(
    { _id: { $in: reviewIds } },
    { $set: { status } }
  );

  // Update product ratings for all affected products
  const reviews = await Review.find({ _id: { $in: reviewIds } });
  const productIds = [...new Set(reviews.map(review => review.product.toString()))];

  for (const productId of productIds) {
    const product = await Product.findById(productId);
    if (product) {
      await product.updateRating();
    }
  }

  res.status(200).json({
    success: true,
    message: `Updated status for ${reviewIds.length} reviews`
  });
});

// @desc    Get review statistics (Admin)
// @route   GET /api/reviews/stats/overview
// @access  Private (Admin)
export const getReviewStats = asyncHandler(async (req, res) => {
  const stats = await Review.aggregate([
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        pendingReviews: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        approvedReviews: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        flaggedReviews: {
          $sum: { $cond: [{ $eq: ['$status', 'flagged'] }, 1, 0] }
        },
        reviewsWithImages: {
          $sum: { $cond: [{ $gt: [{ $size: '$images' }, 0] }, 1, 0] }
        },
        verifiedReviews: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalReviews: 1,
        averageRating: { $round: ['$averageRating', 2] },
        pendingReviews: 1,
        approvedReviews: 1,
        flaggedReviews: 1,
        reviewsWithImages: 1,
        verifiedReviews: 1
      }
    }
  ]);

  // Get recent reviews
  const recentReviews = await Review.find()
    .populate('user', 'name')
    .populate('product', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  const result = stats[0] || {
    totalReviews: 0,
    averageRating: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    flaggedReviews: 0,
    reviewsWithImages: 0,
    verifiedReviews: 0
  };

  result.recentReviews = recentReviews;

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get featured reviews (top helpful reviews)
// @route   GET /api/reviews/featured
// @access  Public
export const getFeaturedReviews = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;

  const reviews = await Review.find({ status: 'approved' })
    .populate('user', 'name avatar')
    .populate('product', 'name images brand')
    .sort({ 
      'likes': -1,
      'rating': -1,
      'createdAt': -1 
    })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: reviews
  });
});