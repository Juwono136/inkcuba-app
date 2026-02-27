import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../common/Breadcrumb';
import Loader from '../common/Loader';
import {
  FiGrid,
  FiUsers,
  FiBook,
  FiSend,
  FiFolder,
  FiMessageSquare,
  FiBarChart2,
  FiArrowRight,
  FiCalendar,
} from 'react-icons/fi';

export default function DashboardPage() {
  const { user, authLoading } = useSelector((state) => state.auth);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Loader size="lg" className="min-h-[50vh]" text="Loading..." />
        </main>
      </div>
    );
  }

  const role = user?.role;

  const adminSections = [
    { to: '/admin/users', title: 'User Management', desc: 'Create, edit, activate or deactivate users', icon: FiUsers },
    { to: '/admin/supervision', title: 'Supervision Monitoring', desc: 'Monitor submission status across workspaces', icon: FiBarChart2 },
    { to: '/admin/reports', title: 'Analytics & Reports', desc: 'Generate and view reports', icon: FiBarChart2 },
  ];

  const lecturerSections = [
    { to: '/lecturer/workspaces', title: 'My Workspaces', desc: 'Create and manage workspaces for courses', icon: FiGrid },
    { to: '/lecturer/students', title: 'Student List', desc: 'Upload via Excel or add students manually', icon: FiUsers },
    { to: '/lecturer/cards', title: 'Define Cards', desc: 'Create cards, set type & quantity, assign to students or groups', icon: FiBook },
    { to: '/lecturer/review', title: 'Review Submissions', desc: 'Review, approve or request revisions', icon: FiSend },
  ];

  const studentSections = [
    { to: '/student/workspace', title: 'My Workspace', desc: 'Enter your workspace and view assigned cards', icon: FiFolder },
    { to: '/student/submit', title: 'Submit Portfolio', desc: 'Submit project or portfolio content', icon: FiSend },
    { to: '/student/feedback', title: 'View Feedback', desc: 'See lecturer feedback and submit revisions', icon: FiMessageSquare },
  ];

  const sections = role === 'admin' ? adminSections : role === 'lecturer' ? lecturerSections : role === 'student' ? studentSections : [];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Dashboard' }]} />
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#303030]">
                Hello, {user?.name?.split(' ')[0]}
              </h1>
              <p className="text-[#303030]/60 mt-1">Welcome to your dashboard</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#303030]/50">
              <FiCalendar className="w-4 h-4" />
              {today}
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#3B613A]/8 text-[#3B613A] text-sm font-medium capitalize">
            {role}
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map(({ to, title, desc, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group relative bg-base-100 rounded-2xl border border-base-200/80 p-6 hover:shadow-lg hover:border-[#3B613A]/20 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-[#3B613A]/8 flex items-center justify-center mb-4 group-hover:bg-[#3B613A]/12 group-hover:scale-105 transition-all">
                <Icon className="w-6 h-6 text-[#3B613A]" />
              </div>
              <h2 className="text-lg font-semibold text-[#303030] group-hover:text-[#3B613A] transition-colors">{title}</h2>
              <p className="mt-1.5 text-sm text-[#303030]/60 leading-relaxed">{desc}</p>
              <div className="mt-4 flex items-center gap-1 text-[#3B613A] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Open <FiArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
