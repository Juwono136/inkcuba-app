import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Projects from './pages/Projects'
import SelectRoles from './pages/SelectRoles'
import NotFound from './common/NotFound'

function App() {
  console.log('App component rendering')
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/select-role" element={<SelectRoles />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
