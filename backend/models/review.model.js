import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    // Product reference
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product']
    },
    
    // User reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must have a user']
    },
    
    userName: {
      type: String,
      required: true
    },
    
    // Rating (1-5 stars)
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    
    // Review title
    title: {
      type: String,
      required: [true, 'Please add a review title'],
      trim: true,
      maxLength: [100, 'Title cannot be more than 100 characters']
    },
    
    // Review comment
    comment: {
      type: String,
      required: [true, 'Please add a review comment'],
      maxLength: [1000, 'Comment cannot be more than 1000 characters']
    },
    
    // Review images
    images: [{
      url: String,
      alt: String
    }],
    
    // Verified purchase
    verifiedPurchase: {
      type: Boolean,
      default: false
    },
    
    // Helpful votes
    helpful: {
      count: {
        type: Number,
        default: 0
      },
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    
    // Review status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved'
    },
    
    // Vendor response
    response: {
      comment: String,
      respondedAt: Date,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  },
  {
    timestamps: true
  }
);

// ======================
// INDEXES
// ======================
reviewSchema.index({ product: 1, user: 1 }, { unique: true }); // One review per user per product
reviewSchema.index({ product: 1, rating: -1 });
reviewSchema.index({ createdAt: -1 });

// ======================
// INSTANCE METHODS
// ======================

// Mark review as helpful
reviewSchema.methods.markHelpful = async function(userId) {
  // Check if user already marked as helpful
  if (this.helpful.users.includes(userId)) {
    // Remove the helpful mark
    this.helpful.users = this.helpful.users.filter(
      id => id.toString() !== userId.toString()
    );
    this.helpful.count = Math.max(0, this.helpful.count - 1);
  } else {
    // Add helpful mark
    this.helpful.users.push(userId);
    this.helpful.count += 1;
  }
  
  return await this.save();
};

// Add vendor response
reviewSchema.methods.addResponse = async function(comment, userId) {
  this.response = {
    comment,
    respondedAt: new Date(),
    respondedBy: userId
  };
  
  return await this.save();
};

// ======================
// STATIC METHODS
// ======================

// Get reviews for a product
reviewSchema.statics.getProductReviews = function(productId, page = 1, limit = 10, sortBy = 'createdAt') {
  const skip = (page - 1) * limit;
  
  return this.find({ product: productId, status: 'approved' })
    .populate('user', 'name avatar')
    .sort({ [sortBy]: -1 })
    .limit(limit)
    .skip(skip);
};

// Get user's reviews
reviewSchema.statics.getUserReviews = function(userId) {
  return this.find({ user: userId })
    .populate('product', 'name images price')
    .sort({ createdAt: -1 });
};

// Calculate average rating for a product
reviewSchema.statics.calculateAverageRating = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product: mongoose.Types.ObjectId(productId), status: 'approved' } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    return {
      average: Math.round(stats[0].averageRating * 10) / 10,
      count: stats[0].ratingCount
    };
  }
  
  return { average: 0, count: 0 };
};

// ======================
// MIDDLEWARE
// ======================

// After saving a review, update the product's rating
reviewSchema.post('save', async function() {
  const Product = mongoose.model('Product');
  const product = await Product.findById(this.product);
  
  if (product) {
    await product.updateRating();
  }
});

// After deleting a review, update the product's rating
reviewSchema.post('remove', async function() {
  const Product = mongoose.model('Product');
  const product = await Product.findById(this.product);
  
  if (product) {
    await product.updateRating();
  }
});

// ======================
// JSON SERIALIZATION
// ======================

reviewSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Don't expose helpful users list in public API
    if (ret.helpful && ret.helpful.users) {
      delete ret.helpful.users;
    }
    return ret;
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
