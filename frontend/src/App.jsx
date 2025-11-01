// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
