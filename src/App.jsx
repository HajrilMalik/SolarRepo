import { Routes, Route, Navigate } from "react-router-dom";
import HomeUser from "@/pages/home/homeUser";
import Login from "@/pages/auth/Login";
import ProtectedRoute from "@/components/ProtectedRoute"; // Buat komponen ini

function App() {
  return (
    <Routes>
      <Route path="/home" element={<HomeUser />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
