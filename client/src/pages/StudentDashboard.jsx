import { useMemo, useState } from 'react'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'
import {
  FaUpload,
  FaCheckCircle,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaPlus,
  FaEdit,
  FaTimes,
  FaCheck,
} from 'react-icons/fa'

const StudentDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [profileForm, setProfileForm] = useState({
    fullName: 'John Doe',
    email: 'johndoe@university.edu',
    studentId: 'STU2025-001234',
    major: 'Computer Science',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })

  const approvedProjects = [
    {
      id: 1,
      title: 'AI-Powered Learning Platform',
      description: 'Machine learning project focusing on personalized education.',
      status: 'Approved',
    },
    {
      id: 2,
      title: 'Blockchain Voting System',
      description: 'Secure digital voting platform using blockchain technology.',
      status: 'Approved',
    },
  ]

  const reviewProjects = [
    {
      id: 3,
      title: 'IoT Smart Home System',
      description: 'Internet of Things project for home automation.',
      status: 'In Progress',
    },
    {
      id: 4,
      title: 'Mobile Health Tracker',
      description: 'React Native app for personal health monitoring.',
      status: 'In Progress',
    },
  ]

  const revisionProjects = [
    {
      id: 5,
      title: 'E-commerce Web Platform',
      description: 'Full-stack web application for online shopping.',
      status: 'Needs Revision',
    },
    {
      id: 6,
      title: 'Data Visualization Tool',
      description: 'Python-based tool for business data analysis.',
      status: 'Needs Revision',
    },
  ]

  const passwordChecks = useMemo(
    () => ({
      length: profileForm.newPassword.length >= 8,
      uppercase: /[A-Z]/.test(profileForm.newPassword),
      lowercase: /[a-z]/.test(profileForm.newPassword),
      number: /[0-9]/.test(profileForm.newPassword),
    }),
    [profileForm.newPassword]
  )

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'badge badge-sm bg-green-100 text-green-700 border-0'
      case 'In Progress':
        return 'badge badge-sm bg-amber-100 text-amber-700 border-0'
      case 'Needs Revision':
        return 'badge badge-sm bg-rose-100 text-rose-700 border-0'
      default:
        return 'badge badge-sm'
    }
  }

  const renderProjectCard = (project, actionLabel) => (
    <div key={project.id} className="bg-white border border-base-300 rounded-xl p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-base-content">{project.title}</p>
        <p className="text-xs text-base-content/70">{project.description}</p>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={getStatusBadge(project.status)}>{project.status}</span>
        <button className="btn btn-xs bg-base-200 text-base-content border-base-300 hover:bg-base-300">
          {actionLabel}
        </button>
      </div>
    </div>
  )

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    closeModal()
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <Navbar />
      <main className="flex-grow py-10 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Profile header */}
          <section className="bg-base-100 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-20 rounded-full bg-base-200">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=student"
                    alt="Student Avatar"
                    className="w-20 h-20"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-base-content">John Doe</h2>
                <p className="text-sm text-base-content/70">johndoe@university.edu</p>
                <p className="text-sm text-base-content/70">Student ID: STU20225001</p>
                <p className="text-sm text-base-content/70">Computer Science Major</p>
              </div>
            </div>
            <button
              className="btn bg-base-200 text-base-content border-base-300 hover:bg-base-300"
              onClick={() => setIsModalOpen(true)}
            >
              <FaEdit className="mr-2" /> Edit Profile
            </button>
          </section>

          {/* Submit new project */}
          <section className="bg-base-100 rounded-2xl shadow-sm p-8 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center">
              <FaUpload className="w-8 h-8 text-base-content" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-base-content">Submit New Project</h3>
              <p className="text-base-content/70 text-sm">
                Upload your project proposal and supporting documents
              </p>
            </div>
            <button className="btn bg-black text-white hover:bg-black/90 gap-2">
              <FaPlus className="w-4 h-4" /> Start Uploading
            </button>
          </section>

          {/* Project sections */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-base-100 rounded-2xl shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 text-base-content">
                <FaCheckCircle className="text-green-500" />
                <h4 className="text-lg font-semibold">Approved Projects</h4>
              </div>
              <div className="space-y-4">
                {approvedProjects.map((project) => renderProjectCard(project, 'View'))}
              </div>
            </div>

            <div className="bg-base-100 rounded-2xl shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 text-base-content">
                <FaHourglassHalf className="text-amber-500" />
                <h4 className="text-lg font-semibold">In Review</h4>
              </div>
              <div className="space-y-4">
                {reviewProjects.map((project) => renderProjectCard(project, 'Edit'))}
              </div>
            </div>

            <div className="bg-base-100 rounded-2xl shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 text-base-content">
                <FaExclamationTriangle className="text-rose-500" />
                <h4 className="text-lg font-semibold">Need for Revision</h4>
              </div>
              <div className="space-y-4">
                {revisionProjects.map((project) => renderProjectCard(project, 'Revise'))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-3xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-base-300">
              <h3 className="text-xl font-semibold text-base-content">Edit Student Profile</h3>
              <button className="btn btn-ghost btn-sm btn-circle" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <form className="px-6 py-6 space-y-6" onSubmit={handleProfileSubmit}>
              <div className="flex flex-col items-center gap-3">
                <div className="avatar">
                  <div className="w-24 rounded-full bg-base-200">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=student"
                      alt="Student Avatar"
                      className="w-24 h-24"
                    />
                  </div>
                </div>
                <button type="button" className="text-sm text-base-content/70">
                  Click to change avatar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Full Name</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    className="input input-bordered w-full"
                    value={profileForm.fullName}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Email Address</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="input input-bordered w-full"
                    value={profileForm.email}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-base font-semibold text-base-content">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Current Password</span>
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      className="input input-bordered w-full"
                      value={profileForm.currentPassword}
                      onChange={handleFormChange}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">New Password</span>
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      className="input input-bordered w-full"
                      value={profileForm.newPassword}
                      onChange={handleFormChange}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Confirm New Password</span>
                    </label>
                    <input
                      type="password"
                      name="confirmNewPassword"
                      className="input input-bordered w-full"
                      value={profileForm.confirmNewPassword}
                      onChange={handleFormChange}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="bg-base-200 rounded-xl p-4 text-sm">
                  <p className="font-semibold mb-2 text-base-content">Password Requirements:</p>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      {passwordChecks.length ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-rose-500" />
                      )}
                      At least 8 characters long
                    </li>
                    <li className="flex items-center gap-2">
                      {passwordChecks.uppercase ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-rose-500" />
                      )}
                      Contains uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      {passwordChecks.lowercase ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-rose-500" />
                      )}
                      Contains lowercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      {passwordChecks.number ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-rose-500" />
                      )}
                      Contains number
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Student ID</span>
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    className="input input-bordered w-full"
                    value={profileForm.studentId}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Major</span>
                  </label>
                  <input
                    type="text"
                    name="major"
                    className="input input-bordered w-full"
                    value={profileForm.major}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-4">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn bg-black text-white hover:bg-black/90">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard

