import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'
import {
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaStar,
  FaEye,
  FaEdit,
  FaPencilAlt,
  FaInfoCircle,
  FaChevronRight,
  FaExclamationTriangle,
} from 'react-icons/fa'

const ProjectStatus = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()

  // Mock project data - in a real app, this would come from an API
  const projectData = {
    1: {
      id: 1,
      title: 'AI-Powered Learning Platform',
      submissionDate: 'January 10, 2025',
      submissionId: '#SUB-2025-001',
      status: 'Approved',
      reviewer: null,
      steps: [
        {
          name: 'Submission Received',
          status: 'completed',
          description: 'Your project files have been successfully uploaded and received.',
          timestamp: 'Jan 10, 2025 at 2:30 PM',
        },
        {
          name: 'Initial Validation',
          status: 'completed',
          description: 'Project requirements and file formats have been validated.',
          timestamp: 'Jan 10, 2025 at 3:15 PM',
        },
        {
          name: 'Expert Review',
          status: 'completed',
          description: 'Your project has been reviewed and approved.',
          timestamp: 'Jan 12, 2025 at 10:00 AM',
        },
        {
          name: 'Final Approval',
          status: 'completed',
          description: 'Project has been approved and published.',
          timestamp: 'Jan 12, 2025 at 11:30 AM',
        },
      ],
    },
    2: {
      id: 2,
      title: 'Blockchain Voting System',
      submissionDate: 'January 8, 2025',
      submissionId: '#SUB-2025-002',
      status: 'Approved',
      reviewer: null,
      steps: [
        {
          name: 'Submission Received',
          status: 'completed',
          description: 'Your project files have been successfully uploaded and received.',
          timestamp: 'Jan 8, 2025 at 9:00 AM',
        },
        {
          name: 'Initial Validation',
          status: 'completed',
          description: 'Project requirements and file formats have been validated.',
          timestamp: 'Jan 8, 2025 at 9:45 AM',
        },
        {
          name: 'Expert Review',
          status: 'completed',
          description: 'Your project has been reviewed and approved.',
          timestamp: 'Jan 10, 2025 at 2:00 PM',
        },
        {
          name: 'Final Approval',
          status: 'completed',
          description: 'Project has been approved and published.',
          timestamp: 'Jan 10, 2025 at 3:30 PM',
        },
      ],
    },
    3: {
      id: 3,
      title: 'IoT Smart Home System',
      submissionDate: 'January 15, 2025',
      submissionId: '#SUB-2025-003',
      status: 'In Progress',
      reviewer: 'Mr James',
      steps: [
        {
          name: 'Submission Received',
          status: 'completed',
          description: 'Your project files have been successfully uploaded and received.',
          timestamp: 'Jan 15, 2025 at 2:30 PM',
        },
        {
          name: 'Initial Validation',
          status: 'completed',
          description: 'Project requirements and file formats have been validated.',
          timestamp: 'Jan 15, 2025 at 3:15 PM',
        },
        {
          name: 'Expert Review',
          status: 'in-progress',
          description: `Your project is currently being reviewed by ${'Mr James'}.`,
          timestamp: null,
        },
        {
          name: 'Final Approval',
          status: 'pending',
          description: 'Pending review completion.',
          timestamp: null,
        },
      ],
    },
    4: {
      id: 4,
      title: 'Mobile Health Tracker',
      submissionDate: 'January 18, 2025',
      submissionId: '#SUB-2025-004',
      status: 'In Progress',
      reviewer: 'Dr. Sarah',
      steps: [
        {
          name: 'Submission Received',
          status: 'completed',
          description: 'Your project files have been successfully uploaded and received.',
          timestamp: 'Jan 18, 2025 at 9:00 AM',
        },
        {
          name: 'Initial Validation',
          status: 'completed',
          description: 'Project requirements and file formats have been validated.',
          timestamp: 'Jan 18, 2025 at 9:45 AM',
        },
        {
          name: 'Expert Review',
          status: 'in-progress',
          description: `Your project is currently being reviewed by ${'Dr. Sarah'}.`,
          timestamp: null,
        },
        {
          name: 'Final Approval',
          status: 'pending',
          description: 'Pending review completion.',
          timestamp: null,
        },
      ],
    },
    5: {
      id: 5,
      title: 'E-commerce Web Platform',
      submissionDate: 'January 12, 2025',
      submissionId: '#SUB-2025-005',
      status: 'Needs Revision',
      reviewer: 'Mr James',
      steps: [
        {
          name: 'Submission Received',
          status: 'completed',
          description: 'Your project files have been successfully uploaded and received.',
          timestamp: 'Jan 12, 2025 at 10:00 AM',
        },
        {
          name: 'Initial Validation',
          status: 'completed',
          description: 'Project requirements and file formats have been validated.',
          timestamp: 'Jan 12, 2025 at 10:30 AM',
        },
        {
          name: 'Expert Review',
          status: 'completed',
          description: `Your project has been reviewed by ${'Mr James'}.`,
          timestamp: 'Jan 14, 2025 at 2:00 PM',
        },
        {
          name: 'Final Approval',
          status: 'revision',
          description: 'Revision required before final approval.',
          timestamp: null,
        },
      ],
    },
    6: {
      id: 6,
      title: 'Data Visualization Tool',
      submissionDate: 'January 8, 2025',
      submissionId: '#SUB-2025-006',
      status: 'Needs Revision',
      reviewer: 'Dr. Sarah',
      steps: [
        {
          name: 'Submission Received',
          status: 'completed',
          description: 'Your project files have been successfully uploaded and received.',
          timestamp: 'Jan 8, 2025 at 11:00 AM',
        },
        {
          name: 'Initial Validation',
          status: 'completed',
          description: 'Project requirements and file formats have been validated.',
          timestamp: 'Jan 8, 2025 at 11:45 AM',
        },
        {
          name: 'Expert Review',
          status: 'completed',
          description: `Your project has been reviewed by ${'Dr. Sarah'}.`,
          timestamp: 'Jan 10, 2025 at 3:00 PM',
        },
        {
          name: 'Final Approval',
          status: 'revision',
          description: 'Revision required before final approval.',
          timestamp: null,
        },
      ],
    },
  }

  const project = projectData[projectId]

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <Link to="/student-dashboard" className="btn bg-black text-white hover:bg-black/90">
              Back to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const getStatusBadge = (status) => {
    return 'badge badge-outline'
  }

  const getStepIcon = (stepStatus) => {
    switch (stepStatus) {
      case 'completed':
        return <FaCheckCircle className="w-5 h-5 text-black-500" />
      case 'in-progress':
        return <FaClock className="w-5 h-5 text-black-500" />
      case 'revision':
        return <FaExclamationTriangle className="w-5 h-5 text-black-500" />
      default:
        return <FaStar className="w-5 h-5 text-base-content/30" />
    }
  }

  const getStepCircleClass = (stepStatus) => {
    switch (stepStatus) {
      case 'completed':
        return 'w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center'
      case 'in-progress':
        return 'w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center'
      case 'revision':
        return 'w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center'
      default:
        return 'w-10 h-10 rounded-full bg-base-200 flex items-center justify-center'
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 px-4 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <Link to="/student-dashboard" className="hover:text-base-content">
              Dashboard
            </Link>
            <FaChevronRight className="w-3 h-3" />
            <span className="text-base-content">{project.title}</span>
            <FaChevronRight className="w-3 h-3" />
            <span className="text-base-content">Status</span>
          </div>

          {/* Project Status Card */}
          <div className="bg-base-100 rounded-lg shadow-md p-6 space-y-6">
            <div className="flex items-center gap-3">
              <FaFileAlt className="w-6 h-6 text-base-content" />
              <div>
                <h1 className="text-2xl font-bold text-base-content">
                  Project Submission Status
                </h1>
                <p className="text-sm text-base-content/70">
                  Track your latest submission progress
                </p>
              </div>
            </div>

            {/* Project Details */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-base-300">
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-base-content/70">Project Name:</span>
                  <span className="text-sm font-semibold text-base-content ml-2">
                    {project.title}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-base-content/70">Submission Date:</span>
                  <span className="text-sm font-semibold text-base-content ml-2">
                    {project.submissionDate}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-base-content/70">Submission ID:</span>
                  <span className="text-sm font-semibold text-base-content ml-2">
                    {project.submissionId}
                  </span>
                </div>
              </div>
              <div className={getStatusBadge(project.status)}>
                {project.status === 'In Progress' && (
                  <FaClock className="w-3 h-3 mr-1" />
                )}
                {project.status}
              </div>
            </div>

            {/* Submission Progress */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-base-content">
                Submission Progress
              </h3>
              <div className="space-y-4">
                {project.steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className={getStepCircleClass(step.status)}>
                      {getStepIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-base-content mb-1">{step.name}</h4>
                      <p className="text-sm text-base-content/70 mb-1">{step.description}</p>
                      {step.status === 'in-progress' && (
                        <span className="text-xs text-black-600 font-medium">In Progress</span>
                      )}
                      {step.timestamp && (
                        <p className="text-xs text-base-content/50 mt-1">{step.timestamp}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* View Details Button */}
            <div className="pt-4 border-t border-base-300">
              <button
                className="btn bg-base-200 text-base-content border-base-300 hover:bg-base-300"
                onClick={() => navigate(`/view-project/${project.id}`)}
              >
                <FaEye className="w-4 h-4 mr-2" />
                View Details
              </button>
            </div>
          </div>

          {/* Revision Alert Box */}
          {project.status === 'Needs Revision' && (
            <div className="bg-base-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="w-5 h-5 text-base-content/70 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-base-content mb-1">
                    Need to make changes?
                  </h4>
                  <p className="text-sm text-base-content/70">
                    You can submit a revised version while your current submission is under review.
                    The latest submission will be considered for evaluation.
                  </p>
                </div>
              </div>
              <button
                className="btn bg-black text-white hover:bg-black/90 gap-2 whitespace-nowrap"
                onClick={() => navigate(`/revise-project/${project.id}`)}
              >
                <FaPencilAlt className="w-4 h-4" />
                Revise Project
              </button>
            </div>
          )}

          {/* Edit Project Alert Box */}
          {project.status === 'In Progress' && (
            <div className="bg-base-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="w-5 h-5 text-base-content/70 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-base-content mb-1">
                    Project under review
                  </h4>
                  <p className="text-sm text-base-content/70">
                    Your project is currently being reviewed. You can still make edits to your
                    project files if needed.
                  </p>
                </div>
              </div>
              <button
                className="btn bg-black text-white hover:bg-black/90 gap-2 whitespace-nowrap"
                onClick={() => navigate(`/edit-project/${project.id}`)}
              >
                <FaEdit className="w-4 h-4" />
                Edit Project
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ProjectStatus

