import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import NavBar from "../commons/Navbar";
import Footer from "../commons/Footer";
import ManagementFilterSection from "../components/lecturerDashboard-components/ManagementFilterSection";
import ProjectColumn from "../components/lecturerDashboard-components/ProjectColumn";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Available lecturers for simulation
const LECTURERS = [
  { name: "Dr. Sarah Johnson", email: "sarah.johnson@binus.ac.id" },
  { name: "Prof. Michael Chen", email: "michael.chen@binus.ac.id" },
  { name: "Dr. Lisa Anderson", email: "lisa.anderson@binus.ac.id" },
  { name: "Prof. Robert Taylor", email: "robert.taylor@binus.ac.id" },
  { name: "Dr. Amanda Lee", email: "amanda.lee@binus.ac.id" },
  { name: "Prof. James Wilson", email: "james.wilson@binus.ac.id" },
  { name: "Dr. Rachel Green", email: "rachel.green@binus.ac.id" },
  { name: "Prof. Kevin Park", email: "kevin.park@binus.ac.id" },
];

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const [approvedProjects, setApprovedProjects] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Simulated logged-in lecturer (stored in localStorage for persistence)
  const [currentLecturer, setCurrentLecturer] = useState(() => {
    const saved = localStorage.getItem('simulatedLecturer');
    return saved ? JSON.parse(saved) : LECTURERS[0];
  });

  const [filters, setFilters] = useState({
    batch: "",
    course: "",
    program: "",
    sortBy: "recent",
    projectType: "",
  });

  // Handle lecturer change (for simulation)
  const handleLecturerChange = (email) => {
    const lecturer = LECTURERS.find(l => l.email === email);
    if (lecturer) {
      setCurrentLecturer(lecturer);
      localStorage.setItem('simulatedLecturer', JSON.stringify(lecturer));
      toast.success(`Now viewing as ${lecturer.name}`);
    }
  };

  // Fetch projects from API
  useEffect(() => {
    fetchProjects();
  }, [currentLecturer]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      const approvedRes = await fetch(`${API_URL}/api/projects?status=approved&assignedLecturerEmail=${currentLecturer.email}`);
      const approvedData = await approvedRes.json();
      const pendingRes = await fetch(`${API_URL}/api/projects?status=awaiting_approval&assignedLecturerEmail=${currentLecturer.email}`);
      const pendingData = await pendingRes.json();
      const revisionRes = await fetch(`${API_URL}/api/projects?status=needs_revision&assignedLecturerEmail=${currentLecturer.email}`);
      const revisionData = await revisionRes.json();
      
      setApprovedProjects(approvedData);
      setPendingProjects([...pendingData, ...revisionData]);
      
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
    navigate(`/review-project/${project._id}`);
  };

  const handleViewProject = (project) => {
    navigate(`/review-project/${project._id}`);
  };

  // Filter and sort projects
  const filterAndSortProjects = (projects) => {
    let filtered = [...projects];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.submitter?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.batch) {
      filtered = filtered.filter((p) => p.academicInfo?.batch === filters.batch);
    }
    if (filters.course) {
      filtered = filtered.filter((p) => p.academicInfo?.course === filters.course);
    }
    if (filters.program) {
      filtered = filtered.filter((p) => p.academicInfo?.program === filters.program);
    }
    if (filters.projectType) {
      filtered = filtered.filter((p) => {
        const hasCollaborators = p.teamCollaborators && p.teamCollaborators.length > 0;
        return filters.projectType === 'group' ? hasCollaborators : !hasCollaborators;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'recent':
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        case 'oldest':
          return new Date(a.submittedAt) - new Date(b.submittedAt);
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredApprovedProjects = filterAndSortProjects(approvedProjects);
  const filteredPendingProjects = filterAndSortProjects(pendingProjects);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* NavBar */}
      <NavBar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Project Management
              </h1>
              <p className="text-gray-600">
                Review and manage student project submissions
              </p>
            </div>
            
            {/* Lecturer Simulator - subtle */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>as:</span>
              <select
                value={currentLecturer.email}
                onChange={(e) => handleLecturerChange(e.target.value)}
                className="px-2 py-1 text-xs text-gray-500 bg-transparent border-none cursor-pointer hover:text-gray-700 focus:outline-none"
              >
                {LECTURERS.map((lecturer) => (
                  <option key={lecturer.email} value={lecturer.email}>
                    {lecturer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
              key={`approved-${currentLecturer.email}`}
              title="Approved Projects"
              count={filteredApprovedProjects.length}
              projects={filteredApprovedProjects}
              type="approved"
              onAction={handleViewProject}
              loading={loading}
            />
          </div>

          {/* Pending Review Projects Column */}
          <div className="h-full">
            <ProjectColumn
              key={`pending-${currentLecturer.email}`}
              title="In Need of Review"
              count={filteredPendingProjects.length}
              projects={filteredPendingProjects}
              type="pending"
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