import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Projects from './pages/Projects'
import SelectRoles from './pages/SelectRoles'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import NotFound from './common/NotFound'

function App() {
  console.log('App component rendering')
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/select-role" element={<SelectRoles />} />
      <Route path="/login" element={<Login />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
