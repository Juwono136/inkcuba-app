import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProjects, setFilters, resetFilters, setCurrentPage } from '../features/projects/projectSlice'
import { dummyProjects, programs, courses } from '../utils/dummyData'
import Header from '../common/Header'
import Footer from '../common/Footer'
import Loader from '../common/Loader'
import FormattedDate from '../common/Date'
import { FaSearch, FaFilter, FaRedo, FaUser, FaTh, FaList } from 'react-icons/fa'

const Projects = () => {
  const dispatch = useDispatch()
  const { projects, loading, totalProjects, currentPage, filters } = useSelector(
    (state) => state.projects
  )

  const [localFilters, setLocalFilters] = useState({
    batch: 'all',
    program: 'all',
    course: 'all',
    search: '',
  })
  const [sortBy, setSortBy] = useState('top-recommended')
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [viewMode, setViewMode] = useState('grid')

  // Sync local filters with Redux filters on mount and when filters change
  useEffect(() => {
    if (filters) {
      setLocalFilters({
        batch: filters.batch || 'all',
        program: filters.program || 'all',
        course: filters.course || 'all',
        search: filters.search || '',
      })
      if (filters.sortBy) {
        setSortBy(filters.sortBy)
      }
    }
  }, [filters])

  // Filter and sort projects using Redux filters
  const filteredProjects = useMemo(() => {
    let filtered = [...dummyProjects]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.author.toLowerCase().includes(searchLower)
      )
    }

    // Apply batch filter
    if (filters.batch && filters.batch !== 'all') {
      filtered = filtered.filter((project) => project.batch === filters.batch)
    }

    // Apply program filter
    if (filters.program && filters.program !== 'all') {
      filtered = filtered.filter((project) => project.program === filters.program)
    }

    // Apply course filter
    if (filters.course && filters.course !== 'all') {
      filtered = filtered.filter((project) => project.course === filters.course)
    }

    // Apply sorting
    const currentSortBy = filters.sortBy || sortBy
    switch (currentSortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
        break
      case 'most-viewed':
        // For now, just maintain original order (would need view count in data)
        break
      case 'top-recommended':
      default:
        // Default order (could be based on recommendations)
        break
    }

    return filtered
  }, [filters, sortBy])

  const total = filteredProjects.length
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

  const handleFilterChange = (key, value) => {
    setLocalFilters({ ...localFilters, [key]: value })
  }

  const handleApplyFilters = () => {
    dispatch(setFilters({ ...localFilters, sortBy }))
    dispatch(setCurrentPage(1))
    // dispatch(fetchProjects({ ...localFilters, sortBy, page: 1, limit: itemsPerPage }))
  }

  const handleReset = () => {
    setLocalFilters({ batch: 'all', program: 'all', course: 'all', search: '' })
    setSortBy('top-recommended')
    dispatch(resetFilters())
    dispatch(setCurrentPage(1))
  }

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = Math.ceil(total / itemsPerPage)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-base-content">
              Student Project Showcase
            </h1>
            <p className="text-base-content/70">
              Discover innovative projects submitted by students across
              different programs and courses.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-base-100 p-6 rounded-lg shadow-md mb-6">
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="input input-bordered w-full pr-10"
                  value={localFilters.search}
                  onChange={(e) =>
                    handleFilterChange('search', e.target.value)
                  }
                />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <select
                  className="select select-bordered w-full"
                  value={localFilters.batch}
                  onChange={(e) => handleFilterChange('batch', e.target.value)}
                >
                  <option value="all">All Batches</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>
              <div>
                <select
                  className="select select-bordered w-full"
                  value={localFilters.program}
                  onChange={(e) =>
                    handleFilterChange('program', e.target.value)
                  }
                >
                  <option value="all">All Programs</option>
                  {Object.entries(programs).map(([key, program]) => (
                    <option key={key} value={key}>
                      {program.name} ({program.abbreviation})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  className="select select-bordered w-full"
                  value={localFilters.course}
                  onChange={(e) => handleFilterChange('course', e.target.value)}
                >
                  <option value="all">All Courses</option>
                  {Object.entries(courses).map(([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-4">
                <button
                  className="btn btn-primary"
                  onClick={handleApplyFilters}
                >
                  <FaFilter className="w-4 h-4 mr-2" />
                  Apply Filters
                </button>
                <button className="btn btn-outline" onClick={handleReset}>
                  <FaRedo className="w-4 h-4 mr-2" />
                  Reset
                </button>
              </div>
              <div>
                <select
                  className="select select-bordered"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="top-recommended">Top Recommended</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most-viewed">Most Viewed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Project Display Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <p className="text-sm text-base-content/70 mb-4 sm:mb-0">
              Showing {startIndex + 1}-{Math.min(endIndex, total)} of {total}{' '}
              projects
            </p>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  className={`btn btn-sm btn-square ${
                    viewMode === 'grid' ? 'btn-primary' : 'btn-outline'
                  }`}
                  onClick={() => setViewMode('grid')}
                >
                  <FaTh className="w-4 h-4" />
                </button>
                <button
                  className={`btn btn-sm btn-square ${
                    viewMode === 'list' ? 'btn-primary' : 'btn-outline'
                  }`}
                  onClick={() => setViewMode('list')}
                >
                  <FaList className="w-4 h-4" />
                </button>
              </div>
              <select
                className="select select-bordered select-sm"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  dispatch(setCurrentPage(1))
                }}
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <Loader />
          ) : (
            <div
              className={`grid gap-6 mb-8 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {paginatedProjects.map((project) => (
                <div
                  key={project.id}
                  className={`card bg-base-100 shadow-md hover:shadow-lg transition-shadow ${
                    viewMode === 'list' ? 'card-side' : ''
                  }`}
                >
                  <figure
                    className={`bg-base-300 flex items-center justify-center ${
                      viewMode === 'list'
                        ? 'w-48 h-full'
                        : 'h-48 w-full'
                    }`}
                  >
                    <span className="text-white text-sm">{project.title}</span>
                  </figure>
                  <div className="card-body">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-8">
                          <FaUser className="w-4 h-4" />
                        </div>
                      </div>
                      <span className="text-sm text-base-content/70">
                        {project.author}
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                className="btn btn-sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                «
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      className={`btn btn-sm ${
                        currentPage === page ? 'btn-primary' : ''
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="btn btn-sm btn-disabled">
                      ...
                    </span>
                  )
                }
                return null
              })}
              <button
                className="btn btn-sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Projects

