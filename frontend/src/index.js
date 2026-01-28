import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AddPage from "./pages/AddPage";
import VerifyPage from "./pages/VerifyPage";
import HomePage from "./pages/HomePage";
import ContactPage from "./pages/ContactPage";
import "./App.css";
import Navbar from "./components/Navbar";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <div style={{ minHeight: "100vh", background: "var(--bg-dark)", color: "var(--text-primary)" }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add" element={<AddPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        {/* default fallback */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </div>
  </BrowserRouter>
);
