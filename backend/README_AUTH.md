# GlobalStock Backend - Authentication System

This document outlines the complete authentication system implementation for the GlobalStock e-commerce platform.

## 🚀 Features Implemented

### Authentication Endpoints
- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/login` - User login
- **GET** `/api/auth/me` - Get current user profile
- **PUT** `/api/auth/profile` - Update user profile
- **POST** `/api/auth/logout` - User logout
- **POST** `/api/auth/forgot-password` - Request password reset
- **PUT** `/api/auth/reset-password/:resetToken` - Reset password

### Security Features
- JWT token-based authentication
- Password hashing with bcrypt (salt rounds: 12)
- Protected routes middleware
- Role-based access control (customer, vendor, admin)
- Password reset functionality
- Input validation and sanitization

## 📁 File Structure

```
backend/
├── controllers/
│   └── auth.controller.js          # Authentication logic
├── middleware/
│   ├── auth.middleware.js          # JWT verification & role authorization
│   ├── authUtils.middleware.js     # Additional auth utilities
│   └── error.middleware.js         # Global error handling
├── models/
│   └── user.model.js              # User schema with advanced features
├── routes/
│   └── auth.routes.js             # Authentication routes
├── utils/
│   ├── asyncHandler.util.js       # Async error handling wrapper
│   └── generateToken.util.js      # JWT token generation
├── server.js                      # Main server file
└── .env.example                   # Environment variables template
```

## 🔧 Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/globalstock
JWT_SECRET=your_very_long_and_secure_secret_key
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
```

### 2. Install Dependencies
All required dependencies are already in `package.json`:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv

### 3. Start the Server
```bash
npm run dev
```

## 📝 API Documentation

### Registration
**POST** `/api/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully 🎉",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "phone": "+1234567890",
    "token": "jwt_token_here"
  }
}
```

### Login
**POST** `/api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Protected Routes
Add Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🛡️ Security Features

### Password Security
- Minimum 6 characters required
- Hashed using bcryptjs with salt rounds of 12
- Never returned in API responses

### JWT Tokens
- 30-day expiration by default
- Includes user ID in payload
- Verified on protected routes

### Role-Based Access
- **customer**: Default user role
- **vendor**: Can manage products
- **admin**: Full system access

### Middleware Available
- `protect`: Verify JWT token
- `authorize(roles)`: Check user roles
- `adminOnly`: Admin access only
- `vendorOrAdmin`: Vendor or admin access
- `optionalAuth`: Optional authentication

## 🎯 User Model Features

### Core Fields
- Personal info (name, email, phone, avatar, etc.)
- Account status (active, verified)
- Role management
- Password reset tokens

### E-commerce Features
- Wishlist management
- Shopping cart
- Order history
- Multiple addresses
- Payment methods
- User preferences

### Advanced Methods
```javascript
// Password operations
await user.matchPassword(password)
await user.updateLastLogin()

// Cart operations
await user.addToCart(productId, quantity)
await user.removeFromCart(productId)
await user.clearCart()

// Wishlist operations
await user.addToWishlist(productId)
await user.removeFromWishlist(productId)

// Address management
await user.addAddress(addressData)
await user.setDefaultAddress(addressId)
```

## 🚨 Error Handling

### Global Error Handler
- Handles all types of errors consistently
- Formats Mongoose validation errors
- Handles JWT errors
- Returns structured error responses

### Example Error Response
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

## 🔄 Password Reset Flow

1. User requests password reset: `POST /api/auth/forgot-password`
2. System generates reset token and saves to user
3. In production: Send email with reset link
4. User resets password: `PUT /api/auth/reset-password/:token`
5. Token is verified and password updated

## 🌐 CORS Configuration

Configured to allow requests from frontend (default: `http://localhost:5173`)

## 📊 User Statistics

The user model tracks:
- Total orders and spending
- Login count and last login time
- Registration date and updates

## 🎨 Response Format

All API responses follow this structure:
```json
{
  "success": boolean,
  "message": "Description",
  "data": {} // Optional data payload
}
```

## 🚀 Next Steps

The authentication system is complete and ready for:
1. Frontend integration
2. Email service integration for password reset
3. Social login implementation
4. Advanced rate limiting
5. Session management enhancements

## 🔗 Health Check

Visit `http://localhost:5000/api/health` to verify the server is running.

---

**Author**: Chandima  
**Version**: 1.0.0  
**License**: ISC