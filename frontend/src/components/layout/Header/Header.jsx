// src/components/layout/Header/Header.jsx
import React from "react";
import { Button } from "@/components/ui/Button"; // or "../ui/Button" depending on setup
import { Link } from "react-router-dom";

export default function Header() {
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
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => console.log("Login clicked")}>
            Login
          </Button>
          <Button variant="primary" onClick={() => console.log("Sign Up clicked")}>
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
}
