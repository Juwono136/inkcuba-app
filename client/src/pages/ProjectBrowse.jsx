import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import NavBar from "../commons/Navbar";
import Breadcrumb from "../commons/Breadcrumb";
import Footer from "../commons/Footer";
import FilterSection from "../components/projectBrowse-components/FilterSection";
import ProjectGrid from "../components/projectBrowse-components/ProjectGrid";
import ViewControls from "../components/projectBrowse-components/ViewControls";
import Pagination from "../components/projectBrowse-components/Pagination";

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
  const [viewMode, setViewMode] = useState("grid");
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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      
      const filterPayload = {};
      if (filters.batch) filterPayload.batch = filters.batch;
      if (filters.program) filterPayload.program = filters.program;
      if (filters.course) filterPayload.course = filters.course;
      if (searchQuery) filterPayload.search = searchQuery;

      if (Object.keys(filterPayload).length === 0) {
        await fetchProjects();
        return;
      }

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
      setCurrentPage(1);
      
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
    fetchProjects();
    toast.success('Filters reset');
  };

  const handleItemsPerPageChange = (newValue) => {
    setItemsPerPage(newValue);
    setCurrentPage(1); // Reset to first page
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
        return 0;
    }
  });

  // Pagination
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

        {/* Filter Section Component */}
        <FilterSection
          filters={filters}
          onFilterChange={handleFilterChange}
          onApply={applyFilters}
          onReset={resetFilters}
        />

        {/* View Controls Component */}
        <ViewControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          totalProjects={sortedProjects.length}
          startIndex={startIndex}
          endIndex={endIndex}
        />

        {/* Project Grid Component */}
        <ProjectGrid
          projects={currentProjects}
          viewMode={viewMode}
          loading={loading}
        />

        {/* Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}