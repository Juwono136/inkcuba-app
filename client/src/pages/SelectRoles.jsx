import { useNavigate } from 'react-router-dom'
import Header from '../common/Header'
import Footer from '../common/Footer'
import {
  FaGraduationCap,
  FaFileAlt,
  FaUserCog,
} from 'react-icons/fa'

const SelectRoles = () => {
  const navigate = useNavigate()

  const roles = [
    {
      id: 1,
      title: 'Student Portal',
      description: 'Showcase your projects that have been approved.',
      icon: FaGraduationCap,
      path: '/student-portal',
    },
    {
      id: 2,
      title: 'Lecturer Portal',
      description: 'Review and evaluate student projects that have been approved.',
      icon: FaFileAlt,
      path: '/lecturer-portal',
    },
    {
      id: 3,
      title: 'Admin Portal',
      description: 'Manage users and system settings.',
      icon: FaUserCog,
      path: '/admin-portal',
    },
  ]

  const handleRoleSelect = (path) => {
    navigate(path)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">
              Choose Your Role
            </h1>
            <p className="text-lg text-base-content/70">
              Please select whether you are a student, lecturer, or admin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => {
              const IconComponent = role.icon
              return (
                <div
                  key={role.id}
                  className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-base-300"
                  onClick={() => handleRoleSelect(role.path)}
                >
                  <div className="card-body items-center text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center mb-4">
                      <IconComponent className="w-10 h-10 text-base-content/70" />
                    </div>
                    <h2 className="card-title text-xl mb-2">{role.title}</h2>
                    <p className="text-sm text-base-content/70">
                      {role.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default SelectRoles

