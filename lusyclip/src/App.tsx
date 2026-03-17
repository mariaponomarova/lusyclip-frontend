import { Routes, Route } from "react-router-dom";
import ClipListPage from "./pages/ClipListPage";
import ClipDetailPage from "./pages/ClipDetailPage";
import ReviewHistoryPage from "./pages/ReviewHistoryPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ClipListPage />} />
      <Route path="/clips/:clipId" element={<ClipDetailPage />} />
      <Route path="/history" element={<ReviewHistoryPage />} />
    </Routes>
  );
}