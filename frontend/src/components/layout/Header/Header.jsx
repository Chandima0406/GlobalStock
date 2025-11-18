// src/components/layout/Header/Header.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/Button"; // or "../ui/Button" depending on setup
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Get token from localStorage
      const token = localStorage.getItem('token');

      // Call backend logout API (optional, for session cleanup)
      if (token) {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('remember_me');

      // Update auth context
      logout();

      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      logout();
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        {/* Left Section: Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          GlobalStock
        </Link>

        {/* Middle Section: Navigation */}
        <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <Link to="/products" className="hover:text-blue-600">Products</Link>
          <Link to="/about" className="hover:text-blue-600">About</Link>
          <Link to="/contact" className="hover:text-blue-600">Contact</Link>
        </nav>

        {/* Right Section: Buttons */}
        <div className="flex gap-3 items-center">
          {isAuthenticated ? (
            <>
              {/* User Info */}
              <div className="hidden md:flex items-center gap-2 text-gray-700">
                <span className="text-sm">Welcome, <span className="font-medium">{user?.name || 'User'}</span></span>
                {user?.role && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {user.role}
                  </span>
                )}
              </div>
              
              {/* Profile Button */}
              <Button variant="outline" onClick={() => navigate('/profile')}>
                Profile
              </Button>
              
              {/* Logout Button */}
              <Button 
                variant="primary" 
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            </>
          ) : (
            <>
              {/* Login Button */}
              <Button variant="outline" onClick={() => navigate('/login')}>
                Login
              </Button>
              
              {/* Sign Up Button */}
              <Button variant="primary" onClick={() => navigate('/register')}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
