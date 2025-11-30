import { Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp";
import ProjectBrowse from "./pages/ProjectBrowse";
import ChooseSubmission from "./pages/ChooseSubmission";
import LecturerDashboard from "./pages/LecturerDashboard";
import LecturerProfile from "./pages/LecturerProfile";
import UserManagement from "./pages/UserManagement";
import ActivityLog from "./pages/ActivityLog";
import EditAdminProfile from './pages/EditAdminProfile';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/project-browse" />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/choose-submission" element={<ChooseSubmission />} />
      <Route path="/project-browse" element={<ProjectBrowse />} />
      <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
      <Route path="/lecturer-profile/:email" element={<LecturerProfile />} />
      <Route path="/user-management" element={<UserManagement />}>
        <Route path="edit-profile" element={<EditAdminProfile />} />
      </Route>
      
      <Route path="/activity-log" element={<ActivityLog />} />
    </Routes>
  );
}