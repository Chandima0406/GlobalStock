// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import all your pages

import About from "./pages/Static/About";
import LoginPage from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ProfilePage from './pages/User/Profile';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Header */}

      {/* Page content changes based on route */}
      <main className="grow">
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Add more routes here */}
        </Routes>
      </main>

      {/* Global Footer */}
    </div>
  );
}

export default App;
