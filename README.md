# 🌍 GlobalStock E-commerce Platform

> Complete MERN Stack E-commerce Solution with 89+ API Endpoints

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/cloud/atlas)

## 🚀 Features

### Backend (✅ Complete)
- **Authentication & Authorization** - JWT-based auth with role management
- **Product Management** - Full CRUD with inventory tracking
- **Shopping Cart** - Real-time cart with discount support
- **Order Management** - Complete order lifecycle tracking
- **Review System** - Product reviews with moderation
- **Category Management** - Hierarchical category structure
- **User Management** - Profiles, addresses, wishlist

### Frontend (🔜 In Progress)
- React 18 with Vite
- Modern UI/UX
- Responsive design

---

## 📊 Backend Stats

| Metric | Count |
|--------|-------|
| **API Endpoints** | 89 |
| **Controllers** | 7 |
| **Models** | 6 |
| **Route Files** | 7 |
| **Functions** | 91+ |

---

## 🏗️ Architecture

```
GlobalStock/
├── backend/
│   ├── server.js                     # Express server
│   ├── controllers/                  # Business logic (7 controllers)
│   │   ├── auth.controller.js       # Authentication (5 functions)
│   │   ├── product.controller.js    # Products (10 functions)
│   │   ├── user.controller.js       # Users (19 functions)
│   │   ├── order.controller.js      # Orders (14 functions)
│   │   ├── review.controller.js     # Reviews (14 functions)
│   │   ├── category.controller.js   # Categories (17 functions)
│   │   └── cart.controller.js       # Cart (12 functions)
│   ├── models/                       # MongoDB schemas (6 models)
│   ├── routes/                       # API routes (7 files)
│   ├── middleware/                   # Auth & error handling
│   └── utils/                        # Helper functions
├── frontend/                         # React application
├── .env                              # Environment variables
└── package.json                      # Dependencies
```

---

## 🚦 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas account
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/Chandima0406/GlobalStock.git
cd GlobalStock

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start backend server
npm start

# Or start with auto-reload
npm run dev
```

Server will start at **http://localhost:5000**

### Frontend Setup

```bash
# Install frontend dependencies
npm run install:client

# Start frontend dev server
npm run client

# Or start both backend + frontend
npm run dev:all
```

---

## 📡 API Modules

### 1. Authentication (`/api/auth`)
- User registration & login
- JWT token management
- Profile access

### 2. Products (`/api/products`)
- Product CRUD operations
- Inventory management
- Search & filtering

### 3. Users (`/api/users`)
- Profile management
- Address book
- Wishlist
- Order history
- Admin user management

### 4. Orders (`/api/orders`)
- Order creation & tracking
- Payment processing
- Vendor order management
- Admin analytics

### 5. Reviews (`/api/reviews`)
- Product reviews
- Rating system
- Like/dislike
- Admin moderation

### 6. Categories (`/api/categories`)
- Hierarchical categories
- Category tree navigation
- Featured categories

### 7. Cart (`/api/cart`)
- Add/update/remove items
- Apply discounts
- Shipping calculation
- Guest cart merging

---

## 🔐 Authentication

Most endpoints require JWT authentication:

```bash
# Register
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

# Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securePassword123"
}

# Use token in subsequent requests
Authorization: Bearer <your_jwt_token>
```

### User Roles
- **Customer** (default) - Browse, purchase, review
- **Vendor** - Manage own products
- **Admin** - Full system access

---

## 📖 Documentation

- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Backend Summary](BACKEND_COMPLETION_SUMMARY.md)** - Architecture overview
- **[Quick Start](QUICK_START.md)** - Testing guide
- **[Success Report](SUCCESS_REPORT.md)** - What's been built

---

## 🛠️ Available Scripts

```bash
npm start              # Start backend server
npm run dev            # Start with nodemon (auto-reload)
npm run client         # Start frontend dev server
npm run dev:all        # Start both backend + frontend
npm run install:client # Install frontend dependencies
npm run build:client   # Build frontend for production
```

---

## 🌐 API Endpoints Overview

### Public Endpoints (No Auth Required)
```
GET  /api/health              # Server health check
GET  /api/products            # Browse products
GET  /api/categories          # Browse categories
GET  /api/reviews/product/:id # View reviews
```

### Protected Endpoints (Auth Required)
```
GET    /api/users/profile     # Get user profile
POST   /api/cart/items        # Add to cart
POST   /api/orders            # Create order
POST   /api/reviews           # Write review
```

### Admin Endpoints
```
GET    /api/users             # Manage users
POST   /api/products          # Create products
PUT    /api/orders/:id/status # Update order status
```

**Total**: 89 endpoints - See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete list

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/globalstock

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## 🗄️ Database Models

### User Model
- Authentication credentials
- Profile information
- Addresses array
- Wishlist
- Role management

### Product Model
- Product details
- Inventory tracking
- Images & variants
- Category reference
- Ratings

### Order Model
- Order items
- Customer information
- Shipping details
- Payment status
- Tracking information

### Cart Model
- User reference
- Cart items with quantities
- Discount information
- Shipping details
- Total calculations

### Review Model
- Product reference
- Rating & comment
- User information
- Like/dislike counts
- Admin status

### Category Model
- Hierarchical structure
- Parent/child relationships
- Featured status
- Product count

---

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control
- ✅ Input validation
- ✅ CORS configuration
- ✅ Error handling
- ✅ Request rate limiting (ready to implement)

---

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)
```bash
# Set environment variables
# Deploy from main branch
git push heroku main
```

### Database (MongoDB Atlas)
1. Create cluster
2. Add IP whitelist
3. Get connection string
4. Update MONGO_URI in .env

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build:client
# Deploy dist folder
```

---

## 📈 Project Status

### Completed ✅
- [x] Backend API (89 endpoints)
- [x] Authentication system
- [x] Product management
- [x] Order processing
- [x] Cart functionality
- [x] Review system
- [x] Category management
- [x] User management
- [x] API documentation

### In Progress 🔄
- [ ] Frontend UI development
- [ ] Payment integration
- [ ] Email notifications
- [ ] Admin dashboard

### Planned 📋
- [ ] Product search optimization
- [ ] Image upload (Cloudinary)
- [ ] Order tracking emails
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Chandima**
- GitHub: [@Chandima0406](https://github.com/Chandima0406)
- Email: chandima0406sajith@example.com

---

## 🙏 Acknowledgments

- MERN Stack community
- MongoDB Atlas
- Express.js team
- React team
- All contributors

---

## 📞 Support

For support, email chandima0406sajith@example.com or open an issue on GitHub.

---

## 🎯 What's Next?

1. **Fix MongoDB Connection** - Add IP to Atlas whitelist
2. **Test APIs** - Use Postman/Thunder Client
3. **Build Frontend** - Create React components
4. **Deploy** - Launch to production

---

**GlobalStock E-commerce Platform v1.0.0**  
*Built with ❤️ using MERN Stack*

---

## 🔗 Quick Links

- [API Documentation](API_DOCUMENTATION.md)
- [Quick Start Guide](QUICK_START.md)
- [Backend Summary](BACKEND_COMPLETION_SUMMARY.md)
- [Success Report](SUCCESS_REPORT.md)
- [GitHub Repository](https://github.com/Chandima0406/GlobalStock)

---

*Last Updated: January 2025*