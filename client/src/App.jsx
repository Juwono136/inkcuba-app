import { Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp";
import ProjectBrowse from "./pages/ProjectBrowse";
import ChooseSubmission from "./pages/ChooseSubmission";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/project-browse" />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/choose-submission" element={<ChooseSubmission />} />
      <Route path="/project-browse" element={<ProjectBrowse />} />
    </Routes>
  );
}
