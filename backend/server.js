import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import userRoutes from "./routes/user.routes.js";
import orderRoutes from "./routes/order.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import cartRoutes from "./routes/cart.routes.js";

// Import middleware
import { errorHandler, notFound } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GlobalStock API is running! 🚀",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      users: "/api/users",
      orders: "/api/orders",
      reviews: "/api/reviews",
      categories: "/api/categories",
      cart: "/api/cart",
      health: "/api/health"
    }
  });
});

// Welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🌍 Welcome to GlobalStock E-commerce API!",
    description: "Your complete e-commerce solution",
    version: "1.0.0",
    documentation: "Visit /api/health for API status",
    endpoints: {
      authentication: "/api/auth",
      products: "/api/products",
      users: "/api/users",
      orders: "/api/orders",
      reviews: "/api/reviews",
      categories: "/api/categories",
      cart: "/api/cart",
      health: "/api/health"
    }
  });
});

// 404 handler for unmatched routes
app.use(notFound);

// Global error handler (should be last middleware)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 Server started at http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  console.error(err.stack);
  // Keep server running
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  // Keep server running
});