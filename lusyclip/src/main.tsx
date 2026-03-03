import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import ClipListPage from "./pages/ClipListPage";
import ClipDetailPage from "./pages/ClipDetailPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClipListPage />} />
        <Route path="/clips/:clipId" element={<ClipDetailPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);