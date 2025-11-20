import { useParams, Link } from 'react-router-dom'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'

const EditProject = () => {
  const { projectId } = useParams()

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-16 px-4 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-base-content">Edit Project</h1>
          <Link to="/student-dashboard" className="btn bg-black text-white hover:bg-black/90">
            Back to Dashboard
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default EditProject

