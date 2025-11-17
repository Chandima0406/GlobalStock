import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxLength: [50, 'Name cannot be more than 50 characters']
    },
    
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false 
    },
    
    
    role: {
      type: String,
      enum: ['customer', 'admin', 'vendor'],
      default: 'customer'
    },
    
    vendorRequest: {
      status: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none'
      },
      requestedAt: Date,
      approvedAt: Date,
      rejectedAt: Date,
      rejectionReason: String
    },
    
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    
    isActive: {
      type: Boolean,
      default: true
    },
    
    
    avatar: {
      type: String,
      default: ''
    },
    
    phone: {
      type: String,
      maxLength: [20, 'Phone number cannot be longer than 20 characters']
    },
    
    dateOfBirth: {
      type: Date
    },
    
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      default: 'prefer-not-to-say'
    },
    
    
    addresses: [{
      type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home'
      },
      street: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true,
        default: 'Sri Lanka'
      },
      zipCode: {
        type: String,
        required: true
      },
      isDefault: {
        type: Boolean,
        default: false
      }
    }],
    
    
    wishlist: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    cart: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    
    orderHistory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }],
    
    
    paymentMethods: [{
      type: {
        type: String,
        enum: ['card', 'paypal', 'bank_transfer']
      },
      lastFour: String,
      isDefault: {
        type: Boolean,
        default: false
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    
    preferences: {
      newsletter: {
        type: Boolean,
        default: true
      },
      marketingEmails: {
        type: Boolean,
        default: false
      },
      smsNotifications: {
        type: Boolean,
        default: false
      },
      currency: {
        type: String,
        default: 'LKR'
      },
      language: {
        type: String,
        default: 'en'
      }
    },
    
    
    stats: {
      totalOrders: {
        type: Number,
        default: 0
      },
      totalSpent: {
        type: Number,
        default: 0
      },
      lastLogin: {
        type: Date
      },
      loginCount: {
        type: Number,
        default: 0
      }
    },
    
    
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    
    
    socialProfiles: {
      googleId: String,
      facebookId: String
    }
  },
  {
    timestamps: true 
  }
);


// Indexes (email index is automatically created by unique: true)
userSchema.index({ 'socialProfiles.googleId': 1 });
userSchema.index({ 'socialProfiles.facebookId': 1 });
userSchema.index({ createdAt: -1 }); 


userSchema.pre('save', async function(next) {
  
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


userSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});


userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


userSchema.methods.updateLastLogin = async function() {
  this.stats.lastLogin = new Date();
  this.stats.loginCount += 1;
  return await this.save();
};


userSchema.methods.addToWishlist = async function(productId) {
  const existingItem = this.wishlist.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (!existingItem) {
    this.wishlist.push({ product: productId });
    return await this.save();
  }
  return this;
};


userSchema.methods.removeFromWishlist = async function(productId) {
  this.wishlist = this.wishlist.filter(item => 
    item.product.toString() !== productId.toString()
  );
  return await this.save();
};


userSchema.methods.addToCart = async function(productId, quantity = 1) {
  const existingItem = this.cart.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.cart.push({ product: productId, quantity });
  }
  
  return await this.save();
};


userSchema.methods.updateCartQuantity = async function(productId, quantity) {
  const cartItem = this.cart.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (cartItem) {
    if (quantity <= 0) {
      return await this.removeFromCart(productId);
    }
    cartItem.quantity = quantity;
    return await this.save();
  }
  return this;
};


userSchema.methods.removeFromCart = async function(productId) {
  this.cart = this.cart.filter(item => 
    item.product.toString() !== productId.toString()
  );
  return await this.save();
};


userSchema.methods.clearCart = async function() {
  this.cart = [];
  return await this.save();
};


userSchema.methods.addAddress = async function(addressData) {
  
  if (addressData.isDefault) {
    this.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }
  
  this.addresses.push(addressData);
  return await this.save();
};


userSchema.methods.setDefaultAddress = async function(addressId) {
  this.addresses.forEach(addr => {
    addr.isDefault = addr._id.toString() === addressId.toString();
  });
  
  return await this.save();
};


userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: new RegExp(`^${email}$`, 'i') });
};


userSchema.statics.findByRole = function(role) {
  return this.find({ role });
};


userSchema.statics.getTopCustomers = function(limit = 10) {
  return this.find({ 'stats.totalSpent': { $gt: 0 } })
    .sort({ 'stats.totalSpent': -1 })
    .limit(limit)
    .select('name email stats.totalSpent stats.totalOrders');
};


userSchema.virtual('defaultAddress').get(function() {
  const defaultAddr = this.addresses.find(addr => addr.isDefault);
  if (defaultAddr) {
    return `${defaultAddr.street}, ${defaultAddr.city}, ${defaultAddr.state}, ${defaultAddr.zipCode}, ${defaultAddr.country}`;
  }
  return null;
});


userSchema.virtual('hasCartItems').get(function() {
  return this.cart.length > 0;
});


userSchema.virtual('cartItemsCount').get(function() {
  return this.cart.reduce((total, item) => total + item.quantity, 0);
});


userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpire;
    delete ret.emailVerificationToken;
    delete ret.emailVerificationExpire;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

export default User;