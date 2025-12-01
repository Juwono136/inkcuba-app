import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Navbar from "../commons/Navbar";
import Footer from "../commons/Footer";
import Breadcrumb from "../commons/Breadcrumb";
import ProjectInfoSection from "../components/reviewProject-components/ProjectInfoSection";
import SubmitterInfoSection from "../components/reviewProject-components/SubmitterInfoSection";
import AcademicInfoSection from "../components/reviewProject-components/AcademicInfoSection";
import ProjectPreviewSection from "../components/reviewProject-components/ProjectPreviewSection";
import ProjectSubmissionSection from "../components/reviewProject-components/ProjectSubmissionSection";
import DocumentationSection from "../components/reviewProject-components/DocumentationSection";
import PreviousFeedbackSection from "../components/reviewProject-components/PreviousFeedbackSection";
import ReviewStatusCard from "../components/reviewProject-components/ReviewStatusCard";
import FeedbackForm from "../components/reviewProject-components/FeedbackForm";

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

export default function ReviewProjectSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Get simulated lecturer from localStorage 
  const [currentLecturer, setCurrentLecturer] = useState(() => {
    const saved = localStorage.getItem('simulatedLecturer');
    return saved ? JSON.parse(saved) : LECTURERS[0];
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

  // Check if current user can edit this project
  const canEditProject = () => {
    if (!project) return false;
    
    const assignedLecturer = project.assignedLecturerEmail || project.reviewedByEmail;
    
    return assignedLecturer === currentLecturer.email;
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/projects/${id}`);
      
      if (!response.ok) {
        throw new Error('Project not found');
      }
      
      const data = await response.json();
      setProject(data);
      
      // Pre-fill feedback if exists
      if (data.feedback) {
        setFeedback(data.feedback);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
      navigate('/lecturer-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status) => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback before submitting');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_URL}/api/projects/${id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          feedback: feedback.trim(),
          reviewedBy: currentLecturer.name,
          reviewedByEmail: currentLecturer.email,
          reviewedByRole: currentLecturer.role
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }

      const result = await response.json();
      
      toast.success(
        status === 'approved' 
          ? 'Project approved successfully!' 
          : 'Project sent back for revision'
      );
      
      setTimeout(() => {
        navigate('/lecturer-dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'S';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading project...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Project not found</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Home", path: "/" },
    { label: "Project Management", path: "/lecturer-dashboard" },
    { label: "Review Project Submission", path: `/review-project/${id}` }
  ];

  const isReviewed = project.status === 'approved' || project.status === 'needs_revision';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAFAFA' }}>
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <div className="mt-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Review Project Submission
              </h1>
              <p className="text-gray-600">
                Evaluate and provide feedback for this project submission
              </p>
            </div>
            
            {/* login state */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ProjectInfoSection project={project} formatDate={formatDate} />
            <SubmitterInfoSection project={project} getInitial={getInitial} />
            <AcademicInfoSection project={project} />
            <ProjectPreviewSection project={project} />
            <ProjectSubmissionSection project={project} />
            <DocumentationSection project={project} />
            {isReviewed && <PreviousFeedbackSection project={project} formatDate={formatDate} />}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <ReviewStatusCard project={project} />
              {canEditProject() && (
                <FeedbackForm
                  feedback={feedback}
                  setFeedback={setFeedback}
                  submitting={submitting}
                  onApprove={() => handleReview('approved')}
                  onReject={() => handleReview('needs_revision')}
                  onCancel={() => navigate('/lecturer-dashboard')}
                  isReviewed={isReviewed}
                  isApproved={project.status === 'approved'}
                  canEdit={canEditProject()}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
