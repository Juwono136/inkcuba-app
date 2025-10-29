import { Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}
