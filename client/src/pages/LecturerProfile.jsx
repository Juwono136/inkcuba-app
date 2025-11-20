import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import NavBar from "../commons/Navbar";
import Footer from "../commons/Footer";
import LecturerHeader from "../components/lecturerProfile-components/LecturerHeader";
import ProjectsSearchFilter from "../components/lecturerProfile-components/ProjectsSearchFilter";
import ApprovedProjectCard from "../components/lecturerProfile-components/ApprovedProjectCard";
import ProjectsPagination from "../components/lecturerProfile-components/ProjectsPagination";
import EmptyProjectsState from "../components/lecturerProfile-components/EmptyProjectsState";

export default function LecturerProfile() {
  const { email } = useParams();
  const navigate = useNavigate();
  
  const [lecturer, setLecturer] = useState(null);
  const [approvedProjects, setApprovedProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("All Years");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage, setProjectsPerPage] = useState(5); 

  useEffect(() => {
    fetchLecturerData();
  }, [email]);

  useEffect(() => {
    filterProjects();
  }, [approvedProjects, searchQuery, selectedYear]);

  // Reset to page 1 when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [projectsPerPage]);

  const fetchLecturerData = async () => {
    try {
      setLoading(true);

      const lecturerResponse = await fetch(`http://localhost:5000/api/users/lecturer/${email}`);
      if (!lecturerResponse.ok) throw new Error('Lecturer not found');
      const lecturerData = await lecturerResponse.json();
      setLecturer(lecturerData);

      const projectsResponse = await fetch(`http://localhost:5000/api/projects/lecturer/${email}`);
      if (!projectsResponse.ok) throw new Error('Failed to fetch projects');
      const projectsData = await projectsResponse.json();
      setApprovedProjects(projectsData);
      setFilteredProjects(projectsData);

    } catch (error) {
      console.error('Error fetching lecturer data:', error);
      toast.error('Failed to load lecturer profile');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...approvedProjects];

    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.author?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedYear !== "All Years") {
      filtered = filtered.filter(project => {
        const year = new Date(project.reviewedDate || project.date).getFullYear();
        return year.toString() === selectedYear;
      });
    }

    setFilteredProjects(filtered);
    setCurrentPage(1);
  };

  const getAvailableYears = () => {
    const years = approvedProjects.map(project => 
      new Date(project.reviewedDate || project.date).getFullYear()
    );
    return ["All Years", ...new Set(years)].sort((a, b) => {
      if (a === "All Years") return -1;
      if (b === "All Years") return 1;
      return b - a;
    });
  };

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const handleBackToLecturers = () => navigate('/lecturers');
  const handleViewProject = (projectId) => navigate(`/project/${projectId}`);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading lecturer profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!lecturer) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Lecturer Not Found</h2>
            <p className="text-gray-600 mb-4">The lecturer you're looking for doesn't exist.</p>
            <button
              onClick={handleBackToLecturers}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Back to Lecturers
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />

      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Back Button */}
        <button
          onClick={handleBackToLecturers}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Lecturers
        </button>

        <LecturerHeader 
          lecturer={lecturer} 
          projectCount={filteredProjects.length} 
        />

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Approved Projects</h2>

          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <ProjectsSearchFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              availableYears={getAvailableYears()}
            />

            {/* Items Per Page Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-600 whitespace-nowrap">
                Items per page:
              </label>
              <select
                id="itemsPerPage"
                value={projectsPerPage}
                onChange={(e) => setProjectsPerPage(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>

          {currentProjects.length === 0 ? (
            <EmptyProjectsState 
              searchQuery={searchQuery} 
              selectedYear={selectedYear} 
            />
          ) : (
            <div className="space-y-4">
              {currentProjects.map((project) => (
                <ApprovedProjectCard
                  key={project._id}
                  project={project}
                  onClick={() => handleViewProject(project._id)}
                />
              ))}
            </div>
          )}

          <ProjectsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            indexOfFirstProject={indexOfFirstProject}
            indexOfLastProject={indexOfLastProject}
            totalProjects={filteredProjects.length}
            onPageChange={paginate}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}