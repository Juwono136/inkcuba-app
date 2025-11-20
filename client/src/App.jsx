import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Projects from './pages/Projects'
import SelectRoles from './pages/SelectRoles'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import ProjectStatus from './pages/ProjectStatus'
import ViewProject from './pages/ViewProject'
import EditProject from './pages/EditProject'
import ReviseProject from './pages/ReviseProject'
import NotFound from './common/NotFound'
import ProtectedRoute from './common/ProtectedRoute'

function App() {
  console.log('App component rendering')
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/select-role" element={<SelectRoles />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project-status/:projectId"
        element={
          <ProtectedRoute>
            <ProjectStatus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/view-project/:projectId"
        element={
          <ProtectedRoute>
            <ViewProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-project/:projectId"
        element={
          <ProtectedRoute>
            <EditProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/revise-project/:projectId"
        element={
          <ProtectedRoute>
            <ReviseProject />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
