import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import NavBar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import Footer from "../components/Footer";

export default function ProjectBrowse() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    batch: "",
    program: "",
    course: "",
  });
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Projects" },
  ];

  // Fetch projects from API
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Fetch from your backend API
      const response = await fetch('http://localhost:5000/api/projects');
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      setProjects(data);
      
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key) => (e) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      
      // Build filter payload
      const filterPayload = {};
      if (filters.batch) filterPayload.batch = filters.batch;
      if (filters.program) filterPayload.program = filters.program;
      if (filters.course) filterPayload.course = filters.course;
      if (searchQuery) filterPayload.search = searchQuery;

      // If no filters applied, just fetch all projects
      if (Object.keys(filterPayload).length === 0) {
        await fetchProjects();
        return;
      }

      // Send filter request to backend
      const response = await fetch('http://localhost:5000/api/projects/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filterPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to filter projects');
      }

      const data = await response.json();
      setProjects(data);
      setCurrentPage(1); // Reset to first page
      
      // Show appropriate message based on results
      if (data.length === 0) {
        toast.error('No projects found matching your criteria');
      } else {
        toast.success(`Found ${data.length} project${data.length !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Error filtering projects:', error);
      toast.error('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({ batch: "", program: "", course: "" });
    setSearchQuery("");
    fetchProjects(); // Fetch all projects again
    toast.success('Filters reset');
  };

  // Sort projects based on sortBy state
  const sortedProjects = [...projects].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date) - new Date(a.date);
      case 'oldest':
        return new Date(a.date) - new Date(b.date);
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      default:
        // Keep original order (or could add your own logic here)
        return 0;
    }
  });

  // Pagination (use sortedProjects instead of projects)
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = sortedProjects.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* NavBar */}
      <NavBar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Student Project Showcase
              </h1>
              <p className="text-gray-600">
                Discover innovative projects submitted by students across different programs and courses.
              </p>
            </div>
            {/* Sort By - Top Right */}
            <div className="w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyFilters();
                }
              }}
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Batch Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                value={filters.batch}
                onChange={handleFilterChange("batch")}
              >
                <option value="">All Batches</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>

            {/* Program Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                value={filters.program}
                onChange={handleFilterChange("program")}
              >
                <option value="">All Programs</option>
                <option value="CSC">Computer Science</option>
                <option value="BIS">Business Information System</option>
                <option value="GDNM">Graphic Design and New Media</option>
                <option value="SE">Software Engineering</option>
              </select>
            </div>

            {/* Course Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                value={filters.course}
                onChange={handleFilterChange("course")}
              >
                <option value="">All Courses</option>
                {/* CSC Courses */}
                <optgroup label="Computer Science (CSC)">
                  <option value="Web Application Development and Security">Web Application Development and Security</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Game Development and Programming">Game Development and Programming</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                </optgroup>
                {/* BIS Courses */}
                <optgroup label="Business Information Systems (BIS)">
                  <option value="Enterprise Systems">Enterprise Systems</option>
                  <option value="Business Analytics">Business Analytics</option>
                  <option value="Customer Relationship Management">Customer Relationship Management</option>
                  <option value="Digital Business Strategy">Digital Business Strategy</option>
                  <option value="Supply Chain Management">Supply Chain Management</option>
                </optgroup>
                {/* GDNM Courses */}
                <optgroup label="Graphic Design and New Media (GDNM)">
                  <option value="Brand Identity Design">Brand Identity Design</option>
                  <option value="Interactive Media Design">Interactive Media Design</option>
                  <option value="Motion Graphics and Animation">Motion Graphics and Animation</option>
                  <option value="User Experience Design">User Experience Design</option>
                  <option value="Typography and Layout Design">Typography and Layout Design</option>
                  <option value="3D Modeling and Visualization">3D Modeling and Visualization</option>
                  <option value="Visual Communication Design">Visual Communication Design</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span>Apply Filters</span>
            </button>
            <button
              onClick={resetFilters}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Results Count and View Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {sortedProjects.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, sortedProjects.length)}{" "}
            of {sortedProjects.length} projects
          </p>
          
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">View:</span>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded border ${
                  viewMode === "grid"
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
                  <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
                  <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
                  <rect x="14" y="14" width="7" height="7" strokeWidth="2" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded border ${
                  viewMode === "list"
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <line x1="4" y1="6" x2="20" y2="6" strokeWidth="2" />
                  <line x1="4" y1="12" x2="20" y2="12" strokeWidth="2" />
                  <line x1="4" y1="18" x2="20" y2="18" strokeWidth="2" />
                </svg>
              </button>
            </div>

            {/* Items per page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Items per page:</span>
              <select 
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-gray-600">Loading projects...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No projects found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your filters or check back later for new projects.
              </p>
            </div>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                : "space-y-4 mb-8"
            }
          >
            {currentProjects.map((project) => (
              <div
                key={project._id || project.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
              >
                {/* Thumbnail */}
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm font-medium">
                    {project.title}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Author */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs text-gray-600">
                        {project.author?.name ? project.author.name.charAt(0) : project.author?.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {project.author?.name || project.author}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {project.date
                          ? new Date(project.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {project.program || 'CSC'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {projects.length > 0 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === index + 1
                    ? "bg-black text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}