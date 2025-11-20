import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import NavBar from "../commons/Navbar";
import Footer from "../commons/Footer";
import ManagementFilterSection from "../components/lecturerDashboard-components/ManagementFilterSection";
import ProjectColumn from "../components/lecturerDashboard-components/ProjectColumn";

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const [approvedProjects, setApprovedProjects] = useState([]);
  const [awaitingProjects, setAwaitingProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    batch: "",
    course: "",
    program: "",
    sortBy: "recent",
    projectType: "",
  });

  // Fetch projects from API
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch all projects
      const response = await fetch('http://localhost:5000/api/projects');
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      
      // Separate projects by status
      const approved = data.filter(p => p.status === 'approved');
      const awaiting = data.filter(p => p.status === 'awaiting_approval');
      
      setApprovedProjects(approved);
      setAwaitingProjects(awaiting);
      
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

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilters({
      batch: "",
      course: "",
      program: "",
      sortBy: "recent",
      projectType: "",
    });
    toast.success('Filters reset');
  };

  const handleReviewProject = (project) => {
    navigate(`/project-review/${project._id || project.id}`);
  };

  const handleViewProject = (project) => {
    navigate(`/project-detail/${project._id || project.id}`);
  };

  // Filter and sort projects
  const filterAndSortProjects = (projects) => {
    let filtered = [...projects];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.batch) {
      filtered = filtered.filter((p) => p.batch === filters.batch);
    }
    if (filters.course) {
      filtered = filtered.filter((p) => p.course === filters.course);
    }
    if (filters.program) {
      filtered = filtered.filter((p) => p.program === filters.program);
    }
    if (filters.projectType) {
      filtered = filtered.filter((p) => p.projectType === filters.projectType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'recent':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredApprovedProjects = filterAndSortProjects(approvedProjects);
  const filteredAwaitingProjects = filterAndSortProjects(awaitingProjects);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* NavBar */}
      <NavBar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Project Management
          </h1>
          <p className="text-gray-600">
            Review and manage student project submissions
          </p>
        </div>

        {/* Filter Section */}
        <ManagementFilterSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Two Column Layout - Equal Height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Approved Projects Column */}
          <div className="h-full">
            <ProjectColumn
              title="Approved Projects"
              count={filteredApprovedProjects.length}
              projects={filteredApprovedProjects}
              type="approved"
              onAction={handleViewProject}
              loading={loading}
            />
          </div>

          {/* Awaiting Approval Projects Column */}
          <div className="h-full">
            <ProjectColumn
              title="In Need of Review"
              count={filteredAwaitingProjects.length}
              projects={filteredAwaitingProjects}
              type="awaiting"
              onAction={handleReviewProject}
              loading={loading}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}