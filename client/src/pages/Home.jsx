import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setFilters, setCurrentPage } from '../features/projects/projectSlice'
import { dummyProjects, dummyCategories } from '../utils/dummyData'
import Header from '../common/Header'
import Footer from '../common/Footer'
import FormattedDate from '../common/Date'
import { FaUser, FaChevronDown, FaCog, FaCode, FaDesktop, FaChartBar } from 'react-icons/fa'

const Home = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.projects)

  useEffect(() => {
    console.log('Home component mounted')
  }, [])

  // Use dummy data for now
  const latestProjects = dummyProjects.slice(0, 3)
  const displayCategories = dummyCategories

  // Map category codes to program keys
  const categoryToProgram = {
    CS: 'cs',
    IT: 'it',
    BMM: 'bmm',
    GDNM: 'gdnm',
  }

  const handleSeeMore = () => {
    dispatch(setFilters({ 
      batch: 'all',
      program: 'all',
      course: 'all',
      search: '',
      sortBy: 'newest'
    }))
    dispatch(setCurrentPage(1))
    navigate('/projects')
  }

  const handleCategoryClick = (categoryCode) => {
    const programKey = categoryToProgram[categoryCode]
    if (programKey) {
      dispatch(setFilters({ program: programKey }))
      dispatch(setCurrentPage(1))
      navigate('/projects')
    } else {
      navigate('/projects')
    }
  }

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'gear':
        return <FaCog className="w-12 h-12" />
      case 'code':
        return <FaCode className="w-12 h-12" />
      case 'monitor':
        return <FaDesktop className="w-12 h-12" />
      case 'chart':
        return <FaChartBar className="w-12 h-12" />
      default:
        return <FaCog className="w-12 h-12" />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-base-content">
              Showcase Your Best Projects
            </h1>
            <p className="text-lg text-base-content/70 mb-8 max-w-2xl mx-auto">
              Discover amazing projects from talented creators around the world.
              Choose whether you want to start uploading a project or look at
              projects
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/select-role" className="btn btn-primary text-white">
                Get Started
              </Link>
              <Link to="/projects" className="btn btn-outline">
                Browse Projects
              </Link>
            </div>
          </div>
        </section>

        {/* Latest Projects Section */}
        <section className="py-12 px-4 lg:px-8 bg-base-200">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-2 text-base-content">
                Latest Projects
              </h2>
              <p className="text-base-content/70">
                Projects shown here are based on the published date
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {latestProjects.map((project) => (
                <div key={project.id} className="card bg-base-100 shadow-md">
                  <figure className="bg-base-300 h-48 flex items-center justify-center">
                    <span className="text-white text-sm">Project Preview</span>
                  </figure>
                  <div className="card-body">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-8">
                          <FaUser className="w-4 h-4" />
                        </div>
                      </div>
                      <span className="text-sm text-base-content/70">
                        by {project.author}
                      </span>
                    </div>
                    <h3 className="card-title text-lg">{project.title}</h3>
                    <p className="text-sm text-base-content/70">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <FormattedDate date={project.date} />
                      <span className="badge badge-outline">
                        {project.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button className="btn btn-outline" onClick={handleSeeMore}>
                <FaChevronDown className="w-4 h-4 mr-2" />
                See More
              </button>
            </div>
          </div>
        </section>

        {/* Browse by Category Section */}
        <section className="py-12 px-4 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-2 text-base-content">
                Browse by Category
              </h2>
              <p className="text-base-content/70">
                Find projects that match your interests
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {displayCategories.map((category) => (
                <div
                  key={category.id}
                  className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleCategoryClick(category.code)}
                >
                  <div className="card-body items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center mb-4">
                      {getCategoryIcon(category.icon)}
                    </div>
                    <h3 className="font-bold text-lg">{category.code}</h3>
                    <p className="text-sm text-base-content/70">
                      {category.count} projects
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default Home
