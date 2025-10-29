// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Import all your pages

import About from "@/pages/Static/About";


function App() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Header */}
      

      {/* Page content changes based on route */}
      <main className="grow">
        <Routes>
          
          <Route path="/about" element={<About />} />
          {/* Add more routes here */}
        </Routes>
      </main>

      {/* Global Footer */}
      
    </div>
  );
}

export default App;
