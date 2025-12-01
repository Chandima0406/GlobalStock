// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import all your pages

import About from "./pages/Static/About";
import LoginPage from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import VendorPending from "./pages/Auth/VendorPending";
import ProfilePage from './pages/User/Profile';
import ProductCreationPage from './pages/Products/ProductCreationPage';
import ProductEditForm from './components/forms/ProductEditForm/ProductEditForm';
import AdminProductEdit from './pages/Admin/Products/ProductEdit';
import ProductEditPage from './pages/Vendor/Products/ProductEdit';
import HomePage from './pages/Home/Home';
import ProductsPage from './pages/Products/Products';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Header */}

      {/* Page content changes based on route */}
      <main className="grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/vendor-pending" element={<VendorPending />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/create" element={<ProductCreationPage />} />
          <Route path="/products/edit/:productId" element={<ProductEditForm />} /> 
          <Route path="/admin/products/edit/:productId" element={<AdminProductEdit />} /> 
          <Route path="/vendor/products/edit/:productId" element={<ProductEditPage />} />
          {/* Add more routes here */}
        </Routes>
      </main>

      {/* Global Footer */}
    </div>
  );
}

export default App;
